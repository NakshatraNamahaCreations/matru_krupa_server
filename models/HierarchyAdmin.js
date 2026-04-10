const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Auto-generate admin IDs like KA-SA-001, KA-DA-002, etc.
const levelPrefixMap = {
  "State Admin": "SA",
  "Assistant District Admin": "ADA",
  "District Admin": "DA",
  "Taluk Admin": "TA",
};

const hierarchyAdminSchema = new mongoose.Schema(
  {
    adminId: { type: String, unique: true }, // e.g. KA-SA-001
    level: {
      type: String,
      required: true,
      enum: ["State Admin", "Assistant District Admin", "District Admin", "Taluk Admin"],
    },
    fullName: { type: String, required: true, trim: true },
    dob: { type: String, default: "" },
    district: { type: String, default: "" },
    talukName: { type: String, default: "" },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    aadhar: { type: String, default: "" },
    pan: { type: String, default: "" },

    // Bank details
    bankName: { type: String, default: "" },
    accountNumber: { type: String, default: "" },
    accountHolder: { type: String, default: "" },
    ifsc: { type: String, default: "" },
    accountType: { type: String, enum: ["Savings", "Current"], default: "Savings" },

    // Location
    state: { type: String, default: "Karnataka" },
    pincode: { type: String, default: "" },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate adminId before save
hierarchyAdminSchema.pre("save", async function (next) {
  if (this.adminId) return next();

  const prefix = levelPrefixMap[this.level] || "XX";
  const count = await mongoose.model("HierarchyAdmin").countDocuments({ level: this.level });
  this.adminId = `KA-${prefix}-${String(count + 1).padStart(3, "0")}`;
  next();
});

module.exports = mongoose.model("HierarchyAdmin", hierarchyAdminSchema);
