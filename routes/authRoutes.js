const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.put("/change-password", protect, changePassword);

// Address management
router.post("/addresses", protect, addAddress);
router.put("/addresses/:addrId", protect, updateAddress);
router.delete("/addresses/:addrId", protect, deleteAddress);

// Wishlist
router.post("/wishlist/:productId", protect, toggleWishlist);

module.exports = router;
