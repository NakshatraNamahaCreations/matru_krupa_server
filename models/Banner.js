const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: { type: String, default: "" },          // Cloudinary URL
    mobileImage: { type: String, default: "" },    // optional mobile crop
    link: { type: String, default: "" },           // click-through URL
    buttonText: { type: String, default: "" },
    type: {
      type: String,
      enum: ["hero", "promo", "category", "deal"],
      default: "hero",
    },
    theme: { type: String, enum: ["light", "dark"], default: "dark" },
    bgColor: { type: String, default: "#111111" },
    accentColor: { type: String, default: "#ffffff" },
    position: { type: Number, default: 0 },       // sort order
    active: { type: Boolean, default: true },
    visibility: {
      type: String,
      enum: ["website", "app", "both"],
      default: "both",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
