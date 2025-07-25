const functions = require("firebase-functions");
const axios = require("axios");

const OPENAI_KEY = functions.config().openai.key;
const DEEPL_KEY = functions.config().deepl.key;
const MODERATION_KEY = functions.config().moderation.key;
const GEMINI_KEY = functions.config().gemini.key;

// GPT-4: Génération de texte
exports.generateText = functions.https.onRequest(async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// DeepL: Traduction
exports.translate = functions.https.onRequest(async (req, res) => {
  try {
    const { text, target_lang } = req.body;
    const response = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({ text, target_lang }),
      {
        headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` }
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Modération IA OpenAI
exports.moderate = functions.https.onRequest(async (req, res) => {
  try {
    const { input } = req.body;
    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      { input },
      {
        headers: {
          Authorization: `Bearer ${MODERATION_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Gemini (Google AI Studio)
exports.gemini = functions.https.onRequest(async (req, res) => {
  try {
    const { prompt } = req.body;
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    res.send(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});