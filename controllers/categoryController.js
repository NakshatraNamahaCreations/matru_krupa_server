const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

function getPublicId(url) {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/");
  const uploadIdx = parts.indexOf("upload");
  if (uploadIdx === -1) return null;
  const rest = parts.slice(uploadIdx + 1);
  if (/^v\d+$/.test(rest[0])) rest.shift();
  return rest.join("/").replace(/\.[^/.]+$/, "");
}

async function deleteCloudinaryImage(url) {
  const publicId = getPublicId(url);
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (_) {}
  }
}

const getCategories = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: search, $options: "i" };
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    if (data.subcategories && typeof data.subcategories === "string") {
      data.subcategories = JSON.parse(data.subcategories);
    }
    if (data.filters && typeof data.filters === "string") {
      data.filters = JSON.parse(data.filters);
    }
    if (data.editorial && typeof data.editorial === "string") {
      data.editorial = JSON.parse(data.editorial);
    }
    const category = await Category.create(data);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const old = await Category.findById(req.params.id);
      if (old?.image) await deleteCloudinaryImage(old.image);
      data.image = req.file.path;
    }
    if (data.subcategories && typeof data.subcategories === "string") {
      data.subcategories = JSON.parse(data.subcategories);
    }
    if (data.filters && typeof data.filters === "string") {
      data.filters = JSON.parse(data.filters);
    }
    if (data.editorial && typeof data.editorial === "string") {
      data.editorial = JSON.parse(data.editorial);
    }
    const category = await Category.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const addSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    category.subcategories.push({ name: req.body.name });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    const sub = category.subcategories.id(req.params.subId);
    if (!sub)
      return res.status(404).json({ message: "Subcategory not found" });
    sub.name = req.body.name;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const removeSubcategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    category.subcategories = category.subcategories.filter(
      (sub) => sub._id.toString() !== req.params.subId,
    );
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    if (category.image) await deleteCloudinaryImage(category.image);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryByName = async (req, res) => {
  try {
    const name = decodeURIComponent(req.params.name);
    const category = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryByName,
  createCategory,
  updateCategory,
  addSubcategory,
  updateSubcategory,
  removeSubcategory,
  deleteCategory,
};
