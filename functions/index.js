const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

// GPT-4 (OpenAI)
exports.chatTyping = functions.https.onRequest(async (req, res) => {
  const prompt = req.body.prompt;
  if (!prompt) return res.status(400).json({ error: "Prompt requis." });

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }]
    }, {
      headers: {
        "Authorization": `Bearer ${functions.config().openai.key}`,
        "Content-Type": "application/json"
      }
    });

    res.json({ reply: response.data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Erreur GPT-4", detail: err.message });
  }
});

// Gemini AI
exports.chatGemini = functions.https.onRequest(async (req, res) => {
  const prompt = req.body.prompt;
  try {
    const response = await axios.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      contents: [{ parts: [{ text: prompt }] }]
    }, {
      headers: { "Content-Type": "application/json" },
      params: { key: functions.config().gemini.key }
    });

    const content = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "Réponse vide.";
    res.json({ reply: content });
  } catch (err) {
    res.status(500).json({ error: "Erreur Gemini", detail: err.message });
  }
});

// Modération (1st Gen forcée)
exports.moderate = functions.https.onRequest(async (req, res) => {
  const text = req.body.text;
  try {
    const mod = await axios.post("https://api.openai.com/v1/moderations", {
      input: text
    }, {
      headers: { "Authorization": `Bearer ${functions.config().openai.key}` }
    });

    const perspective = await axios.post(`https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${functions.config().perspective.key}`, {
      comment: { text },
      languages: ["fr", "en"],
      requestedAttributes: {
        TOXICITY: {}, INSULT: {}, THREAT: {}
      }
    });

    res.json({
      openai: mod.data.results[0],
      perspective: perspective.data.attributeScores
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur modération", detail: err.message });
  }
});

// Traduction (DeepL + Azure)
exports.translate = functions.https.onRequest(async (req, res) => {
  const { text, target } = req.body;
  if (!text || !target) return res.status(400).json({ error: "Champs requis." });

  try {
    const deepl = await axios.post("https://api-free.deepl.com/v2/translate", null, {
      params: {
        auth_key: functions.config().deepl.key,
        text,
        target_lang: target.toUpperCase()
      }
    });

    const azure = await axios.post("https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=" + target, [
      { Text: text }
    ], {
      headers: {
        "Ocp-Apim-Subscription-Key": functions.config().azure.key,
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Region": "global"
      }
    });

    res.json({
      deepl: deepl.data.translations[0].text,
      azure: azure.data[0].translations[0].text
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur traduction", detail: err.message });
  }
});