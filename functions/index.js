
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
admin.initializeApp();

exports.generateText = functions.https.onRequest(async (req, res) => {
  const { prompt } = req.body;
  // Simulation
  res.json({ reply: `Réponse générée pour: ${prompt}` });
});

exports.translate = functions.https.onRequest(async (req, res) => {
  const { text, target } = req.body;
  res.json({ deepl: `Traduction (${target}) : ${text}` });
});

exports.moderate = functions.https.onRequest(async (req, res) => {
  const { text } = req.body;
  res.json({ openai: { flagged: false }, perspective: { TOXICITY: { summaryScore: { value: 0.1 }}} });
});

exports.gemini = functions.https.onRequest(async (req, res) => {
  const { prompt } = req.body;
  res.json({ reply: `Réponse Gemini pour: ${prompt}` });
});
