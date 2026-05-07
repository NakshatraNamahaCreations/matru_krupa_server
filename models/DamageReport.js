const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({ seq: { type: Number, default: 0 } });
const DamageCounter = mongoose.model("DamageCounter", counterSchema);

const damageReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, unique: true },
    reportedOn: { type: Date, required: true },
    reportedBy: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    productName: { type: String, default: "" },
    binLocation: { type: String, default: "-" },
    type: {
      type: String,
      enum: ["Damaged", "Lost", "Theft", "Courier Return"],
      required: true,
    },
    qty: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["Approved", "Disapproved", "Pending"],
      default: "Pending",
    },
    reasonCode: { type: String, default: "" },
    description: { type: String, default: "" },
    suggestedAction: { type: String, default: "" },
  },
  { timestamps: true }
);

// Auto-generate reportId like DR-00001
damageReportSchema.pre("save", async function (next) {
  if (this.reportId) return next();
  const counter = await DamageCounter.findOneAndUpdate(
    {},
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  this.reportId = `DR-${String(counter.seq).padStart(5, "0")}`;
  next();
});

module.exports = mongoose.model("DamageReport", damageReportSchema);
