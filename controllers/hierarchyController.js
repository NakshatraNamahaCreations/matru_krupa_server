const HierarchyAdmin = require("../models/HierarchyAdmin");
const { sendCredentialsEmail } = require("../utils/sendEmail");
const Shop = require("../models/Shop");
const CommissionRule = require("../models/CommissionRule");
const DistrictSplit = require("../models/DistrictSplit");
const PromoterSale = require("../models/PromoterSale");
const Product = require("../models/Product");

// ─── HIERARCHY ADMINS ─────────────────────────────────

const getAdmins = async (req, res) => {
  try {
    const { level, status } = req.query;
    const filter = {};
    if (level && level !== "All") filter.level = level;
    if (status === "Active") filter.isActive = true;
    if (status === "Inactive") filter.isActive = false;

    const admins = await HierarchyAdmin.find(filter).sort({ createdAt: -1 });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAdminById = async (req, res) => {
  try {
    const admin = await HierarchyAdmin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAdmin = async (req, res) => {
  try {
    const { email, mobile } = req.body;

    // Check duplicate email
    const exists = await HierarchyAdmin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    // Auto-set password to mobile number
    const payload = { ...req.body };
    if (mobile && !payload.password) {
      payload.password = mobile;
    }

    const admin = await HierarchyAdmin.create(payload);

    // Send credentials email (non-blocking — don't fail the request if email fails)
    if (admin.email && mobile) {
      sendCredentialsEmail({
        email: admin.email,
        fullName: admin.fullName,
        level: admin.level,
        password: mobile,
      }).catch((err) => console.error("Failed to send credentials email:", err.message));
    }

    const result = admin.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateAdmin = async (req, res) => {
  try {
    const admin = await HierarchyAdmin.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json(admin);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const toggleAdmin = async (req, res) => {
  try {
    const admin = await HierarchyAdmin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    admin.isActive = !admin.isActive;
    await admin.save();
    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAdmin = async (req, res) => {
  try {
    const admin = await HierarchyAdmin.findByIdAndDelete(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });
    res.json({ message: "Admin deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── SHOPS ────────────────────────────────────────────

const getShops = async (req, res) => {
  try {
    const { hobli, taluk } = req.query;
    const filter = {};
    if (hobli) filter.hobli = hobli;
    if (taluk) filter.talukCode = new RegExp(taluk, "i");

    const shops = await Shop.find(filter).sort({ createdAt: -1 });
    res.json(shops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createShop = async (req, res) => {
  try {
    const shop = await Shop.create(req.body);
    res.status(201).json(shop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ message: "Shop not found" });
    res.json({ message: "Shop deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHobliStats = async (req, res) => {
  try {
    const stats = await Shop.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$hobli",
          shops: { $sum: 1 },
          sales: { $sum: "$sales" },
        },
      },
      { $project: { name: "$_id", shops: 1, sales: 1, _id: 0 } },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── COMMISSION RULES ─────────────────────────────────

const getCommissionRules = async (req, res) => {
  try {
    let rules = await CommissionRule.find().sort({ createdAt: 1 });

    // Seed defaults if empty
    if (rules.length === 0) {
      const defaults = [
        { level: "STATE ADMIN", badge: "state", creates: "Assistant District Admin", commissionPerSale: 1000, split: "-" },
        { level: "ASS DISTRICT ADMIN", badge: "ass-district", creates: "District Admins", commissionPerSale: 1000, split: "-" },
        { level: "DISTRICT ADMIN", badge: "district", creates: "Taluk Admins", commissionPerSale: 1000, split: "by %" },
        { level: "TALUK ADMIN", badge: "taluk", creates: "Promoters + Shops", commissionPerSale: 1000, split: "-" },
        { level: "PROMOTERS", badge: "promoter", creates: "Brings Buyers", commissionPerSale: 2000, split: "-" },
      ];
      rules = await CommissionRule.insertMany(defaults);
    }

    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCommissionRule = async (req, res) => {
  try {
    const rule = await CommissionRule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!rule) return res.status(404).json({ message: "Rule not found" });
    res.json(rule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── DISTRICT SPLITS ──────────────────────────────────

const getDistrictSplit = async (req, res) => {
  try {
    const { district } = req.query;
    if (!district) return res.status(400).json({ message: "District is required" });

    let split = await DistrictSplit.findOne({ district });
    if (!split) {
      // Return empty structure
      split = { district, splits: [] };
    }
    res.json(split);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const saveDistrictSplit = async (req, res) => {
  try {
    const { district, splits } = req.body;
    if (!district) return res.status(400).json({ message: "District is required" });

    // Validate total = 100
    const total = splits.reduce((sum, s) => sum + (s.percentage || 0), 0);
    if (splits.length > 0 && total !== 100) {
      return res.status(400).json({ message: `Split total must equal 100%. Current total: ${total}%` });
    }

    const result = await DistrictSplit.findOneAndUpdate(
      { district },
      { district, splits },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ─── PROMOTER SALES ─────────────────────────────────

const getPromoterSales = async (req, res) => {
  try {
    const { search, status, from, to } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { promoterCode: new RegExp(search, "i") },
        { promoterName: new RegExp(search, "i") },
      ];
    }
    if (status && status !== "All") filter.status = status;
    if (from || to) {
      filter.saleDate = {};
      if (from) filter.saleDate.$gte = new Date(from);
      if (to) filter.saleDate.$lte = new Date(to);
    }

    const sales = await PromoterSale.find(filter).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createPromoterSale = async (req, res) => {
  try {
    const { promoterCode, district, taluk, hobli, billingShop, productName, quantity, saleDate, price } = req.body;

    if (!promoterCode || !district || !taluk || !hobli || !billingShop || !productName || !quantity || !saleDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const code = promoterCode.trim().toUpperCase();
    if (!code.startsWith("KA-PA-")) {
      return res.status(400).json({ message: "Only Promoter codes (KA-PA-XXX) are allowed" });
    }

    // Look up promoter name from HierarchyAdmin
    const promoter = await HierarchyAdmin.findOne({
      adminId: new RegExp(`^${code.replace("KA-PA-", "KA-PR-")}$`, "i"),
      level: "Promoters",
    });

    // Look up product price from Product collection
    let productPrice = price || "-";
    const product = await Product.findOne({
      name: new RegExp(`^${productName.trim()}$`, "i"),
    });
    if (product) {
      productPrice = product.price.toLocaleString("en-IN");
    }

    const sale = await PromoterSale.create({
      promoterCode: code,
      promoterName: promoter ? promoter.fullName : code,
      district,
      taluk,
      hobli,
      billingShop,
      productName,
      price: productPrice,
      quantity: Number(quantity),
      saleDate: new Date(saleDate),
    });

    res.status(201).json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updatePromoterSaleStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Pending", "Credited", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const sale = await PromoterSale.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deletePromoterSale = async (req, res) => {
  try {
    const sale = await PromoterSale.findByIdAndDelete(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json({ message: "Sale deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  toggleAdmin,
  deleteAdmin,
  getShops,
  createShop,
  deleteShop,
  getHobliStats,
  getCommissionRules,
  updateCommissionRule,
  getDistrictSplit,
  saveDistrictSplit,
  getPromoterSales,
  createPromoterSale,
  updatePromoterSaleStatus,
  deletePromoterSale,
};
