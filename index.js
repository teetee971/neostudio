const functions = require('firebase-functions');
const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fonction /chatGemini
exports.chatGemini = onRequest(async (req, res) => {
  const prompt = req.body.prompt || "Bonjour, que puis-je faire pour vous ?";
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ response: response.text() });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
});

// Fonction /chatTyping (simulate typing)
exports.chatTyping = functions.https.onCall(async (data, context) => {
  const text = data.prompt || "Génération...";
  const chunks = text.split(" ");
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));
  let result = "";
  for (let i = 0; i < chunks.length; i++) {
    result += chunks[i] + " ";
    await delay(80);
  }
  return { result };
});