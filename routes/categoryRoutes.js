const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  removeSubcategory,
  deleteCategory,
} = require("../controllers/categoryController");

router.get("/", getCategories);
router.get("/by-name/:name", getCategoryByName);
router.get("/:id", getCategoryById);
router.post("/", upload.single("image"), createCategory);
router.put("/:id", upload.single("image"), updateCategory);
router.post("/:id/subcategory", addSubcategory);
router.put("/:id/subcategory/:subId", updateSubcategory);
router.delete("/:id/subcategory/:subId", removeSubcategory);
router.delete("/:id", deleteCategory);

module.exports = router;
