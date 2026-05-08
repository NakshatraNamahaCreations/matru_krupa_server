const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getFranchises,
  getFranchiseById,
  createFranchise,
  updateFranchise,
  toggleFranchise,
  deleteFranchise,
  onboardFromApplicationHandler,
} = require("../controllers/franchiseController");

router.get("/", protect, adminOnly, getFranchises);
router.get("/:id", protect, adminOnly, getFranchiseById);
router.post("/", protect, adminOnly, createFranchise);
router.post("/from-application/:appId", protect, adminOnly, onboardFromApplicationHandler);
router.put("/:id", protect, adminOnly, updateFranchise);
router.patch("/:id/toggle", protect, adminOnly, toggleFranchise);
router.delete("/:id", protect, adminOnly, deleteFranchise);

module.exports = router;
