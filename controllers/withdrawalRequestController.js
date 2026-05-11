const WithdrawalRequest = require("../models/WithdrawalRequest");
const HierarchyAdmin = require("../models/HierarchyAdmin");

// POST /api/withdrawal-requests
// Body: { amount, note? }  — auth: hierarchy user (token's id used as requester)
exports.createRequest = async (req, res) => {
  try {
    const userId = req.user?._id || req.body.hierarchyAdmin;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });

    const admin = await HierarchyAdmin.findById(userId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const { amount, note, walletBalance } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    const item = await WithdrawalRequest.create({
      hierarchyAdmin: admin._id,
      adminId: admin.adminId,
      fullName: admin.fullName,
      level: admin.level,
      district: admin.district,
      talukName: admin.talukName,
      amount,
      walletBalance: walletBalance || 0,
      note: note || "",
      bankName: admin.bankName,
      accountNumber: admin.accountNumber,
      accountHolder: admin.accountHolder,
      ifsc: admin.ifsc,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/withdrawal-requests  (admin) — list all, filter by status / hierarchyAdmin
exports.getRequests = async (req, res) => {
  try {
    const { status, hierarchyAdmin, level } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (hierarchyAdmin) filter.hierarchyAdmin = hierarchyAdmin;
    if (level && level !== "all") filter.level = level;

    const items = await WithdrawalRequest.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/withdrawal-requests/mine  — own requests (hierarchy user)
exports.getMyRequests = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ message: "Not authenticated" });
    const items = await WithdrawalRequest.find({ hierarchyAdmin: userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/withdrawal-requests/:id  (admin) — update status / utr / notes
exports.updateRequest = async (req, res) => {
  try {
    const { status, adminNotes, utr } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (utr !== undefined) update.utr = utr;
    if (status === "approved" || status === "paid" || status === "rejected") {
      update.processedAt = new Date();
    }
    const item = await WithdrawalRequest.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Request not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/withdrawal-requests/:id  (admin)
exports.deleteRequest = async (req, res) => {
  try {
    const item = await WithdrawalRequest.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
