const Product = require("../models/Product");
const Category = require("../models/Category");
const cloudinary = require("../config/cloudinary");

// Extract Cloudinary public_id from URL
function getPublicId(url) {
  if (!url || !url.includes("cloudinary")) return null;
  const parts = url.split("/");
  const uploadIdx = parts.indexOf("upload");
  if (uploadIdx === -1) return null;
  // Skip version segment (v12345) if present
  const rest = parts.slice(uploadIdx + 1);
  if (/^v\d+$/.test(rest[0])) rest.shift();
  return rest.join("/").replace(/\.[^/.]+$/, "");
}

async function deleteCloudinaryImage(url) {
  const publicId = getPublicId(url);
  if (publicId) {
    try { await cloudinary.uploader.destroy(publicId); } catch (_) {}
  }
}

// GET /api/products?search=&category=&active=&page=&limit=
const getProducts = async (req, res) => {
  try {
    const { search, category, active, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { skuCode: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    if (category) filter.category = category;
    if (active !== undefined) filter.active = active === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/public — active products for storefront
const getPublicProducts = async (req, res) => {
  try {
    const { category, search, limit = 20, page = 1 } = req.query;
    const filter = { active: true };
    if (category) {
      // Support both ObjectId and category name
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        filter.category = category;
      } else {
        const cat = await Category.findOne({ name: { $regex: `^${category}$`, $options: "i" } });
        if (cat) filter.category = cat._id;
        else filter.category = null; // no match → return empty
      }
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Product.countDocuments(filter),
    ]);
    res.json({ products, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Parse JSON string fields that come via FormData
function parseJsonFields(data) {
  if (data.keyFeatures && typeof data.keyFeatures === "string") {
    data.keyFeatures = JSON.parse(data.keyFeatures);
  }
  if (data.specifications && typeof data.specifications === "string") {
    data.specifications = JSON.parse(data.specifications);
  }
  if (data.overview && typeof data.overview === "string") {
    data.overview = JSON.parse(data.overview);
  }
  if (data.existingImages && typeof data.existingImages === "string") {
    data.existingImages = JSON.parse(data.existingImages);
  }
}

// POST /api/products
const createProduct = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle multiple image uploads
    if (req.files && req.files.length > 0) {
      data.images = req.files.map((f) => f.path);
      data.image = data.images[0]; // primary image
    } else if (req.file) {
      data.image = req.file.path;
      data.images = [req.file.path];
    }

    if (data.price) data.price = Number(data.price);
    if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
    if (data.stock) data.stock = Number(data.stock);
    if (data.gst) data.gst = Number(data.gst);
    parseJsonFields(data);
    delete data.existingImages;

    const product = await Product.create(data);
    const populated = await product.populate("category", "name");
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU code already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const data = { ...req.body };
    parseJsonFields(data);

    const old = await Product.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Product not found" });

    // Handle multiple image uploads + existing images
    const existingImages = data.existingImages || [];
    delete data.existingImages;

    // Delete removed images from Cloudinary
    const oldImages = old.images || (old.image ? [old.image] : []);
    for (const url of oldImages) {
      if (!existingImages.includes(url)) {
        await deleteCloudinaryImage(url);
      }
    }

    // Build new images array: existing + newly uploaded
    const newUploads = req.files ? req.files.map((f) => f.path) : req.file ? [req.file.path] : [];
    data.images = [...existingImages, ...newUploads];
    data.image = data.images[0] || "";

    if (data.price) data.price = Number(data.price);
    if (data.originalPrice) data.originalPrice = Number(data.originalPrice);
    if (data.stock) data.stock = Number(data.stock);
    if (data.gst) data.gst = Number(data.gst);

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    }).populate("category", "name");

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "SKU code already exists" });
    }
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/products/:id/toggle
const toggleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    product.active = !product.active;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    // Delete all images from Cloudinary
    const allImages = product.images?.length ? product.images : product.image ? [product.image] : [];
    for (const url of allImages) {
      await deleteCloudinaryImage(url);
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getPublicProducts,
  getProductById,
  createProduct,
  updateProduct,
  toggleProduct,
  deleteProduct,
};
