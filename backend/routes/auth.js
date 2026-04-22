const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { get, run } = require("../db");
const { normalizeRolePrefix, generateUniqueId } = require("../utils");
const { authRequired, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      user_type,
      pincode,
      skills = [],
      language = "",
      transport = "",
      availability = ""
    } = req.body;

    if (!name || !email || !password || !user_type || !pincode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await get("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);
    const prefix = normalizeRolePrefix(user_type);
    const anonymousId = await generateUniqueId(prefix, "users", "anonymous_id");

    const result = await run(
      `INSERT INTO users
      (anonymous_id, name, email, password_hash, user_type, pincode, skills, language, transport, availability)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        anonymousId,
        name,
        email.toLowerCase(),
        passwordHash,
        user_type,
        String(pincode),
        JSON.stringify(skills),
        language,
        transport,
        availability
      ]
    );

    const user = await get(
      "SELECT id, anonymous_id, user_type, pincode, skills, language, transport, availability FROM users WHERE id = ?",
      [result.lastID]
    );

    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userRecord = await get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!userRecord) return res.status(401).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, userRecord.password_hash);
    if (!valid) return res.status(401).json({ message: "Invalid credentials" });

    const user = {
      id: userRecord.id,
      anonymous_id: userRecord.anonymous_id,
      user_type: userRecord.user_type,
      pincode: userRecord.pincode,
      skills: userRecord.skills,
      language: userRecord.language,
      transport: userRecord.transport,
      availability: userRecord.availability
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ token, user });
  } catch (error) {
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
});

router.get("/me", authRequired, async (req, res) => {
  try {
    const user = await get(
      "SELECT id, anonymous_id, user_type, pincode, skills, language, transport, availability FROM users WHERE id = ?",
      [req.user.id]
    );
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
});

module.exports = router;
