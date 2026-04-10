const mongoose = require("mongoose");

const shopSchema = new mongoose.Schema(
  {
    shopCode: { type: String, unique: true }, // e.g. MK-KA-001
    shopName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    mobile: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true },
    gst: { type: String, default: "" },
    address: { type: String, default: "" },
    hobli: { type: String, required: true },
    talukCode: { type: String, default: "" }, // ref to HierarchyAdmin adminId
    category: { type: String, default: "Electronics" },
    pos: { type: String, default: "Matru Krupa POS" },
    sales: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate shopCode
shopSchema.pre("save", async function (next) {
  if (this.shopCode) return next();
  const count = await mongoose.model("Shop").countDocuments();
  this.shopCode = `MK-KA-${String(count + 1).padStart(3, "0")}`;
  next();
});

module.exports = mongoose.model("Shop", shopSchema);
