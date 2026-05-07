const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Staff = require("../models/Staff");
const HierarchyAdmin = require("../models/HierarchyAdmin");

// Accepts tokens from customers (User), staff (Staff), and hierarchy admins
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type === "staff") {
      // Admin / staff token
      req.user = await Staff.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "Staff member not found" });
      if (!req.user.isActive) return res.status(401).json({ message: "Account is deactivated" });
      req.user.isStaff = true;
      req.userType = "staff";
    } else if (decoded.type === "hierarchy") {
      // Hierarchy admin token (District Admin, Taluk Admin, Promoter)
      req.user = await HierarchyAdmin.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "Hierarchy admin not found" });
      if (!req.user.isActive) return res.status(401).json({ message: "Account is deactivated" });
      req.user.isStaff = true;
      req.user.isHierarchy = true;
      req.userType = "hierarchy";
    } else {
      // Customer token
      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) return res.status(401).json({ message: "User not found" });
      if (!req.user.isActive) return res.status(401).json({ message: "Account is deactivated" });
      req.userType = "user";
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, invalid token" });
  }
};

// Staff OR admin user
const adminOnly = (req, res, next) => {
  if (req.user && (req.user.isStaff || req.user.role === "admin")) return next();
  res.status(403).json({ message: "Admin access required" });
};

// Super admin only
const superAdminOnly = (req, res, next) => {
  if (req.user && req.user.isStaff && req.user.role === "super_admin") return next();
  res.status(403).json({ message: "Super admin access required" });
};

module.exports = { protect, adminOnly, superAdminOnly };
