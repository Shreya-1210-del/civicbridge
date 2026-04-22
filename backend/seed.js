const bcrypt = require("bcryptjs");
const { initDb, run, get, all } = require("./db");
const {
  getUrgencyTier,
  runMatchingForIssue
} = require("./utils");

async function resetTables() {
  await run("DELETE FROM pledges");
  await run("DELETE FROM badges");
  await run("DELETE FROM community_posts");
  await run("DELETE FROM matches");
  await run("DELETE FROM issues");
  await run("DELETE FROM users");
  await run("DELETE FROM sqlite_sequence WHERE name IN ('users','issues','matches','community_posts','badges','pledges')");
}

async function createUser(user) {
  const passwordHash = await bcrypt.hash(user.password || "password123", 10);
  const result = await run(
    `INSERT INTO users
      (anonymous_id, name, email, password_hash, user_type, pincode, skills, language, transport, availability)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.anonymous_id,
      user.name,
      user.email,
      passwordHash,
      user.user_type,
      user.pincode,
      JSON.stringify(user.skills || []),
      user.language || "",
      user.transport || "",
      user.availability || ""
    ]
  );
  return result.lastID;
}

async function createIssue(issue) {
  const result = await run(
    `INSERT INTO issues
      (need_id, reporter_id, category, description, pincode, people_affected, photo_path, online_resolvable, urgency_tier, credibility_score, status, ngo_verified, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      issue.need_id,
      issue.reporter_id,
      issue.category,
      issue.description,
      issue.pincode,
      issue.people_affected,
      issue.photo_path || null,
      issue.online_resolvable ? 1 : 0,
      getUrgencyTier(issue.category),
      issue.credibility_score,
      issue.status || "open",
      issue.ngo_verified ? 1 : 0,
      issue.created_at
    ]
  );
  return result.lastID;
}

async function seedDatabase(reset = true) {
  await initDb();
  if (reset) await resetTables();

  const existing = await get("SELECT COUNT(*) AS count FROM users");
  if (!reset && existing?.count > 0) {
    return { skipped: true };
  }

  const users = {};

  const baseUsers = [
    {
      anonymous_id: "VOL-10001",
      name: "Asha Rao",
      email: "vol1@civicbridge.local",
      user_type: "Volunteer",
      pincode: "560001",
      skills: ["medical", "first aid", "community outreach"],
      language: "Kannada,English",
      transport: "bike",
      availability: "daily-evening"
    },
    {
      anonymous_id: "VOL-10002",
      name: "Ravi Kumar",
      email: "vol2@civicbridge.local",
      user_type: "Volunteer",
      pincode: "560001",
      skills: ["food distribution", "logistics"],
      language: "Kannada,Hindi",
      transport: "scooter",
      availability: "weekends"
    },
    {
      anonymous_id: "VOL-10003",
      name: "Nina Das",
      email: "vol3@civicbridge.local",
      user_type: "Volunteer",
      pincode: "560002",
      skills: ["teaching", "education", "counseling"],
      language: "Kannada,English",
      transport: "none",
      availability: "daily-morning"
    },
    {
      anonymous_id: "VOL-10004",
      name: "Imran Ali",
      email: "vol4@civicbridge.local",
      user_type: "Volunteer",
      pincode: "560003",
      skills: ["sanitation", "public health", "disaster response"],
      language: "Kannada,Urdu",
      transport: "car",
      availability: "daily-full"
    },
    {
      anonymous_id: "VOL-10005",
      name: "Pooja Shah",
      email: "vol5@civicbridge.local",
      user_type: "Volunteer",
      pincode: "560003",
      skills: ["infrastructure", "maintenance", "livelihood"],
      language: "Kannada,English",
      transport: "bike",
      availability: "weekends-evening"
    },
    {
      anonymous_id: "ORG-20001",
      name: "Seva Trust",
      email: "ngo1@civicbridge.local",
      user_type: "NGO",
      pincode: "560001",
      skills: [],
      language: "Kannada",
      transport: "van",
      availability: "daily"
    },
    {
      anonymous_id: "ORG-20002",
      name: "Hope Collective",
      email: "ngo2@civicbridge.local",
      user_type: "NGO",
      pincode: "560002",
      skills: [],
      language: "Kannada",
      transport: "van",
      availability: "daily"
    },
    {
      anonymous_id: "ORG-20003",
      name: "Care Foundation",
      email: "ngo3@civicbridge.local",
      user_type: "NGO",
      pincode: "560003",
      skills: [],
      language: "Kannada",
      transport: "van",
      availability: "daily"
    },
    {
      anonymous_id: "USR-30001",
      name: "Kiran",
      email: "user1@civicbridge.local",
      user_type: "Community Member",
      pincode: "560001",
      skills: [],
      language: "Kannada",
      transport: "none",
      availability: "daily"
    },
    {
      anonymous_id: "USR-30002",
      name: "Meera",
      email: "user2@civicbridge.local",
      user_type: "Community Member",
      pincode: "560002",
      skills: [],
      language: "Kannada",
      transport: "none",
      availability: "daily"
    }
  ];

  for (const user of baseUsers) {
    const id = await createUser(user);
    users[user.anonymous_id] = id;
  }

  const now = new Date();
  const daysAgo = (n) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000).toISOString();

  const issueSeeds = [
    {
      need_id: "NEED-50001",
      reporter_id: users["USR-30001"],
      category: "Medical",
      description: "Elderly residents require immediate medicine delivery assistance.",
      pincode: "560001",
      people_affected: 12,
      online_resolvable: 1,
      ngo_verified: 1,
      credibility_score: 95,
      status: "open",
      created_at: daysAgo(1)
    },
    {
      need_id: "NEED-50002",
      reporter_id: users["USR-30001"],
      category: "Food",
      description: "Local shelter has a shortage of cooked meals for 40 people.",
      pincode: "560001",
      people_affected: 40,
      online_resolvable: 1,
      ngo_verified: 1,
      credibility_score: 90,
      status: "open",
      created_at: daysAgo(2)
    },
    {
      need_id: "NEED-50003",
      reporter_id: users["USR-30002"],
      category: "Education",
      description: "Need volunteer tutors for students preparing for board exams.",
      pincode: "560002",
      people_affected: 18,
      online_resolvable: 0,
      ngo_verified: 0,
      credibility_score: 68,
      status: "open",
      created_at: daysAgo(3)
    },
    {
      need_id: "NEED-50004",
      reporter_id: users["USR-30002"],
      category: "Sanitation",
      description: "Drain blockage near ward road causing stagnant water.",
      pincode: "560003",
      people_affected: 65,
      online_resolvable: 0,
      ngo_verified: 1,
      credibility_score: 88,
      status: "open",
      created_at: daysAgo(4)
    },
    {
      need_id: "NEED-50005",
      reporter_id: users["USR-30001"],
      category: "Infrastructure",
      description: "Streetlights not working for two lanes near school zone.",
      pincode: "560003",
      people_affected: 120,
      online_resolvable: 0,
      ngo_verified: 0,
      credibility_score: 62,
      status: "resolved",
      created_at: daysAgo(6)
    },
    {
      need_id: "NEED-50006",
      reporter_id: users["ORG-20001"],
      category: "Community Welfare",
      description: "Senior citizen support camp requires on-ground volunteers.",
      pincode: "560001",
      people_affected: 22,
      online_resolvable: 1,
      ngo_verified: 1,
      credibility_score: 92,
      status: "open",
      created_at: daysAgo(1.5)
    },
    {
      need_id: "NEED-50007",
      reporter_id: users["ORG-20002"],
      category: "Livelihood",
      description: "Need mentors for women self-help group business planning.",
      pincode: "560002",
      people_affected: 30,
      online_resolvable: 1,
      ngo_verified: 1,
      credibility_score: 86,
      status: "open",
      created_at: daysAgo(5)
    },
    {
      need_id: "NEED-50008",
      reporter_id: users["ORG-20003"],
      category: "Disaster",
      description: "Waterlogging relief needed after heavy rain in low-lying blocks.",
      pincode: "560003",
      people_affected: 50,
      online_resolvable: 0,
      ngo_verified: 1,
      credibility_score: 94,
      status: "resolved",
      created_at: daysAgo(7)
    }
  ];

  const issueIds = [];
  for (const issue of issueSeeds) {
    const id = await createIssue(issue);
    issueIds.push(id);
  }

  for (const issueId of issueIds) {
    await runMatchingForIssue(issueId);
  }

  const openMatches = await all(
    `SELECT m.id, i.need_id
     FROM matches m
     JOIN issues i ON i.id = m.issue_id
     WHERE i.need_id IN ('NEED-50001', 'NEED-50003', 'NEED-50004')
     ORDER BY m.match_score DESC`
  );
  if (openMatches[0]) {
    await run(
      "UPDATE matches SET status = 'accepted', contact_token = 'CBRIDGE1', token_expiry = datetime('now', '+48 hours') WHERE id = ?",
      [openMatches[0].id]
    );
  }

  const completedMatchRows = await all(
    `SELECT m.id
     FROM matches m
     JOIN issues i ON i.id = m.issue_id
     WHERE i.status = 'resolved'
     ORDER BY m.match_score DESC`
  );
  for (const row of completedMatchRows.slice(0, 3)) {
    await run("UPDATE matches SET status = 'completed' WHERE id = ?", [row.id]);
  }

  await run(
    `INSERT INTO community_posts (author_id, pincode, content, post_type)
     VALUES (?, '560001', 'Medical camp announced near Ward 9 community hall this Friday.', 'announcement')`,
    [users["ORG-20001"]]
  );
  await run(
    `INSERT INTO community_posts (author_id, pincode, content, post_type)
     VALUES (?, '560003', 'Flood-prep volunteer orientation at 5 PM today.', 'announcement')`,
    [users["ORG-20003"]]
  );

  return { ok: true };
}

if (require.main === module) {
  seedDatabase(true)
    .then(() => {
      console.log("Seeded CivicBridge database.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seed failed:", err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
