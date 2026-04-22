const express = require("express");
const { all, get, run } = require("../db");
const { authRequired, roleRequired } = require("../middleware/auth");
const { generateContactToken } = require("../utils");

const router = express.Router();

router.get("/volunteer/dashboard", authRequired, roleRequired(["Volunteer"]), async (req, res) => {
  try {
    const matches = await all(
      `SELECT
        m.id, m.match_score, m.status, m.contact_token, m.token_expiry, m.created_at,
        i.need_id, i.category, i.description, i.people_affected, i.urgency_tier, i.status AS issue_status, i.pincode
      FROM matches m
      JOIN issues i ON i.id = m.issue_id
      WHERE m.volunteer_id = ?
      ORDER BY m.created_at DESC`,
      [req.user.id]
    );

    const pending = matches.filter((m) => m.status === "pending");
    const active = matches.filter((m) => m.status === "accepted" && m.issue_status !== "resolved");
    const completed = matches.filter((m) => m.status === "completed" || m.issue_status === "resolved");

    const stats = await get(
      `SELECT
        SUM(CASE WHEN m.status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN m.status = 'completed' THEN i.people_affected ELSE 0 END) AS people_helped
      FROM matches m
      JOIN issues i ON i.id = m.issue_id
      WHERE m.volunteer_id = ?`,
      [req.user.id]
    );

    const badges = await all("SELECT badge_name, awarded_at FROM badges WHERE volunteer_id = ? ORDER BY awarded_at DESC", [
      req.user.id
    ]);

    const hoursContributed = (stats?.completed_count || 0) * 3;

    return res.json({
      pending,
      active,
      completed,
      impact: {
        total_tasks_completed: stats?.completed_count || 0,
        people_helped: stats?.people_helped || 0,
        hours_contributed: hoursContributed
      },
      badges
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch volunteer dashboard", error: error.message });
  }
});

router.patch("/:matchId/respond", authRequired, roleRequired(["Volunteer"]), async (req, res) => {
  try {
    const { action } = req.body;
    if (!["accept", "decline"].includes(action)) {
      return res.status(400).json({ message: "Invalid action" });
    }

    const match = await get("SELECT * FROM matches WHERE id = ? AND volunteer_id = ?", [req.params.matchId, req.user.id]);
    if (!match) return res.status(404).json({ message: "Match not found" });

    if (action === "decline") {
      await run("UPDATE matches SET status = 'declined' WHERE id = ?", [match.id]);
    } else {
      const token = generateContactToken();
      await run(
        `UPDATE matches
         SET status = 'accepted', contact_token = ?, token_expiry = datetime('now', '+48 hours')
         WHERE id = ?`,
        [token, match.id]
      );
    }

    const updated = await get("SELECT * FROM matches WHERE id = ?", [match.id]);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Failed to update match", error: error.message });
  }
});

router.get("/community/assigned", authRequired, roleRequired(["Community Member", "NGO"]), async (req, res) => {
  try {
    const rows = await all(
      `SELECT
        i.need_id, i.status AS issue_status, i.category,
        u.anonymous_id AS volunteer_anonymous_id,
        m.status AS match_status, m.contact_token, m.token_expiry
      FROM issues i
      LEFT JOIN matches m ON m.issue_id = i.id AND m.status = 'accepted'
      LEFT JOIN users u ON u.id = m.volunteer_id
      WHERE i.reporter_id = ?
      ORDER BY i.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch assigned volunteers", error: error.message });
  }
});

module.exports = router;
