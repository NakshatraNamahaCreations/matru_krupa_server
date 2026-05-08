const Franchise = require("../models/Franchise");
const FranchiseApplication = require("../models/FranchiseApplication");

const generateFranchiseId = () =>
  `FR${Math.floor(1000 + Math.random() * 9000)}`;

const ensureUniqueFranchiseId = async () => {
  for (let i = 0; i < 10; i += 1) {
    const candidate = generateFranchiseId();
    // eslint-disable-next-line no-await-in-loop
    const exists = await Franchise.exists({ franchiseId: candidate });
    if (!exists) return candidate;
  }
  return `FR${Date.now().toString().slice(-6)}`;
};

// Build a Franchise payload from an approved application document
const franchisePayloadFromApplication = (app) => ({
  franchiseName: app.firmName || `${app.firstName} ${app.lastName}`.trim(),
  owner: `${app.firstName || ""} ${app.lastName || ""}`.trim() || "—",
  email: app.email,
  mobile: app.mobile,
  gstNumber: app.gstNumber || "",
  address: app.firmAddress || "",
  stateRegion: app.state || "",
  accountHolderName: app.accountHolder || "",
  accountNumber: app.accountNumber || "",
  ifscCode: app.ifsc || "",
  bankName: app.bankName || "",
  branch: app.branchName || "",
  accountType: app.accountType || "",
  sourceApplication: app._id,
});

// Idempotent: returns the existing franchise if one is already linked to this app
const onboardFromApplication = async (application) => {
  if (!application) return null;
  const existing = await Franchise.findOne({ sourceApplication: application._id });
  if (existing) return existing;
  const franchiseId = await ensureUniqueFranchiseId();
  return Franchise.create({
    franchiseId,
    ...franchisePayloadFromApplication(application),
  });
};

// GET /api/franchises  (admin)
exports.getFranchises = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { franchiseName: re },
        { franchiseId: re },
        { owner: re },
        { email: re },
        { mobile: re },
        { gstNumber: re },
        { stateRegion: re },
      ];
    }
    const items = await Franchise.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/franchises/:id  (admin)
exports.getFranchiseById = async (req, res) => {
  try {
    const item = await Franchise.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Franchise not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/franchises  (admin — manual add)
exports.createFranchise = async (req, res) => {
  try {
    const data = { ...req.body };
    if (!data.franchiseId) data.franchiseId = await ensureUniqueFranchiseId();
    const item = await Franchise.create(data);
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/franchises/:id  (admin)
exports.updateFranchise = async (req, res) => {
  try {
    const item = await Franchise.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ message: "Franchise not found" });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PATCH /api/franchises/:id/toggle  (admin)
exports.toggleFranchise = async (req, res) => {
  try {
    const item = await Franchise.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Franchise not found" });
    item.isActive = !item.isActive;
    await item.save();
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/franchises/:id  (admin)
exports.deleteFranchise = async (req, res) => {
  try {
    const item = await Franchise.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Franchise not found" });
    res.json({ message: "Franchise deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/franchises/from-application/:appId  (admin)
// Manually onboard a franchise from an existing application without changing
// the application's status. Useful when the admin-added flow needs the link.
exports.onboardFromApplicationHandler = async (req, res) => {
  try {
    const application = await FranchiseApplication.findById(req.params.appId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    const franchise = await onboardFromApplication(application);
    res.status(201).json(franchise);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Exposed helper for the application controller
exports.onboardFromApplication = onboardFromApplication;
