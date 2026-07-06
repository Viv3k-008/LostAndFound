const FoundItem = require("../models/FoundItem");
const LostItem = require("../models/LostItem");
const cloudinary = require("../config/cloudinary");
const { calculateMatchScore } = require("../utils/matching");
const sendEmail = require("../utils/sendEmail");

const MATCH_THRESHOLD = 50;

const createFoundItem = async (req, res) => {
  try {
    const { category, description, location, dateFound, verificationQuestion, verificationAnswer } = req.body;
    if (!category || !description || !location || !dateFound || !verificationQuestion || !verificationAnswer) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const imagePath = req.file ? req.file.path : null;
    if (!imagePath) {
      return res.status(400).json({ message: "A photo of the found item is required" });
    }

    const uploadedImage = await cloudinary.uploader.upload(imagePath);

    const foundItem = await FoundItem.create({
      postedBy: req.user._id,
      category,
      description,
      location,
      dateFound,
      imageUrl: uploadedImage.secure_url,
      verificationQuestion,
      verificationAnswer,
    });

    // Direction A from our design: finder posts, check against all existing open lost items
    const openLostItems = await LostItem.find({ status: "open" }).populate("postedBy", "name email");
    const matches = openLostItems
      .map((lostItem) => ({ lostItem, score: calculateMatchScore(lostItem, foundItem) }))
      .filter((m) => m.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    // Notify each matched loser individually — they might not check the app proactively
    for (const match of matches) {
      try {
        await sendEmail(
          match.lostItem.postedBy.email,
          "Possible match found for your lost item",
          `A found item was posted that may match your lost ${match.lostItem.category}. Log in to view and claim it.`
        );
      } catch (emailError) {
        console.error("Match notification email failed:", emailError);
      }
    }

    // Never return verificationAnswer in the response, even to the poster's own confirmation payload
    const { verificationAnswer: _omit, ...safeFoundItem } = foundItem.toObject();
    res.status(201).json({ foundItem: safeFoundItem, matchesNotified: matches.length });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Public browse feed — verificationAnswer is always excluded here
const getFoundItems = async (req, res) => {
  try {
    const items = await FoundItem.find({ status: "open" }).select("-verificationAnswer");
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getFoundItemById = async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id).select("-verificationAnswer");
    if (!item) return res.status(404).json({ message: "Found item not found" });
    res.status(200).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyFoundItems = async (req, res) => {
  try {
    // the poster IS allowed to see their own verification answer, to double check it later
    const items = await FoundItem.find({ postedBy: req.user._id });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createFoundItem, getFoundItems, getFoundItemById, getMyFoundItems };
