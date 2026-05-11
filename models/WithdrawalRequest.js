const mongoose = require("mongoose");

const withdrawalRequestSchema = new mongoose.Schema(
  {
    // Who made the request
    hierarchyAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HierarchyAdmin",
      required: true,
      index: true,
    },
    adminId: { type: String, required: true }, // e.g. KA-TA-003 (snapshot)
    fullName: { type: String, required: true },
    level: { type: String, required: true }, // "Promoters", "Taluk Admin", etc.
    district: { type: String, default: "" },
    talukName: { type: String, default: "" },

    // Money
    amount: { type: Number, required: true, min: 1 },
    walletBalance: { type: Number, default: 0 }, // snapshot at time of request
    note: { type: String, default: "" },

    // Bank snapshot (so admin can pay even if user later edits bank info)
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountHolder: { type: String, default: "" },
    ifsc: { type: String, default: "" },

    // Workflow
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "paid"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String, default: "" },
    processedAt: { type: Date },
    utr: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
