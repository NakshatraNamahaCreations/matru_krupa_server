const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  staffLogin,
  getStaff,
  createStaff,
  updateStaff,
  toggleStaff,
  deleteStaff,
} = require("../controllers/staffController");

// Public — staff login
router.post("/login", staffLogin);

// Admin protected
router.get("/", protect, adminOnly, getStaff);
router.post("/",   createStaff);
router.put("/:id", protect, adminOnly, updateStaff);
router.patch("/:id/toggle", protect, adminOnly, toggleStaff);
router.delete("/:id", protect, adminOnly, deleteStaff);

module.exports = router;
