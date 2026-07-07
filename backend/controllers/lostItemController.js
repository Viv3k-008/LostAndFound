const LostItem = require("../models/LostItem");
const FoundItem = require("../models/FoundItem");
const { calculateMatchScore } = require("../utils/matching");
const sendEmail = require("../utils/sendEmail");

const MATCH_THRESHOLD = 50; // minimum score (out of 100) to be considered a real candidate match

// Create a lost item post, then immediately check for existing found-item matches
const createLostItem = async (req, res) => {
  try {
    const { category, description, location, dateLost } = req.body;
    if (!category || !description || !location || !dateLost) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const lostItem = await LostItem.create({
      postedBy: req.user._id,
      category,
      description,
      location,
      dateLost,
    });

    // Direction B from our design: loser posts, check against all existing open found items
    const openFoundItems = await FoundItem.find({ status: "open" });
    const matches = openFoundItems
      .map((foundItem) => ({
        foundItem,
        score: calculateMatchScore(lostItem, foundItem),
      }))
      .filter((m) => m.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    if (matches.length > 0) {
      try {
        await sendEmail(
          req.user.email,
          "Possible match found for your lost item",
          `We found ${matches.length} possible match for your lost ${category}. Log in to view and claim them.`
        );
      } catch (emailError) {
        console.error("Match notification email failed:", emailError);
        // don't block the response just because the email failed
      }
    }

    res.status(201).json({
      lostItem,
      matches: matches.map((m) => ({
        foundItemId: m.foundItem._id,
        category: m.foundItem.category,
        location: m.foundItem.location,
        imageUrl: m.foundItem.imageUrl,
        score: m.score,
      })),
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Browse all open lost items
const getLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ status: "open" }).populate("postedBy", "name email");
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getMyLostItems = async (req, res) => {
  try {
    const items = await LostItem.find({ postedBy: req.user._id });
    res.status(200).json(items);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Re-run matching on demand for a specific lost item (e.g. user revisits later)
const getMatchesForLostItem = async (req, res) => {
  try {
    const lostItem = await LostItem.findById(req.params.id);
    if (!lostItem) return res.status(404).json({ message: "Lost item not found" });

    const openFoundItems = await FoundItem.find({ status: "open" });
    const matches = openFoundItems
      .map((foundItem) => ({ foundItem, score: calculateMatchScore(lostItem, foundItem) }))
      .filter((m) => m.score >= MATCH_THRESHOLD)
      .sort((a, b) => b.score - a.score);

    res.status(200).json(
      matches.map((m) => ({
        foundItemId: m.foundItem._id,
        category: m.foundItem.category,
        description: m.foundItem.description,
        location: m.foundItem.location,
        imageUrl: m.foundItem.imageUrl,
        score: m.score,
      }))
    );
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createLostItem, getLostItems, getMyLostItems, getMatchesForLostItem };
