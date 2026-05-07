const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getCentralPrices,
  createCentralPrice,
  updateCentralPrice,
  deleteCentralPrice,
  getFranchiseTiers,
  createFranchiseTier,
  updateFranchiseTier,
  deleteFranchiseTier,
} = require("../controllers/pricingController");

// ── Central Price List ──
router.get("/central", protect, adminOnly, getCentralPrices);
router.post("/central", protect, adminOnly, createCentralPrice);
router.put("/central/:id", protect, adminOnly, updateCentralPrice);
router.delete("/central/:id", protect, adminOnly, deleteCentralPrice);

// ── Franchise Pricing Tiers ──
router.get("/franchise", protect, adminOnly, getFranchiseTiers);
router.post("/franchise", protect, adminOnly, createFranchiseTier);
router.put("/franchise/:id", protect, adminOnly, updateFranchiseTier);
router.delete("/franchise/:id", protect, adminOnly, deleteFranchiseTier);

module.exports = router;
