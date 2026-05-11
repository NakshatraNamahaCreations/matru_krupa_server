const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  createRequest,
  getRequests,
  getMyRequests,
  updateRequest,
  deleteRequest,
} = require("../controllers/withdrawalRequestController");

// Hierarchy user — submit + view own
router.post("/", protect, createRequest);
router.get("/mine", protect, getMyRequests);

// Admin / super admin — list all + update / delete
router.get("/", protect, adminOnly, getRequests);
router.patch("/:id", protect, adminOnly, updateRequest);
router.delete("/:id", protect, adminOnly, deleteRequest);

module.exports = router;
