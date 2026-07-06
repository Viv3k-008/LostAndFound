const express = require("express");
const multer = require("multer");
const { protect } = require("../middleware/authMiddleware");
const {
  createFoundItem,
  getFoundItems,
  getFoundItemById,
  getMyFoundItems,
} = require("../controllers/foundItemController");

const upload = multer({ dest: "uploads/" });
const router = express.Router();

router.route("/").get(getFoundItems).post(protect, upload.single("image"), createFoundItem);
router.get("/mine", protect, getMyFoundItems);
router.get("/:id", getFoundItemById);

module.exports = router;
