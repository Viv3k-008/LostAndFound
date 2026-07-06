const mongoose = require("mongoose");

const lostItemSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    dateLost: { type: Date, required: true },
    imageUrl: { type: String }, // optional reference photo, if the owner has one
    status: {
      type: String,
      enum: ["open", "resolved"],
      default: "open",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LostItem", lostItemSchema);
