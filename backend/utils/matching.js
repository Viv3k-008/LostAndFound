const { processText } = require("./textProcessor");

/**
 * Jaccard similarity between two pieces of text: size of the intersection
 * of their stemmed tokens divided by the size of the union. Returns 0 to 1.
 */
function calculateSimilarity(textA, textB) {
  const setA = new Set(processText(textA));
  const setB = new Set(processText(textB));

  const intersection = new Set([...setA].filter((token) => setB.has(token)));
  const union = new Set([...setA, ...setB]);

  if (union.size === 0) return 0; // avoid divide-by-zero if both texts were empty
  return intersection.size / union.size;
}

function daysBetween(dateA, dateB) {
  return Math.abs(new Date(dateA) - new Date(dateB)) / (1000 * 60 * 60 * 24);
}

/**
 * Combined weighted score (0-400) for how likely a LostItem and FoundItem
 * refer to the same physical item.
 * Category is a hard filter: different categories can never match.
 */
function calculateMatchScore(lostItem, foundItem) {
  if (lostItem.category.trim().toLowerCase() !== foundItem.category.trim().toLowerCase()) {
    return 0;
  }

  let score = 100; // category match is the strongest single signal

  let locationScore = calculateSimilarity(lostItem.location, foundItem.location);
  locationScore *= 100; // scale to 0-100 for weighting
  score += locationScore;

  const days = daysBetween(lostItem.dateLost, foundItem.dateFound);
  if (days <= 3) score += 100;
  else if (days <= 14) score += 40;
  else if (days <= 30) score += 20;

  let descriptionScore = calculateSimilarity(lostItem.description, foundItem.description);
  descriptionScore *= 100; // scale to 0-100 for weighting
  score += descriptionScore;

  // score = final score out of 400
  return Math.round(score/4); // normalized to 0-100% for easier thresholding
}

/**
 * Similarity check for a claimant's answer against the finder's stored answer.
 * Returns a similarity score and a confidence label — this is decision SUPPORT
 * for the finder, not an automatic approve/reject gate.
 */
function checkVerificationAnswer(submittedAnswer, realAnswer) {
  const similarity = calculateSimilarity(submittedAnswer, realAnswer);

  let confidence;
  if (similarity >= 0.7) confidence = "high";
  else if (similarity >= 0.4) confidence = "medium";
  else confidence = "low";

  return { similarity, confidence };
}

module.exports = { calculateSimilarity, calculateMatchScore, checkVerificationAnswer };
