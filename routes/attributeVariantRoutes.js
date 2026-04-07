const express = require("express");
const router = express.Router();
const {
  getAttributeVariants,
  createAttributeVariant,
  bulkCreateAttributeVariants,
  updateAttributeVariant,
  toggleAttributeVariant,
  deleteAttributeVariant,
} = require("../controllers/attributeVariantController");

router.get("/", getAttributeVariants);
router.post("/", createAttributeVariant);
router.post("/bulk", bulkCreateAttributeVariants);
router.put("/:id", updateAttributeVariant);
router.patch("/:id/toggle", toggleAttributeVariant);
router.delete("/:id", deleteAttributeVariant);

module.exports = router;
