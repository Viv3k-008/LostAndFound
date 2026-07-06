const mongoose = require("mongoose");

const foundItemSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    dateFound: { type: Date, required: true },
    imageUrl: { type: String, required: true }, // photo of the actual item found
    verificationQuestion: { type: String, required: true },
    verificationAnswer: { type: String, required: true }, // NEVER sent to public queries — see controller
    status: {
      type: String,
      enum: ["open", "claimed", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FoundItem", foundItemSchema);
