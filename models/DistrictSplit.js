const mongoose = require("mongoose");

const splitEntrySchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: "HierarchyAdmin" },
  name: { type: String, required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 },
  color: { type: String, default: "#3b82f6" },
  earned: { type: Number, default: 0 },
});

const districtSplitSchema = new mongoose.Schema(
  {
    district: { type: String, required: true, unique: true },
    splits: [splitEntrySchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("DistrictSplit", districtSplitSchema);
