const mongoose = require("mongoose");

const promoterSaleSchema = new mongoose.Schema(
  {
    promoterCode: { type: String, required: true, trim: true },
    promoterName: { type: String, default: "" },
    district: { type: String, required: true },
    taluk: { type: String, required: true },
    hobli: { type: String, required: true },
    billingShop: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: String, default: "-" },
    quantity: { type: Number, required: true, min: 1, max: 5 },
    saleDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Pending", "Credited", "Rejected"],
      default: "Pending",
    },
    kyc: { type: String, default: "KYC Verified" },
    commissionAmount: { type: Number, default: 2000 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PromoterSale", promoterSaleSchema);
