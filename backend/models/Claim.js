const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    foundItem: { type: mongoose.Schema.Types.ObjectId, ref: "FoundItem", required: true },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    submittedAnswer: { type: String, required: true },
    similarityScore: { type: Number, required: true }, // 0 to 1, from our Jaccard similarity function
    confidence: { type: String, enum: ["low", "medium", "high"], required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Claim", claimSchema);