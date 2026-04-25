const { initDb } = require("./db");
const { runSeed } = require("./seed");

const authRoutes = require("./routes/auth");
const issueRoutes = require("./routes/issues");
const matchRoutes = require("./routes/matches");
const communityRoutes = require("./routes/community");
const donationRoutes = require("./routes/donations");
const authRouter = require("./routes/auth");
const issueRouter = require("./routes/issues");
const matchRouter = require("./routes/matches");
const communityRouter = require("./routes/community");
const donationRouter = require("./routes/donations");

const app = express();
const PORT = process.env.PORT || 5000;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, name: "CivicBridge API" });
});

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

app.use("/api/auth", authRouter);
app.use("/api/issues", issueRouter);
app.use("/api/matches", matchRouter);
app.use("/api/community", communityRouter);
app.use("/api/donations", donationRouter);

function getMountPath(layer) {
  if (!layer.regexp) return "";
  const matches = layer.regexp.source.match(/\\\/[A-Za-z0-9_:-]+/g) || [];

function logRegisteredRoutes() {
  const routes = collectRoutes(app._router?.stack || []);

  console.log("Registered routes:");
  routes.forEach((route) => console.log(`  ${route}`));
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  runSeed(false);
  app.listen(PORT, () => {
    console.log(`CivicBridge backend running on http://localhost:${PORT}`);
    logRegisteredRoutes();
  });
async function startServer() {
  try {
    await initDb();
    await runSeed(false);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      logRegisteredRoutes();
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}


bootstrap().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
startServer();
