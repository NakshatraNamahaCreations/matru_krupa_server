const mongoose = require("mongoose");

const commissionRuleSchema = new mongoose.Schema(
  {
    level: {
      type: String,
      required: true,
      unique: true,
      enum: ["STATE ADMIN", "ASS DISTRICT ADMIN", "DISTRICT ADMIN", "TALUK ADMIN", "PROMOTERS"],
    },
    badge: { type: String, required: true },
    creates: { type: String, required: true },
    commissionPerSale: { type: Number, required: true }, // in rupees
    split: { type: String, default: "-" }, // "-" or "by %"
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommissionRule", commissionRuleSchema);
