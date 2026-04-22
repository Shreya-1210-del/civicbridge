const express = require("express");
const { all, get, run } = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/online-needs", async (_req, res) => {
  try {
    const issues = await all(
      `SELECT
        i.id, i.need_id, i.category, i.description, i.people_affected, i.credibility_score,
        COUNT(p.id) AS total_pledges,
        COALESCE(SUM(p.amount_mock), 0) AS pledged_amount
      FROM issues i
      LEFT JOIN pledges p ON p.issue_id = i.id
      WHERE i.online_resolvable = 1 AND i.status != 'resolved'
      GROUP BY i.id
      ORDER BY i.created_at DESC`
    );

    const enriched = issues.map((issue) => {
      const fundingGoal = Math.max(issue.people_affected * 100, 1000);
      const progress = Math.min(Math.round((issue.pledged_amount / fundingGoal) * 100), 100);
      return {
        ...issue,
        fundingGoal,
        progress
      };
    });

    return res.json(enriched);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch online resolvable issues", error: error.message });
  }
});

router.post("/pledge/:needId", authRequired, async (req, res) => {
  try {
    const issue = await get("SELECT * FROM issues WHERE need_id = ?", [req.params.needId]);
    if (!issue) return res.status(404).json({ message: "Issue not found" });
    if (!issue.online_resolvable) return res.status(400).json({ message: "Issue is not eligible for online action" });

    const amount = Number(req.body.amount_mock || 100);
    await run("INSERT INTO pledges (issue_id, pledger_id, amount_mock) VALUES (?, ?, ?)", [issue.id, req.user.id, amount]);

    const totals = await get(
      "SELECT COUNT(*) AS total_pledges, COALESCE(SUM(amount_mock), 0) AS pledged_amount FROM pledges WHERE issue_id = ?",
      [issue.id]
    );
    return res.status(201).json(totals);
  } catch (error) {
    return res.status(500).json({ message: "Pledge failed", error: error.message });
  }
});

module.exports = router;
