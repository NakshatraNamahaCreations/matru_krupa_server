const jwt = require("jsonwebtoken");
const Staff = require("../models/Staff");
const HierarchyAdmin = require("../models/HierarchyAdmin");

const generateToken = (id) =>
  jwt.sign({ id, type: "staff" }, process.env.JWT_SECRET, { expiresIn: "7d" });

const generateHierarchyToken = (id) =>
  jwt.sign({ id, type: "hierarchy" }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/staff/login
const staffLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff || !(await staff.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!staff.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }
    staff.lastLogin = new Date();
    await staff.save({ validateBeforeSave: false });

    res.json({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      mobile: staff.mobile,
      role: staff.role,
      permissions: staff.permissions,
      avatar: staff.avatar,
      token: generateToken(staff._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/staff  (admin)
const getStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/staff  (admin — create new staff member)
const createStaff = async (req, res) => {
  try {
    const { name, email, mobile, password, role, permissions } = req.body;
    const exists = await Staff.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });
    const staff = await Staff.create({ name, email, mobile, password, role, permissions });
    res.status(201).json({ ...staff.toObject(), password: undefined });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/staff/:id  (admin)
const updateStaff = async (req, res) => {
  try {
    const { password, ...data } = req.body;
    const staff = await Staff.findById(req.params.id).select("+password");
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    Object.assign(staff, data);
    if (password) staff.password = password;
    await staff.save();
    const result = staff.toObject();
    delete result.password;
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/staff/:id/toggle  (admin)
const toggleStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    staff.isActive = !staff.isActive;
    await staff.save();
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/staff/:id  (super_admin only)
const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ message: "Staff not found" });
    res.json({ message: "Staff member deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/staff/hierarchy-login
const hierarchyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await HierarchyAdmin.findOne({ email }).select("+password");
    if (!admin || !admin.password || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (!admin.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });

    res.json({
      _id: admin._id,
      adminId: admin.adminId,
      name: admin.fullName,
      fullName: admin.fullName,
      email: admin.email,
      mobile: admin.mobile,
      role: admin.level,
      level: admin.level,
      district: admin.district,
      talukName: admin.talukName,
      userType: "hierarchy",
      token: generateHierarchyToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { staffLogin, hierarchyLogin, getStaff, createStaff, updateStaff, toggleStaff, deleteStaff };
