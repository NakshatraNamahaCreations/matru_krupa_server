const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect, adminOnly } = require("../middleware/auth");
const {
  getProducts,
  getPublicProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
} = require("../controllers/productController");

// Set Cloudinary folder for products
const setProductFolder = (req, res, next) => {
  req.cloudinaryFolder = "matru-kripa/products";
  next();
};

// Public
router.get("/public", getPublicProducts);
router.get("/:id", getProductById);

// Admin
router.get("/", protect, adminOnly, getProducts);
router.post("/", protect, adminOnly, setProductFolder, upload.array("images", 10), createProduct);
router.put("/:id", protect, adminOnly, setProductFolder, upload.array("images", 10), updateProduct);
router.patch("/:id/toggle", protect, adminOnly, toggleProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;
