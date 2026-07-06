const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createLostItem,
  getLostItems,
  getMyLostItems,
  getMatchesForLostItem,
} = require("../controllers/lostItemController");

const router = express.Router();

router.route("/").get(getLostItems).post(protect, createLostItem);
router.get("/mine", protect, getMyLostItems);
router.get("/:id/matches", protect, getMatchesForLostItem);

module.exports = router;
