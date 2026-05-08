const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
  createApplication,
  getApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/franchiseApplicationController");

// Public — submitted by users from the website franchise opportunity page
router.post("/", createApplication);

// Admin — list, view, update status / notes, delete
router.get("/", protect, adminOnly, getApplications);
router.get("/:id", protect, adminOnly, getApplicationById);
router.patch("/:id", protect, adminOnly, updateApplication);
router.delete("/:id", protect, adminOnly, deleteApplication);

module.exports = router;
