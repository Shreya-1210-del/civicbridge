const express = require("express");
const { all, get, run } = require("../db");
const { authRequired, roleRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/feed", async (req, res) => {
  try {
    const pincode = req.query.pincode ? String(req.query.pincode) : null;
    const params = [];
    let where = "";
    if (pincode) {
      where = "WHERE i.pincode = ?";
      params.push(pincode);
    }

    const issues = await all(
      `SELECT i.need_id, i.category, i.urgency_tier, i.status, i.pincode, i.created_at
      FROM issues i
      ${where}
      ORDER BY i.created_at DESC
      LIMIT 30`,
      params
    );

    const announcements = await all(
      `SELECT cp.id, cp.pincode, cp.content, cp.created_at, u.anonymous_id AS author_anonymous_id
      FROM community_posts cp
      JOIN users u ON u.id = cp.author_id
      WHERE cp.post_type = 'announcement' ${pincode ? "AND cp.pincode = ?" : ""}
      ORDER BY cp.created_at DESC
      LIMIT 10`,
      pincode ? [pincode] : []
    );

    const volunteerCountRow = await get(
      `SELECT COUNT(*) AS count
       FROM users
       WHERE user_type = 'Volunteer' ${pincode ? "AND pincode = ?" : ""}`,
      pincode ? [pincode] : []
    );

    return res.json({
      issues,
      announcements,
      active_volunteers: volunteerCountRow?.count || 0
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch feed", error: error.message });
  }
});

router.post("/posts", authRequired, roleRequired(["NGO"]), async (req, res) => {
  try {
    const { content, pincode } = req.body;
    if (!content || !pincode) return res.status(400).json({ message: "content and pincode are required" });

    const result = await run(
      `INSERT INTO community_posts (author_id, pincode, content, post_type)
       VALUES (?, ?, ?, 'announcement')`,
      [req.user.id, String(pincode), content]
    );
    const created = await get("SELECT * FROM community_posts WHERE id = ?", [result.lastID]);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: "Failed to post announcement", error: error.message });
  }
});

router.get("/ngo/dashboard", authRequired, roleRequired(["NGO"]), async (req, res) => {
  try {
    const postedByNgo = await all(
      `SELECT need_id, category, pincode, status, urgency_tier, credibility_score, ngo_verified, created_at
      FROM issues
      WHERE reporter_id = ?
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    const areaIssues = await all(
      `SELECT need_id, category, status, urgency_tier, credibility_score, ngo_verified, created_at
      FROM issues
      WHERE pincode = ?
      ORDER BY created_at DESC`,
      [req.user.pincode]
    );

    const matches = await all(
      `SELECT
        i.need_id, i.category, m.match_score, m.status,
        u.anonymous_id AS volunteer_anonymous_id
      FROM issues i
      JOIN matches m ON m.issue_id = i.id
      JOIN users u ON u.id = m.volunteer_id
      WHERE i.reporter_id = ?
      ORDER BY i.created_at DESC, m.match_score DESC`,
      [req.user.id]
    );

    return res.json({
      postedByNgo,
      areaIssues,
      matchResults: matches
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch NGO dashboard", error: error.message });
  }
});

router.get("/heatmap", async (req, res) => {
  try {
    const { category, urgency } = req.query;
    const conditions = [];
    const params = [];
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    if (urgency) {
      conditions.push("urgency_tier = ?");
      params.push(urgency);
    }
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await all(
      `SELECT
        pincode,
        COUNT(*) AS issue_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved_count
      FROM issues
      ${where}
      GROUP BY pincode`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch heatmap data", error: error.message });
  }
});

module.exports = router;
