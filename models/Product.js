const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    images: [{ type: String }],
    originalPrice: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    keyFeatures: [{ type: String }],
    specifications: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    overview: [
      {
        heading: { type: String, default: "" },
        body: { type: String, default: "" },
      },
    ],
    skuCode: {
      type: String,
      required: [true, "SKU code is required"],
      unique: true,
      trim: true,
    },
    hsnCode: {
      type: String,
      trim: true,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", skuCode: "text", brand: "text" });

module.exports = mongoose.model("Product", productSchema);
