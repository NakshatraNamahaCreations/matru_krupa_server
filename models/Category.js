const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    subcategories: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    filters: [
      {
        label: { type: String, required: true, trim: true },
        options: [{ type: String, trim: true }],
      },
    ],
    editorial: {
      title: { type: String, default: "" },
      intro: { type: String, default: "" },
      sections: [
        {
          heading: { type: String, default: "" },
          body: { type: String, default: "" },
        },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
