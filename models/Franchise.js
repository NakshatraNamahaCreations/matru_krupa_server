const mongoose = require("mongoose");

const franchiseSchema = new mongoose.Schema(
  {
    franchiseId: { type: String, required: true, unique: true, trim: true, uppercase: true },
    franchiseName: { type: String, required: true, trim: true },
    owner: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String, required: true, trim: true },
    gstNumber: { type: String, default: "", trim: true, uppercase: true },
    address: { type: String, default: "", trim: true },
    stateRegion: { type: String, default: "", trim: true },

    // Banking
    accountHolderName: { type: String, default: "", trim: true },
    accountNumber: { type: String, default: "", trim: true },
    ifscCode: { type: String, default: "", trim: true, uppercase: true },
    bankName: { type: String, default: "", trim: true },
    branch: { type: String, default: "", trim: true },
    accountType: { type: String, default: "", trim: true },

    // Link back to source application (when onboarded from a website submission)
    sourceApplication: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FranchiseApplication",
      default: null,
      unique: true,
      sparse: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Franchise", franchiseSchema);
