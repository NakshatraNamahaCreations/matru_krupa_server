const HierarchyAdmin = require("../models/HierarchyAdmin");
const Shop = require("../models/Shop");
const CommissionRule = require("../models/CommissionRule");
const DistrictSplit = require("../models/DistrictSplit");

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

    const admin = await HierarchyAdmin.create(req.body);
    res.status(201).json(admin);
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
};
