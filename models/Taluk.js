const mongoose = require("mongoose");

const talukSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

talukSchema.index({ name: 1, district: 1 }, { unique: true });

module.exports = mongoose.model("Taluk", talukSchema);
