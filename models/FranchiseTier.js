const mongoose = require("mongoose");

const franchiseTierSchema = new mongoose.Schema(
  {
    franchiseName: {
      type: String,
      required: [true, "Franchise name is required"],
      trim: true,
    },
    region: {
      type: String,
      trim: true,
      default: "",
    },
    tier: {
      type: String,
      enum: ["A", "B", "C"],
      default: "A",
    },
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    sku: {
      type: String,
      trim: true,
      default: "",
    },
    basePurchaseB2B: {
      type: Number,
      default: 0,
    },
    tierPrice: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
    },
    effectiveFrom: {
      type: Date,
    },
    effectiveTill: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["Active", "Scheduled", "Inactive"],
      default: "Active",
    },
    lastUpdatedBy: {
      type: String,
      trim: true,
      default: "Admin",
    },
  },
  { timestamps: true }
);

franchiseTierSchema.index({
  franchiseName: "text",
  region: "text",
  productName: "text",
});

module.exports = mongoose.model("FranchiseTier", franchiseTierSchema);
