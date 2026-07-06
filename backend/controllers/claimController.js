const Claim = require("../models/Claim");
const FoundItem = require("../models/FoundItem");
const LostItem = require("../models/LostItem");
const { checkVerificationAnswer, calculateMatchScore } = require("../utils/matching");
const sendEmail = require("../utils/sendEmail");

const MATCH_THRESHOLD = 50;       // same bar used everywhere else in the app
const CLEAR_WINNER_MARGIN = 15;   // top score must beat the runner-up by this much to auto-resolve

// Claimant submits an answer to the finder's verification question
const submitClaim = async (req, res) => {
  try {
    const { foundItemId, submittedAnswer } = req.body;
    if (!foundItemId || !submittedAnswer) {
      return res.status(400).json({ message: "Please provide the found item and your answer" });
    }

    // Full document here (including verificationAnswer) — this is an internal server-side read, never sent to client
    const foundItem = await FoundItem.findById(foundItemId).populate("postedBy", "name email");
    if (!foundItem) return res.status(404).json({ message: "Found item not found" });
    if (foundItem.status !== "open") {
      return res.status(400).json({ message: "This item is no longer available to claim" });
    }

    const { similarity, confidence } = checkVerificationAnswer(submittedAnswer, foundItem.verificationAnswer);

    const claim = await Claim.create({
      foundItem: foundItemId,
      claimedBy: req.user._id,
      submittedAnswer,
      similarityScore: similarity,
      confidence,
    });

    try {
      await sendEmail(
        foundItem.postedBy.email,
        "New claim on your found item",
        `Someone submitted a claim on your found ${foundItem.category} with ${confidence} confidence. Log in to review it.`
      );
    } catch (emailError) {
      console.error("Claim notification email failed:", emailError);
    }

    res.status(201).json({ message: "Claim submitted for the finder's review", confidence });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Finder views all claims made on one of their found items (to compare answers themselves)
const getClaimsForFoundItem = async (req, res) => {
  try {
    const foundItem = await FoundItem.findById(req.params.foundItemId);
    if (!foundItem) return res.status(404).json({ message: "Found item not found" });

    if (foundItem.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view these claims" });
    }

    const claims = await Claim.find({ foundItem: req.params.foundItemId })
      .populate("claimedBy", "name email phone")
      .sort({ similarityScore: -1 });

    res.status(200).json(claims);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Finder approves a claim: reveals contact info, resolves the found item and the
// claimant's matching lost item (if one can be identified unambiguously)
const approveClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id)
      .populate("foundItem")
      .populate("claimedBy", "name email phone");

    if (!claim) return res.status(404).json({ message: "Claim not found" });

    const foundItem = claim.foundItem;
    if (foundItem.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to approve this claim" });
    }

    claim.status = "approved";
    await claim.save();

    foundItem.status = "claimed";
    await foundItem.save();

    // Resolve the claimant's matching lost item, if one can be identified with
    // confidence. There's no lostItemId on the claim to trust directly, so we
    // score every open lost post this claimant has against the approved found
    // item using the same calculateMatchScore already used for match listings,
    // and only act when there's a single, clearly-best candidate.
    const candidateLostItems = await LostItem.find({
      postedBy: claim.claimedBy._id,
      status: "open",
    });

    if (candidateLostItems.length > 0) {
      const scored = candidateLostItems
        .map((lostItem) => ({ lostItem, score: calculateMatchScore(lostItem, foundItem) }))
        .filter((m) => m.score >= MATCH_THRESHOLD)
        .sort((a, b) => b.score - a.score);

      // Only auto-resolve if there's a clear winner — a single candidate above
      // threshold, or a top score that clearly beats the runner-up. Otherwise
      // it's ambiguous, and leaving everything open is safer than guessing.
      const isClearWinner =
        scored.length === 1 || (scored.length > 1 && scored[0].score - scored[1].score >= CLEAR_WINNER_MARGIN);

      if (scored.length > 0 && isClearWinner) {
        scored[0].lostItem.status = "resolved";
        await scored[0].lostItem.save();
      }
      // else: no candidate cleared the threshold, or it was a close call — do nothing
    }

    // Reject any other pending claims on the same item — it's been claimed now
    await Claim.updateMany(
      { foundItem: foundItem._id, status: "pending", _id: { $ne: claim._id } },
      { status: "rejected" }
    );

    const finder = await require("../models/User").findById(foundItem.postedBy);

    sendEmail(
      claim.claimedBy.email,
      "Your claim has been approved!",
      `Congratulations! Your claim on the found ${foundItem.category} has been approved. You can now contact the finder:\n\nName: ${finder.name}\nEmail: ${finder.email}\nPhone: ${finder.phone || "N/A"}`
    ).catch((emailError) => {
      console.error("Claim approval email failed:", emailError);
    });

    res.status(200).json({
      message: "Claim approved — contact details revealed",
      finderContact: { name: finder.name, email: finder.email, phone: finder.phone },
      claimantContact: { name: claim.claimedBy.name, email: claim.claimedBy.email, phone: claim.claimedBy.phone },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id).populate("foundItem");
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    if (claim.foundItem.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to reject this claim" });
    }

    claim.status = "rejected";
    await claim.save();

    res.status(200).json({ message: "Claim rejected" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { submitClaim, getClaimsForFoundItem, approveClaim, rejectClaim };