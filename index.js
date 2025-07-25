const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
const axios = require("axios");

const OPENAI_KEY = functions.config().openai?.key || "";
const GEMINI_KEY = functions.config().gemini?.key || "";
const DEEPL_KEY = functions.config().deepl?.key || "";

exports.generateText = onRequest(async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
      },
      { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
    );
    res.json({ text: result.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "OpenAI error", detail: err.message });
  }
});

exports.gemini = onRequest(async (req, res) => {
  const { prompt } = req.body;
  try {
    const result = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=" + GEMINI_KEY,
      { contents: [{ parts: [{ text: prompt }] }] }
    );
    res.json({ text: result.data.candidates?.[0]?.content?.parts?.[0]?.text || "..." });
  } catch (err) {
    res.status(500).json({ error: "Gemini error", detail: err.message });
  }
});

exports.translate = onRequest(async (req, res) => {
  const { text, target } = req.body;
  try {
    const result = await axios.post(
      "https://api-free.deepl.com/v2/translate",
      new URLSearchParams({ text, target_lang: target || "FR" }),
      { headers: { Authorization: `DeepL-Auth-Key ${DEEPL_KEY}` } }
    );
    res.json({ deepl: result.data.translations[0].text });
  } catch (err) {
    res.status(500).json({ error: "DeepL error", detail: err.message });
  }
});

exports.moderate = onRequest(async (req, res) => {
  const { text } = req.body;
  try {
    const openaiRes = await axios.post(
      "https://api.openai.com/v1/moderations",
      { input: text },
      { headers: { Authorization: `Bearer ${OPENAI_KEY}` } }
    );
    const flagged = openaiRes.data.results[0].flagged;
    res.json({ openai: { flagged } });
  } catch (err) {
    res.status(500).json({ error: "Moderation error", detail: err.message });
  }
});