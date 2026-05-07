const Product = require("../models/Product");
const Reservation = require("../models/Reservation");
const ReorderSuggestion = require("../models/ReorderSuggestion");
const BinRackMapping = require("../models/BinRackMapping");
const DamageReport = require("../models/DamageReport");

// ─── CENTRAL STOCK (uses Product model) ─────────────

const getCentralStock = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { active: true };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { skuCode: new RegExp(search, "i") },
      ];
    }
    if (category) filter.category = category;

    const products = await Product.find(filter)
      .populate("category", "name")
      .select("skuCode name category brand stock")
      .sort({ createdAt: -1 });

    const items = products.map((p) => ({
      _id: p._id,
      sku: p.skuCode,
      name: p.name,
      category: p.category?.name || "",
      brand: p.brand || "",
      stock: p.stock,
    }));

    const totalStock = items.reduce((sum, i) => sum + (i.stock || 0), 0);
    res.json({ items, totalStock });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── RESERVATIONS ────────────────────────────────────

const getReservations = async (req, res) => {
  try {
    const { search, date } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { orderId: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
      ];
    }
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      filter.reservedOn = { $gte: d, $lt: next };
    }

    const reservations = await Reservation.find(filter).sort({ createdAt: -1 });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create(req.body);
    res.status(201).json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json(reservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ message: "Reservation not found" });
    res.json({ message: "Reservation deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── REORDER SUGGESTIONS ────────────────────────────

const getReorderSuggestions = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { productName: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
      ];
    }

    const suggestions = await ReorderSuggestion.find(filter).sort({ createdAt: -1 });
    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createReorderSuggestion = async (req, res) => {
  try {
    const suggestion = await ReorderSuggestion.create(req.body);
    res.status(201).json(suggestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateReorderSuggestion = async (req, res) => {
  try {
    const suggestion = await ReorderSuggestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
    res.json(suggestion);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const toggleReorderSuggestion = async (req, res) => {
  try {
    const suggestion = await ReorderSuggestion.findById(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
    suggestion.isActive = !suggestion.isActive;
    await suggestion.save();
    res.json(suggestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReorderSuggestion = async (req, res) => {
  try {
    const suggestion = await ReorderSuggestion.findByIdAndDelete(req.params.id);
    if (!suggestion) return res.status(404).json({ message: "Suggestion not found" });
    res.json({ message: "Suggestion deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── BIN/RACK MAPPING ───────────────────────────────

const getBinRackMappings = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { productName: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
      ];
    }

    const mappings = await BinRackMapping.find(filter).sort({ createdAt: -1 });

    // Compute stats
    const totalRacks = new Set(mappings.map((m) => m.rackNo)).size;
    const totalBins = mappings.length;
    const fragile = mappings.filter((m) => m.storageType === "Fragile").length;
    const tempSensitive = mappings.filter((m) => m.storageType === "Temperature Sensitive").length;

    res.json({ mappings, stats: { totalRacks, totalBins, fragile, tempSensitive } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBinRackMapping = async (req, res) => {
  try {
    const mapping = await BinRackMapping.create(req.body);
    res.status(201).json(mapping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBinRackMapping = async (req, res) => {
  try {
    const mapping = await BinRackMapping.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!mapping) return res.status(404).json({ message: "Mapping not found" });
    res.json(mapping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBinRackMapping = async (req, res) => {
  try {
    const mapping = await BinRackMapping.findByIdAndDelete(req.params.id);
    if (!mapping) return res.status(404).json({ message: "Mapping not found" });
    res.json({ message: "Mapping deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── DAMAGE REPORTS ──────────────────────────────────

const getDamageReports = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { reportId: new RegExp(search, "i") },
        { reportedBy: new RegExp(search, "i") },
        { sku: new RegExp(search, "i") },
      ];
    }

    const reports = await DamageReport.find(filter).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDamageReport = async (req, res) => {
  try {
    const report = await DamageReport.create(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDamageReport = async (req, res) => {
  try {
    const report = await DamageReport.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateDamageReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Approved", "Disapproved", "Pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const report = await DamageReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json(report);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteDamageReport = async (req, res) => {
  try {
    const report = await DamageReport.findByIdAndDelete(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCentralStock,
  getReservations,
  createReservation,
  updateReservation,
  deleteReservation,
  getReorderSuggestions,
  createReorderSuggestion,
  updateReorderSuggestion,
  toggleReorderSuggestion,
  deleteReorderSuggestion,
  getBinRackMappings,
  createBinRackMapping,
  updateBinRackMapping,
  deleteBinRackMapping,
  getDamageReports,
  createDamageReport,
  updateDamageReport,
  updateDamageReportStatus,
  deleteDamageReport,
};
