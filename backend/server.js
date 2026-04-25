const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDb } = require("./db");
const { runSeed } = require("./seed");

const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issues");
const matchRoutes = require("./routes/matches");
const communityRoutes = require("./routes/community");
const donationRoutes = require("./routes/donations");

const app = express();
const PORT = process.env.PORT || 5000;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(
  cors({
    origin: ["https://civicbridge-frontend.vercel.app", "http://localhost:5173"],
    credentials: true
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/seed", async (req, res) => {
  if (req.query.key !== "civicbridge123") {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    await runSeed(true);
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/issues", issueRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/donations", donationRoutes);

async function bootstrap() {
  await initDb();
  await runSeed(false);
  app.listen(PORT, () => {
    console.log(`CivicBridge backend running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
