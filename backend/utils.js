const crypto = require("crypto");
const { all, get, run } = require("./db");

const CATEGORY_URGENCY = {
  Medical: "Tier 1 (Critical)",
  Food: "Tier 1 (Critical)",
  Disaster: "Tier 1 (Critical)",
  Education: "Tier 2 (High)",
  Sanitation: "Tier 2 (High)",
  "Community Welfare": "Tier 2 (High)",
  Infrastructure: "Tier 3 (Medium)",
  Livelihood: "Tier 3 (Medium)"
};

const CATEGORY_SKILL = {
  Medical: ["medical", "first aid", "healthcare"],
  Food: ["food distribution", "logistics", "nutrition"],
  Disaster: ["disaster response", "rescue", "coordination"],
  Education: ["teaching", "mentoring", "education"],
  Sanitation: ["sanitation", "hygiene", "public health"],
  Infrastructure: ["construction", "engineering", "maintenance"],
  Livelihood: ["job support", "microfinance", "counseling"],
  "Community Welfare": ["community outreach", "social work", "counseling"]
};

const PINCODE_LANGUAGE = {
  "560001": "Kannada",
  "560002": "Kannada",
  "560003": "Kannada",
  "110001": "Hindi",
  "110002": "Hindi",
  "400001": "Marathi",
  "400002": "Marathi",
  "600001": "Tamil"
};

function normalizeRolePrefix(userType) {
  if (userType === "Volunteer") return "VOL";
  if (userType === "NGO") return "ORG";
  return "USR";
}

async function generateUniqueId(prefix, table, column) {
  for (;;) {
    const value = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
    const exists = await get(`SELECT id FROM ${table} WHERE ${column} = ?`, [value]);
    if (!exists) return value;
  }
}

function getUrgencyTier(category) {
  return CATEGORY_URGENCY[category] || "Tier 3 (Medium)";
}

async function calculateCredibilityScore({ reporterId, category, pincode, hasPhoto, ngoVerified }) {
  let score = 30;
  if (hasPhoto) score += 25;

  const reporterResolved = await get(
    "SELECT COUNT(*) as count FROM issues WHERE reporter_id = ? AND status = 'resolved'",
    [reporterId]
  );
  if ((reporterResolved?.count || 0) > 0) score += 20;

  const duplicateRecent = await get(
    `SELECT COUNT(*) as count
      FROM issues
      WHERE category = ?
        AND pincode = ?
        AND created_at >= datetime('now', '-7 days')`,
    [category, pincode]
  );
  if ((duplicateRecent?.count || 0) > 0) score += 30;

  if (ngoVerified) score += 25;

  return Math.min(score, 100);
}

function parseSkills(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map((s) => String(s).toLowerCase());
  } catch (_err) {
    return String(raw)
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
  }
  return [];
}

async function getCompletionRate(volunteerId) {
  const row = await get(
    `SELECT
      SUM(CASE WHEN status IN ('accepted', 'completed') THEN 1 ELSE 0 END) AS assigned,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS done
    FROM matches
    WHERE volunteer_id = ?`,
    [volunteerId]
  );
  const assigned = row?.assigned || 0;
  const done = row?.done || 0;
  if (!assigned) return 0;
  return (done / assigned) * 100;
}

function availabilityMatch(availability = "", urgencyTier = "") {
  const val = availability.toLowerCase();
  if (urgencyTier.includes("Tier 1")) return val.includes("full") || val.includes("daily") || val.includes("evening");
  if (urgencyTier.includes("Tier 2")) return val.includes("evening") || val.includes("weekend") || val.includes("daily");
  return val.length > 0;
}

function getAdjacentPincodes(pincode) {
  const parsed = Number(pincode);
  if (Number.isNaN(parsed)) return [];
  return [String(parsed - 1), String(parsed + 1)];
}

async function scoreVolunteer(volunteer, issue) {
  let score = 0;
  if (volunteer.pincode === issue.pincode) score += 30;

  const skills = parseSkills(volunteer.skills);
  const expected = CATEGORY_SKILL[issue.category] || [];
  if (skills.some((s) => expected.some((e) => s.includes(e)))) score += 25;

  if (availabilityMatch(volunteer.availability, issue.urgency_tier)) score += 20;

  const expectedLanguage = PINCODE_LANGUAGE[issue.pincode] || "";
  if (
    expectedLanguage &&
    volunteer.language &&
    volunteer.language.toLowerCase().includes(expectedLanguage.toLowerCase())
  ) {
    score += 10;
  }

  const completionRate = await getCompletionRate(volunteer.id);
  if (completionRate > 80) score += 10;

  if (volunteer.transport && volunteer.transport.toLowerCase() !== "none") score += 5;

  return score;
}

async function runMatchingForIssue(issueId) {
  const issue = await get("SELECT * FROM issues WHERE id = ?", [issueId]);
  if (!issue) return [];

  let volunteers = await all(
    "SELECT * FROM users WHERE user_type = 'Volunteer' AND pincode = ?",
    [issue.pincode]
  );

  if (!volunteers.length) {
    const adjacent = getAdjacentPincodes(issue.pincode);
    if (adjacent.length) {
      volunteers = await all(
        "SELECT * FROM users WHERE user_type = 'Volunteer' AND pincode IN (?, ?)",
        adjacent
      );
    }
  }

  const scored = [];
  for (const volunteer of volunteers) {
    const matchScore = await scoreVolunteer(volunteer, issue);
    scored.push({ volunteer, matchScore });
  }

  scored.sort((a, b) => b.matchScore - a.matchScore);
  const topThree = scored.slice(0, 3);

  await run("DELETE FROM matches WHERE issue_id = ?", [issueId]);
  for (const item of topThree) {
    await run(
      `INSERT INTO matches (issue_id, volunteer_id, match_score, status)
       VALUES (?, ?, ?, 'pending')`,
      [issueId, item.volunteer.id, item.matchScore]
    );
  }

  return topThree;
}

function generateContactToken() {
  return crypto.randomBytes(6).toString("base64url").slice(0, 8).toUpperCase();
}

module.exports = {
  CATEGORY_URGENCY,
  CATEGORY_SKILL,
  normalizeRolePrefix,
  generateUniqueId,
  getUrgencyTier,
  calculateCredibilityScore,
  runMatchingForIssue,
  generateContactToken,
  parseSkills
};
