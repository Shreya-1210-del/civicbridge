const express = require("express");
const path = require("path");
const { initDb } = require("./db");
const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issues");
const matchRoutes = require("./routes/matches");
const communityRoutes = require("./routes/community");
const donationRoutes = require("./routes/donations");
const { runSeed } = require("./seed");

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, name: "CivicBridge API" });
});

app.get("/api/seed", async (req, res) => {
  if (req.query.key !== "civicbridge123") {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    await runSeed(true);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/donations", donationRoutes);

async function startServer() {
  await initDb();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
