const mongoose = require("mongoose");

const franchiseApplicationSchema = new mongoose.Schema(
  {
    // Personal
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, trim: true, lowercase: true },
    mobile:    { type: String, required: true, trim: true },
    state:     { type: String, required: true, trim: true },
    city:      { type: String, required: true, trim: true },
    pincode:   { type: String, required: true, trim: true },

    // Career / Business
    firmName:      { type: String, required: true, trim: true },
    firmAddress:   { type: String, required: true, trim: true },
    gstNumber:     { type: String, default: "", trim: true, uppercase: true },
    employment:    { type: String, required: true, trim: true },
    firmNature:    { type: String, required: true, trim: true },
    position:      { type: String, required: true, trim: true },
    turnover:      { type: String, required: true, trim: true },
    businessType:  { type: String, required: true, trim: true },
    ownsRetail:    { type: String, required: true, trim: true },
    legalDisputes: { type: String, required: true, trim: true },

    // Investment / Property
    cities:       { type: String, required: true, trim: true },
    ownsProperty: { type: String, required: true, trim: true },

    // Bank
    accountHolder: { type: String, required: true, trim: true },
    bankName:      { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    ifsc:          { type: String, required: true, trim: true, uppercase: true },
    branchName:    { type: String, required: true, trim: true },
    accountType:   { type: String, required: true, trim: true },

    // Other
    comments:       { type: String, default: "", trim: true },
    depositConfirm: { type: Boolean, default: false },
    acceptTerms:    { type: Boolean, default: false },

    // Admin tracking
    status: {
      type: String,
      enum: ["pending", "reviewing", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    adminNotes: { type: String, default: "" },
  },
  { timestamps: true }
);

franchiseApplicationSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  firmName: "text",
  city: "text",
  mobile: "text",
});

module.exports = mongoose.model("FranchiseApplication", franchiseApplicationSchema);
