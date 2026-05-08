const FranchiseApplication = require("../models/FranchiseApplication");
const { onboardFromApplication } = require("./franchiseController");

// POST /api/franchise-applications  (public — submitted from website)
exports.createApplication = async (req, res) => {
  try {
    const application = await FranchiseApplication.create(req.body);
    res.status(201).json({
      message: "Application submitted successfully",
      id: application._id,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET /api/franchise-applications  (admin)
exports.getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { firstName: re }, { lastName: re }, { email: re },
        { mobile: re }, { firmName: re }, { city: re }, { pincode: re },
      ];
    }
    const items = await FranchiseApplication.find(filter).sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/franchise-applications/:id  (admin)
exports.getApplicationById = async (req, res) => {
  try {
    const item = await FranchiseApplication.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Application not found" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/franchise-applications/:id  (admin — status / notes)
exports.updateApplication = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const update = {};
    if (status !== undefined) update.status = status;
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    const item = await FranchiseApplication.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ message: "Application not found" });

    // When an application is approved, auto-create the linked Franchise.
    // onboardFromApplication is idempotent — re-approving never duplicates.
    if (status === "approved") {
      try {
        await onboardFromApplication(item);
      } catch (onboardErr) {
        console.error("Failed to auto-onboard franchise:", onboardErr);
      }
    }

    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/franchise-applications/:id  (admin)
exports.deleteApplication = async (req, res) => {
  try {
    const item = await FranchiseApplication.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Application not found" });
    res.json({ message: "Application deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
