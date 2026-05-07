const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, trim: true },
    channel: {
      type: String,
      required: true,
      enum: ["Franchise", "E-Commerce"],
    },
    sku: { type: String, required: true, trim: true },
    qty: { type: Number, required: true, min: 1 },
    reservedOn: { type: Date, required: true },
    status: {
      type: String,
      enum: ["Confirmed", "Pending"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
