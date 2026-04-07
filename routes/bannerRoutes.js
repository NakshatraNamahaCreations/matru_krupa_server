const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getActiveBanners,
  getAllBanners,
  createBanner,
  updateBanner,
  toggleBanner,
  deleteBanner,
} = require("../controllers/bannerController");

// Set Cloudinary folder for banners
const setBannerFolder = (req, res, next) => {
  req.cloudinaryFolder = "matru-kripa/banners";
  next();
};

// Public
router.get("/", getActiveBanners);

// Admin
router.get("/admin", protect, adminOnly, getAllBanners);
router.post("/", protect, adminOnly, setBannerFolder, upload.single("image"), createBanner);
router.put("/:id", protect, adminOnly, setBannerFolder, upload.single("image"), updateBanner);
router.patch("/:id/toggle", protect, adminOnly, toggleBanner);
router.delete("/:id", protect, adminOnly, deleteBanner);

module.exports = router;
