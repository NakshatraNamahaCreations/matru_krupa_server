const mongoose = require("mongoose");

const hobliSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    taluk: { type: String, required: true, trim: true },
    district: { type: String, default: "", trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

hobliSchema.index({ name: 1, taluk: 1 }, { unique: true });

module.exports = mongoose.model("Hobli", hobliSchema);
