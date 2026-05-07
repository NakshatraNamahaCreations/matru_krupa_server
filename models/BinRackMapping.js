const mongoose = require("mongoose");

const binRackMappingSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    category: { type: String, default: "" },
    rackNo: { type: String, required: true, trim: true },
    shelfBin: { type: String, required: true, trim: true },
    zone: { type: String, required: true, trim: true },
    storageType: {
      type: String,
      enum: ["Bulky", "Heavy", "Fragile", "Temperature Sensitive"],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BinRackMapping", binRackMappingSchema);
