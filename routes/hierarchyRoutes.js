const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  toggleAdmin,
  deleteAdmin,
  getShops,
  createShop,
  deleteShop,
  getHobliStats,
  getCommissionRules,
  updateCommissionRule,
  getDistrictSplit,
  saveDistrictSplit,
} = require("../controllers/hierarchyController");

// ── Hierarchy Admins ──
router.get("/admins", protect, adminOnly, getAdmins);
router.get("/admins/:id", protect, adminOnly, getAdminById);
router.post("/admins", protect, adminOnly, createAdmin);
router.put("/admins/:id", protect, adminOnly, updateAdmin);
router.patch("/admins/:id/toggle", protect, adminOnly, toggleAdmin);
router.delete("/admins/:id", protect, adminOnly, deleteAdmin);

// ── Shops ──
router.get("/shops", protect, adminOnly, getShops);
router.post("/shops", protect, adminOnly, createShop);
router.delete("/shops/:id", protect, adminOnly, deleteShop);
router.get("/shops/hobli-stats", protect, adminOnly, getHobliStats);

// ── Commission Rules ──
router.get("/commission-rules", protect, adminOnly, getCommissionRules);
router.put("/commission-rules/:id", protect, adminOnly, updateCommissionRule);

// ── District Splits ──
router.get("/district-splits", protect, adminOnly, getDistrictSplit);
router.post("/district-splits", protect, adminOnly, saveDistrictSplit);

module.exports = router;
