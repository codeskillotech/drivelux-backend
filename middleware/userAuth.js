const jwt = require("jsonwebtoken");

// Assumption: your user token includes { id: userId, role: "USER" }
// If your payload differs, change decoded.id accordingly.
module.exports = function userAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) {
      return res.status(401).json({ message: "No token. Unauthorized." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // if you have roles, you can enforce it:
    // if (decoded.role && decoded.role !== "USER") ...

    req.user = { id: decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired token." });
  }
};
