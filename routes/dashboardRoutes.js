const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getStats, getOrdersChart } = require("../controllers/dashboardController");

router.get("/stats", protect, adminOnly, getStats);
router.get("/orders-chart", protect, adminOnly, getOrdersChart);

module.exports = router;
