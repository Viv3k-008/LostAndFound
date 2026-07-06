const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  submitClaim,
  getClaimsForFoundItem,
  approveClaim,
  rejectClaim,
} = require("../controllers/claimController");

const router = express.Router();

router.post("/", protect, submitClaim);
router.get("/found/:foundItemId", protect, getClaimsForFoundItem);
router.put("/:id/approve", protect, approveClaim);
router.put("/:id/reject", protect, rejectClaim);

module.exports = router;
