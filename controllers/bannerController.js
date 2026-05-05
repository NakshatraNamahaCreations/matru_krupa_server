const Banner = require("../models/Banner");
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
  if (publicId) { try { await cloudinary.uploader.destroy(publicId); } catch (_) {} }
}

// GET /api/banners  (public — storefront hero/promo)
const getActiveBanners = async (req, res) => {
  try {
    const { type } = req.query;
    const now = new Date();
    const filter = {
      active: true,
      $or: [{ startDate: { $lte: now } }, { startDate: null }],
      $and: [{ $or: [{ endDate: { $gte: now } }, { endDate: null }] }],
    };
    if (type) filter.type = type;
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/banners/admin  (admin — all banners)
const getAllBanners = async (req, res) => {
  try {
    const { type, active } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (active !== undefined) filter.active = active === "true";
    const banners = await Banner.find(filter).sort({ position: 1, createdAt: -1 });
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/banners
const createBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) data.image = req.file.path;
    if (data.position) data.position = Number(data.position);
    const banner = await Banner.create(data);
    res.status(201).json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/banners/:id
const updateBanner = async (req, res) => {
  try {
    const data = { ...req.body };
    if (req.file) {
      const old = await Banner.findById(req.params.id);
      if (old?.image) await deleteCloudinaryImage(old.image);
      if (old?.mobileImage) await deleteCloudinaryImage(old.mobileImage);
      data.image = req.file.path;
    }
    if (data.position) data.position = Number(data.position);
    const banner = await Banner.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json(banner);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/banners/:id/toggle
const toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    banner.active = !banner.active;
    await banner.save();
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/banners/:id
const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    if (banner.image) await deleteCloudinaryImage(banner.image);
    if (banner.mobileImage) await deleteCloudinaryImage(banner.mobileImage);
    res.json({ message: "Banner deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getActiveBanners, getAllBanners, createBanner, updateBanner, toggleBanner, deleteBanner };
