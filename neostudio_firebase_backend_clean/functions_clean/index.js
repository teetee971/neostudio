const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Configuration, OpenAIApi } = require("openai");
const fetch = require("node-fetch");
require("dotenv").config();

admin.initializeApp();

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

exports.chatGPT = functions.https.onRequest(async (req, res) => {
  const msg = req.body.message;
  const completion = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [{ role: "user", content: msg }]
  });
  res.json({ response: completion.data.choices[0].message.content });
});

exports.moderation = functions.https.onRequest(async (req, res) => {
  const content = req.body.text;
  const result = await openai.createModeration({ input: content });
  res.json(result.data.results[0]);
});

exports.translate = functions.https.onRequest(async (req, res) => {
  const text = req.body.text;
  const target = req.body.target || "EN";
  const deeplKey = process.env.DEEPL_API_KEY;
  const response = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `auth_key=${deeplKey}&text=${encodeURIComponent(text)}&target_lang=${target}`
  });
  const data = await response.json();
  res.json({ translation: data.translations[0].text });
});
