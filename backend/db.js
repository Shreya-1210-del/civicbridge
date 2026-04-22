const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = path.join(__dirname, "civicbridge.db");
const db = new sqlite3.Database(DB_PATH);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

async function initDb() {
  await run("PRAGMA foreign_keys = ON");

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anonymous_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      user_type TEXT NOT NULL CHECK (user_type IN ('Volunteer', 'Community Member', 'NGO')),
      pincode TEXT NOT NULL,
      skills TEXT DEFAULT '[]',
      language TEXT DEFAULT '',
      transport TEXT DEFAULT '',
      availability TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      need_id TEXT UNIQUE NOT NULL,
      reporter_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      pincode TEXT NOT NULL,
      people_affected INTEGER NOT NULL,
      photo_path TEXT,
      online_resolvable INTEGER NOT NULL DEFAULT 0,
      urgency_tier TEXT NOT NULL,
      credibility_score INTEGER NOT NULL DEFAULT 30,
      status TEXT NOT NULL DEFAULT 'open',
      ngo_verified INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      volunteer_id INTEGER NOT NULL,
      match_score INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      contact_token TEXT,
      token_expiry DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS community_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_id INTEGER NOT NULL,
      pincode TEXT NOT NULL,
      content TEXT NOT NULL,
      post_type TEXT NOT NULL CHECK (post_type IN ('issue_update', 'announcement')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      volunteer_id INTEGER NOT NULL,
      badge_name TEXT NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(volunteer_id, badge_name),
      FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS pledges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      issue_id INTEGER NOT NULL,
      pledger_id INTEGER,
      amount_mock INTEGER NOT NULL DEFAULT 100,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (issue_id) REFERENCES issues(id) ON DELETE CASCADE,
      FOREIGN KEY (pledger_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `);
}

module.exports = {
  db,
  run,
  get,
  all,
  initDb,
  DB_PATH
};
