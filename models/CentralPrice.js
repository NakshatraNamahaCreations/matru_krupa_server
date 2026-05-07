const mongoose = require("mongoose");

const centralPriceSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    subcategory: {
      type: String,
      trim: true,
      default: "",
    },
    brand: {
      type: String,
      trim: true,
      default: "",
    },
    hsnCode: {
      type: String,
      trim: true,
      default: "",
    },
    basePurchasePrice: {
      type: Number,
      default: 0,
    },
    b2cMRP: {
      type: Number,
      default: 0,
    },
    b2bMRP: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number,
      default: 0,
    },
    currentEffectivePrice: {
      type: Number,
      default: 0,
    },
    priceListName: {
      type: String,
      trim: true,
      default: "",
    },
    region: {
      type: String,
      trim: true,
      default: "",
    },
    channel: {
      type: String,
      trim: true,
      default: "",
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

centralPriceSchema.index({ productName: "text", region: "text" });

module.exports = mongoose.model("CentralPrice", centralPriceSchema);
