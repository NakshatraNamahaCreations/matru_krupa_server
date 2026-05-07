const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  getCentralStock,
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  getReorderSuggestions,
  createReorderSuggestion,
  updateReorderSuggestion,
  toggleReorderSuggestion,
  deleteReorderSuggestion,
  getBinRackMappings,
  createBinRackMapping,
  updateBinRackMapping,
  deleteBinRackMapping,
  getDamageReports,
  createDamageReport,
  updateDamageReport,
  updateDamageReportStatus,
  deleteDamageReport,
} = require("../controllers/inventoryController");

// ── Central Stock ──
router.get("/central-stock", protect, adminOnly, getCentralStock);

// ── Reservations ──
router.get("/reservations", protect, adminOnly, getReservations);
router.post("/reservations", protect, adminOnly, createReservation);
router.put("/reservations/:id", protect, adminOnly, updateReservation);
router.delete("/reservations/:id", protect, adminOnly, deleteReservation);

// ── Reorder Suggestions ──
router.get("/reorder-suggestions", protect, adminOnly, getReorderSuggestions);
router.post("/reorder-suggestions", protect, adminOnly, createReorderSuggestion);
router.put("/reorder-suggestions/:id", protect, adminOnly, updateReorderSuggestion);
router.patch("/reorder-suggestions/:id/toggle", protect, adminOnly, toggleReorderSuggestion);
router.delete("/reorder-suggestions/:id", protect, adminOnly, deleteReorderSuggestion);

// ── Bin/Rack Mapping ──
router.get("/bin-rack", protect, adminOnly, getBinRackMappings);
router.post("/bin-rack", protect, adminOnly, createBinRackMapping);
router.put("/bin-rack/:id", protect, adminOnly, updateBinRackMapping);
router.delete("/bin-rack/:id", protect, adminOnly, deleteBinRackMapping);

// ── Damage Reports ──
router.get("/damage-reports", protect, adminOnly, getDamageReports);
router.post("/damage-reports", protect, adminOnly, createDamageReport);
router.put("/damage-reports/:id", protect, adminOnly, updateDamageReport);
router.patch("/damage-reports/:id/status", protect, adminOnly, updateDamageReportStatus);
router.delete("/damage-reports/:id", protect, adminOnly, deleteDamageReport);

module.exports = router;
