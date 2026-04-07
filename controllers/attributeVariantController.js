const AttributeVariant = require("../models/AttributeVariant");
const csv = require("fs");

// GET /api/attribute-variants?search=&product=
const getAttributeVariants = async (req, res) => {
  try {
    const { search, product } = req.query;
    const filter = {};

    if (search) {
      filter.productName = { $regex: search, $options: "i" };
    }
    if (product) filter.product = product;

    const variants = await AttributeVariant.find(filter)
      .populate("product", "name skuCode")
      .sort({ createdAt: -1 });
    res.json(variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/attribute-variants
const createAttributeVariant = async (req, res) => {
  try {
    const variant = await AttributeVariant.create(req.body);
    const populated = await variant.populate("product", "name skuCode");
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// POST /api/attribute-variants/bulk
const bulkCreateAttributeVariants = async (req, res) => {
  try {
    const { variants } = req.body;
    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ message: "Provide an array of variants" });
    }
    const created = await AttributeVariant.insertMany(variants);
    res.status(201).json({ message: `${created.length} variants created`, data: created });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/attribute-variants/:id
const updateAttributeVariant = async (req, res) => {
  try {
    const variant = await AttributeVariant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("product", "name skuCode");
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    res.json(variant);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/attribute-variants/:id/toggle
const toggleAttributeVariant = async (req, res) => {
  try {
    const variant = await AttributeVariant.findById(req.params.id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });

    variant.active = !variant.active;
    await variant.save();
    res.json(variant);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/attribute-variants/:id
const deleteAttributeVariant = async (req, res) => {
  try {
    const variant = await AttributeVariant.findByIdAndDelete(req.params.id);
    if (!variant) return res.status(404).json({ message: "Variant not found" });
    res.json({ message: "Variant deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAttributeVariants,
  createAttributeVariant,
  bulkCreateAttributeVariants,
  updateAttributeVariant,
  toggleAttributeVariant,
  deleteAttributeVariant,
};
