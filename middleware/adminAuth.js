const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function adminAuth(req, res, next) {
  try {
    const auth = req.headers.authorization || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "No token. Unauthorized." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden. Admin only." });
    }

    const admin = await Admin.findById(decoded.id).select("-passwordHash");
    if (!admin) return res.status(401).json({ message: "Admin not found." });

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/Expired token." });
  }
};
