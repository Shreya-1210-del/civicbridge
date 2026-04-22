const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "civicbridge_dev_secret";

function authRequired(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function roleRequired(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.user_type)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  authRequired,
  roleRequired,
  JWT_SECRET
};
