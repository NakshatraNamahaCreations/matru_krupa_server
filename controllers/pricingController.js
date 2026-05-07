const CentralPrice = require("../models/CentralPrice");
const FranchiseTier = require("../models/FranchiseTier");
const Product = require("../models/Product");

// ── Helper: parse ₹-prefixed string to number ──
const parsePrice = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return Number(String(val).replace(/[₹,\s]/g, "")) || 0;
};

// ── Helper: escape regex special characters ──
const escapeRegex = (str) =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ── Helper: format number to ₹ display string ──
const formatINR = (num) =>
  num ? `₹${Number(num).toLocaleString("en-IN")}` : "₹0";

// ── Helper: format date for display ──
const formatDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const formatDateTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  let hh = dt.getHours();
  const min = String(dt.getMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12 || 12;
  return `${dd}/${mm}/${yyyy} ${hh}:${min} ${ampm}`;
};

/* ═══════════════════════════════════════════
   CENTRAL PRICE LIST
   ═══════════════════════════════════════════ */

// GET /api/pricing/central
exports.getCentralPrices = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { productName: new RegExp(search, "i") },
        { region: new RegExp(search, "i") },
      ];
    }
    const items = await CentralPrice.find(filter).sort({ updatedAt: -1 });

    const formatted = items.map((item) => ({
      _id: item._id,
      productName: item.productName,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      hsnCode: item.hsnCode,
      basePurchasePrice: formatINR(item.basePurchasePrice),
      b2cMRP: formatINR(item.b2cMRP),
      b2bMRP: formatINR(item.b2bMRP),
      maxDiscount: `${item.maxDiscount}%`,
      currentEffectivePrice: formatINR(item.currentEffectivePrice),
      priceListName: item.priceListName,
      region: item.region,
      channel: item.channel,
      effectiveFrom: formatDate(item.effectiveFrom),
      effectiveTill: formatDate(item.effectiveTill),
      status: item.status,
      lastUpdatedBy: item.lastUpdatedBy,
      lastUpdatedOn: formatDateTime(item.updatedAt),
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/pricing/central
exports.createCentralPrice = async (req, res) => {
  try {
    const {
      productName,
      category,
      subcategory,
      brand,
      hsnCode,
      basePurchasePrice,
      b2cMRP,
      b2bMRP,
      maxDiscount,
      currentEffectivePrice,
      priceListName,
      region,
      channel,
      effectiveFrom,
      effectiveTill,
      status,
      lastUpdatedBy,
    } = req.body;

    // Look up product data if only productName provided
    let prodCategory = category || "";
    let prodBrand = brand || "";
    let prodHsn = hsnCode || "";
    let prodBase = parsePrice(basePurchasePrice);

    if (productName) {
      const product = await Product.findOne({
        name: new RegExp(`^${productName.trim()}$`, "i"),
      }).populate("category");

      if (product) {
        if (!category) prodCategory = product.category?.name || "";
        if (!brand) prodBrand = product.brand || "";
        if (!hsnCode) prodHsn = product.hsnCode || "";
        if (!basePurchasePrice) prodBase = product.price || 0;
      }
    }

    const item = await CentralPrice.create({
      productName,
      category: prodCategory,
      subcategory: subcategory || "",
      brand: prodBrand,
      hsnCode: prodHsn,
      basePurchasePrice: prodBase,
      b2cMRP: parsePrice(b2cMRP),
      b2bMRP: parsePrice(b2bMRP),
      maxDiscount: parseFloat(String(maxDiscount).replace("%", "")) || 0,
      currentEffectivePrice: parsePrice(currentEffectivePrice),
      priceListName: priceListName || "",
      region: region || "",
      channel: channel || "",
      effectiveFrom: effectiveFrom || undefined,
      effectiveTill: effectiveTill || undefined,
      status: status || "Active",
      lastUpdatedBy: lastUpdatedBy || "Admin",
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/pricing/central/:id
exports.updateCentralPrice = async (req, res) => {
  try {
    const {
      productName,
      category,
      subcategory,
      brand,
      hsnCode,
      basePurchasePrice,
      b2cMRP,
      b2bMRP,
      maxDiscount,
      currentEffectivePrice,
      priceListName,
      region,
      channel,
      effectiveFrom,
      effectiveTill,
      status,
      lastUpdatedBy,
    } = req.body;

    const update = {
      productName,
      category: category || "",
      subcategory: subcategory || "",
      brand: brand || "",
      hsnCode: hsnCode || "",
      basePurchasePrice: parsePrice(basePurchasePrice),
      b2cMRP: parsePrice(b2cMRP),
      b2bMRP: parsePrice(b2bMRP),
      maxDiscount: parseFloat(String(maxDiscount).replace("%", "")) || 0,
      currentEffectivePrice: parsePrice(currentEffectivePrice),
      priceListName: priceListName || "",
      region: region || "",
      channel: channel || "",
      effectiveFrom: effectiveFrom || undefined,
      effectiveTill: effectiveTill || undefined,
      status: status || "Active",
      lastUpdatedBy: lastUpdatedBy || "Admin",
    };

    const item = await CentralPrice.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Price entry not found" });

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/pricing/central/:id
exports.deleteCentralPrice = async (req, res) => {
  try {
    const item = await CentralPrice.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Price entry not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═══════════════════════════════════════════
   FRANCHISE PRICING TIERS
   ═══════════════════════════════════════════ */

// GET /api/pricing/franchise
exports.getFranchiseTiers = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { franchiseName: new RegExp(search, "i") },
        { region: new RegExp(search, "i") },
        { productName: new RegExp(search, "i") },
      ];
    }
    const items = await FranchiseTier.find(filter).sort({ updatedAt: -1 });

    // Fetch all central prices and build a B2B lookup map
    const allCentralPrices = await CentralPrice.find().sort({ updatedAt: -1 });
    const b2bMap = {};
    for (const cp of allCentralPrices) {
      const key = cp.productName.trim().toLowerCase();
      // Keep the first (most recent) entry per product
      if (b2bMap[key] === undefined) b2bMap[key] = cp.b2bMRP;
    }

    const formatted = items.map((item) => {
      const key = item.productName.trim().toLowerCase();
      const liveB2B = b2bMap[key];
      return {
        _id: item._id,
        franchiseName: item.franchiseName,
        region: item.region,
        tier: item.tier,
        productName: item.productName,
        sku: item.sku,
        basePurchaseB2B: formatINR(liveB2B !== undefined ? liveB2B : item.basePurchaseB2B),
        tierPrice: formatINR(item.tierPrice),
        maxDiscount: `${item.maxDiscount}%`,
        effectiveFrom: formatDate(item.effectiveFrom),
        effectiveTill: formatDate(item.effectiveTill),
        status: item.status,
        lastUpdatedBy: item.lastUpdatedBy,
        lastUpdatedOn: formatDateTime(item.updatedAt),
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/pricing/franchise
exports.createFranchiseTier = async (req, res) => {
  try {
    const {
      franchiseName,
      region,
      tier,
      productName,
      sku,
      basePurchaseB2B,
      tierPrice,
      maxDiscount,
      effectiveFrom,
      effectiveTill,
      status,
      lastUpdatedBy,
    } = req.body;

    // Look up product for SKU, and B2B price from Central Price List
    let prodSku = sku || "";
    let prodB2B = parsePrice(basePurchaseB2B);

    if (productName) {
      // Get SKU from Product collection
      const escaped = escapeRegex(productName.trim());
      const product = await Product.findOne({
        name: new RegExp(`^${escaped}$`, "i"),
      });
      if (product) {
        if (!sku) prodSku = product.skuCode || "";
      }

      // Get B2B price from Central Price List
      if (!basePurchaseB2B) {
        const centralPrice = await CentralPrice.findOne({
          productName: new RegExp(`^${escaped}$`, "i"),
        }).sort({ updatedAt: -1 });
        if (centralPrice && centralPrice.b2bMRP != null) {
          prodB2B = centralPrice.b2bMRP;
        }
      }
    }

    const item = await FranchiseTier.create({
      franchiseName,
      region: region || "",
      tier: tier || "A",
      productName,
      sku: prodSku,
      basePurchaseB2B: prodB2B,
      tierPrice: parsePrice(tierPrice),
      maxDiscount: parseFloat(String(maxDiscount).replace("%", "")) || 0,
      effectiveFrom: effectiveFrom || undefined,
      effectiveTill: effectiveTill || undefined,
      status: status || "Active",
      lastUpdatedBy: lastUpdatedBy || "Admin",
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/pricing/franchise/:id
exports.updateFranchiseTier = async (req, res) => {
  try {
    const {
      franchiseName,
      region,
      tier,
      productName,
      sku,
      basePurchaseB2B,
      tierPrice,
      maxDiscount,
      effectiveFrom,
      effectiveTill,
      status,
      lastUpdatedBy,
    } = req.body;

    // Look up B2B price from Central Price List
    let prodB2B = parsePrice(basePurchaseB2B);
    if (!basePurchaseB2B && productName) {
      const escaped = escapeRegex(productName.trim());
      const centralPrice = await CentralPrice.findOne({
        productName: new RegExp(`^${escaped}$`, "i"),
      }).sort({ updatedAt: -1 });
      if (centralPrice && centralPrice.b2bMRP != null) {
        prodB2B = centralPrice.b2bMRP;
      }
    }

    const update = {
      franchiseName,
      region: region || "",
      tier: tier || "A",
      productName,
      sku: sku || "",
      basePurchaseB2B: prodB2B,
      tierPrice: parsePrice(tierPrice),
      maxDiscount: parseFloat(String(maxDiscount).replace("%", "")) || 0,
      effectiveFrom: effectiveFrom || undefined,
      effectiveTill: effectiveTill || undefined,
      status: status || "Active",
      lastUpdatedBy: lastUpdatedBy || "Admin",
    };

    const item = await FranchiseTier.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Franchise tier not found" });

    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/pricing/franchise/:id
exports.deleteFranchiseTier = async (req, res) => {
  try {
    const item = await FranchiseTier.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Franchise tier not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
