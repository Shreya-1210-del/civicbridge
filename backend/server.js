const express = require("express");
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

function getMountPath(layer) {
  if (!layer.regexp) return "";
  const matches = layer.regexp.source.match(/\\\/[A-Za-z0-9_:-]+/g) || [];
  return matches.map((part) => part.replace(/\\\//g, "/")).join("");
}

function joinRoutePath(prefix, routePath) {
  if (routePath === "/") return prefix || "/";
  return `${prefix}${routePath}`.replace(/\/+/g, "/");
}

function collectRoutes(stack, prefix = "") {
  const routes = [];

  stack.forEach((layer) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map((method) => method.toUpperCase())
        .join(", ");
      routes.push(`${methods} ${joinRoutePath(prefix, layer.route.path)}`);
      return;
    }

    if (layer.name === "router" && layer.handle?.stack) {
      routes.push(...collectRoutes(layer.handle.stack, `${prefix}${getMountPath(layer)}`));
    }
  });

  return routes;
}

function logRegisteredRoutes() {
  const routes = collectRoutes(app._router?.stack || []);
  console.log("Registered routes:");
  routes.forEach((route) => console.log(`  ${route}`));
}

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  await runSeed(false);
  app.listen(PORT, () => {
    console.log(`CivicBridge backend running on http://localhost:${PORT}`);
    logRegisteredRoutes();
  });
}


bootstrap().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});
