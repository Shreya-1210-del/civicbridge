const express = require("express");
const path = require("path");
const multer = require("multer");
const { all, get, run } = require("../db");
const { authRequired, roleRequired } = require("../middleware/auth");
const {
  generateUniqueId,
  getUrgencyTier,
  calculateCredibilityScore,
  runMatchingForIssue,
  parseSkills
} = require("../utils");

const router = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`);
    }
  })
});

const BADGE_BY_CATEGORY = {
  Medical: "First Responder",
  Food: "Hunger Relief Champion",
  Disaster: "Disaster Support Hero",
  Education: "Learning Ally",
  Sanitation: "Cleanliness Guardian",
  Infrastructure: "Fix-It Volunteer",
  Livelihood: "Livelihood Mentor",
  "Community Welfare": "Community Care Star"
};

async function maybeAwardBadge(volunteerId, category) {
  const badgeName = BADGE_BY_CATEGORY[category];
  if (!badgeName) return;

  const row = await get(
    `SELECT COUNT(*) AS count
     FROM matches m
     JOIN issues i ON i.id = m.issue_id
     WHERE m.volunteer_id = ? AND m.status = 'completed' AND i.category = ?`,
    [volunteerId, category]
  );

  if ((row?.count || 0) >= 3) {
    await run("INSERT OR IGNORE INTO badges (volunteer_id, badge_name) VALUES (?, ?)", [volunteerId, badgeName]);
  }
}

router.get("/", async (req, res) => {
  try {
    const { pincode, category, urgency, onlineOnly } = req.query;
    const where = [];
    const params = [];

    if (pincode) {
      where.push("i.pincode = ?");
      params.push(String(pincode));
    }
    if (category) {
      where.push("i.category = ?");
      params.push(category);
    }
    if (urgency) {
      where.push("i.urgency_tier = ?");
      params.push(urgency);
    }
    if (onlineOnly === "1") {
      where.push("i.online_resolvable = 1");
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const issues = await all(
      `SELECT
        i.id, i.need_id, i.category, i.description, i.pincode, i.people_affected, i.photo_path,
        i.online_resolvable, i.urgency_tier, i.credibility_score, i.status, i.created_at,
        u.anonymous_id AS reporter_anonymous_id, u.user_type AS reporter_type
      FROM issues i
      JOIN users u ON u.id = i.reporter_id
      ${whereSql}
      ORDER BY i.created_at DESC`,
      params
    );
    return res.json(issues);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch issues", error: error.message });
  }
});

router.get("/reporter/my", authRequired, async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, need_id, category, description, pincode, people_affected, urgency_tier, credibility_score, status, created_at
      FROM issues WHERE reporter_id = ?
      ORDER BY created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reporter issues", error: error.message });
  }
});

router.post("/", authRequired, upload.single("photo"), async (req, res) => {
  try {
    const { category, description, pincode, people_affected, online_resolvable } = req.body;
    if (!category || !description || !pincode || !people_affected) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const needId = await generateUniqueId("NEED", "issues", "need_id");
    const urgencyTier = getUrgencyTier(category);
    const hasPhoto = Boolean(req.file);
    const credibilityScore = await calculateCredibilityScore({
      reporterId: req.user.id,
      category,
      pincode: String(pincode),
      hasPhoto,
      ngoVerified: 0
    });

    const result = await run(
      `INSERT INTO issues
      (need_id, reporter_id, category, description, pincode, people_affected, photo_path, online_resolvable, urgency_tier, credibility_score, status, ngo_verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', 0)`,
      [
        needId,
        req.user.id,
        category,
        description,
        String(pincode),
        Number(people_affected),
        req.file ? `/uploads/${req.file.filename}` : null,
        online_resolvable === "true" || online_resolvable === true ? 1 : 0,
        urgencyTier,
        credibilityScore
      ]
    );

    await runMatchingForIssue(result.lastID);
    const created = await get("SELECT * FROM issues WHERE id = ?", [result.lastID]);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create issue", error: error.message });
  }
});

router.patch("/:needId/resolve", authRequired, async (req, res) => {
  try {
    const issue = await get("SELECT * FROM issues WHERE need_id = ?", [req.params.needId]);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (req.user.user_type !== "Community Member" && req.user.user_type !== "NGO") {
      return res.status(403).json({ message: "Only reporter-side roles can mark resolved" });
    }
    if (req.user.user_type === "Community Member" && issue.reporter_id !== req.user.id) {
      return res.status(403).json({ message: "You can only resolve your own issues" });
    }
    if (req.user.user_type === "NGO" && String(req.user.pincode) !== String(issue.pincode)) {
      return res.status(403).json({ message: "NGO can resolve issues only in its pincode area" });
    }

    await run("UPDATE issues SET status = 'resolved' WHERE id = ?", [issue.id]);
    const acceptedMatches = await all(
      "SELECT volunteer_id FROM matches WHERE issue_id = ? AND status = 'accepted'",
      [issue.id]
    );

    for (const m of acceptedMatches) {
      await run(
        "UPDATE matches SET status = 'completed', token_expiry = datetime('now', '-1 hour') WHERE issue_id = ? AND volunteer_id = ?",
        [issue.id, m.volunteer_id]
      );
      await maybeAwardBadge(m.volunteer_id, issue.category);
    }

    const updated = await get("SELECT * FROM issues WHERE id = ?", [issue.id]);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to resolve issue", error: error.message });
  }
});

router.patch("/:needId/verify", authRequired, roleRequired(["NGO"]), async (req, res) => {
  try {
    const issue = await get("SELECT * FROM issues WHERE need_id = ?", [req.params.needId]);
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    if (String(issue.pincode) !== String(req.user.pincode)) {
      return res.status(403).json({ message: "NGO can verify only own pincode area issues" });
    }

    const recalculated = await calculateCredibilityScore({
      reporterId: issue.reporter_id,
      category: issue.category,
      pincode: issue.pincode,
      hasPhoto: Boolean(issue.photo_path),
      ngoVerified: 1
    });

    await run("UPDATE issues SET ngo_verified = 1, credibility_score = ? WHERE id = ?", [recalculated, issue.id]);
    const updated = await get("SELECT * FROM issues WHERE id = ?", [issue.id]);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Verification failed", error: error.message });
  }
});

router.get("/:needId", async (req, res) => {
  try {
    const issue = await get(
      `SELECT
        i.*,
        u.anonymous_id AS reporter_anonymous_id,
        u.user_type AS reporter_type
      FROM issues i
      JOIN users u ON u.id = i.reporter_id
      WHERE i.need_id = ?`,
      [req.params.needId]
    );
    if (!issue) return res.status(404).json({ message: "Issue not found" });

    const matches = await all(
      `SELECT
        m.id, m.match_score, m.status, m.contact_token, m.token_expiry,
        u.anonymous_id AS volunteer_anonymous_id, u.skills
      FROM matches m
      JOIN users u ON u.id = m.volunteer_id
      WHERE m.issue_id = ?
      ORDER BY m.match_score DESC`,
      [issue.id]
    );

    const formatted = matches.map((m) => ({
      ...m,
      skills: parseSkills(m.skills)
    }));

    return res.json({ ...issue, matches: formatted });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch issue detail", error: error.message });
  }
});

module.exports = router;
