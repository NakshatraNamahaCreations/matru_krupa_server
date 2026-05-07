const mongoose = require("mongoose");

const reorderSuggestionSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    salesVelocity: { type: String, default: "0 units" },
    currentStock: { type: Number, required: true, min: 0 },
    safetyStock: { type: Number, required: true, min: 0 },
    leadTime: { type: String, default: "0 days" },
    trend: {
      type: String,
      enum: ["High", "Stable", "Low"],
      default: "Stable",
    },
    reorderQty: { type: Number, required: true, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ReorderSuggestion", reorderSuggestionSchema);
