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
  getPromoterSales,
  createPromoterSale,
  updatePromoterSaleStatus,
  deletePromoterSale,
} = require("../controllers/hierarchyController");
const {
  getDistricts,
  createDistrict,
  updateDistrict,
  deleteDistrict,
  getTaluks,
  createTaluk,
  updateTaluk,
  deleteTaluk,
  addTaluksBulk,
  addHoblisBulk,
  getHoblis,
  createHobli,
  updateHobli,
  deleteHobli,
} = require("../controllers/locationController");

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

// ── Locations: Districts ──
router.get("/districts", protect, adminOnly, getDistricts);
router.post("/districts", protect, adminOnly, createDistrict);
router.put("/districts/:id", protect, adminOnly, updateDistrict);
router.delete("/districts/:id", protect, adminOnly, deleteDistrict);

// ── Locations: Taluks ──
router.get("/taluks", protect, adminOnly, getTaluks);
router.post("/taluks", protect, adminOnly, createTaluk);
router.put("/taluks/:id", protect, adminOnly, updateTaluk);
router.delete("/taluks/:id", protect, adminOnly, deleteTaluk);
router.post("/taluks/bulk", protect, adminOnly, addTaluksBulk);

// ── Locations: Hoblis ──
router.get("/hoblis", protect, adminOnly, getHoblis);
router.post("/hoblis", protect, adminOnly, createHobli);
router.put("/hoblis/:id", protect, adminOnly, updateHobli);
router.delete("/hoblis/:id", protect, adminOnly, deleteHobli);
router.post("/hoblis/bulk", protect, adminOnly, addHoblisBulk);


// ── Promoter Sales ──
router.get("/promoter-sales", protect, adminOnly, getPromoterSales);
router.post("/promoter-sales", protect, adminOnly, createPromoterSale);
router.patch("/promoter-sales/:id/status", protect, adminOnly, updatePromoterSaleStatus);
router.delete("/promoter-sales/:id", protect, adminOnly, deletePromoterSale);

module.exports = router;
