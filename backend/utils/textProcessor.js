const natural = require("natural");

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common words that carry no distinguishing meaning for item-matching purposes
const STOPWORDS = new Set([
  "the", "a", "an", "is", "with", "in", "on", "at", "and",
  "of", "to", "it", "this", "that", "was", "were", "has", "have",
]);

/**
 * Converts raw text into a clean array of stemmed, meaningful tokens.
 * Pipeline: lowercase -> tokenize -> remove stopwords -> stem.
 */
function processText(text) {
  if (!text) return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filteredTokens = tokens.filter((token) => !STOPWORDS.has(token));
  const stemmedTokens = filteredTokens.map((token) => stemmer.stem(token));
  return stemmedTokens;
}

module.exports = { processText };
