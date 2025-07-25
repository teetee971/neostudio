const chatLog = document.getElementById("chat-log");
const input = document.getElementById("user-input");
const typing = document.getElementById("typing-indicator");

const FIREBASE_BASE = "https://us-central1-neostudio-834fa.cloudfunctions.net";

async function sendMessage() {
  const message = input.value.trim();
  if (!message) return;

  appendMessage("👤", message);
  input.value = "";
  typing.classList.remove("hidden");

  try {
    // Étape 1 - modération
    const modResponse = await fetch(FIREBASE_BASE + "/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    const modData = await modResponse.json();
    if (modData.openai.flagged || modData.perspective.TOXICITY?.summaryScore?.value > 0.6) {
      appendMessage("⚠️", "Message refusé (contenu inapproprié détecté).");
      typing.classList.add("hidden");
      return;
    }

    // Étape 2 - appel GPT-4
    const gptResponse = await fetch(FIREBASE_BASE + "/chatTyping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message })
    });

    if (!gptResponse.ok) throw new Error("GPT-4 erreur");

    const gptData = await gptResponse.json();
    const reply = gptData.reply;

    // Option traduction (auto vers FR si réponse anglaise détectée)
    const translated = await maybeTranslate(reply);
    appendMessage("🤖", translated);
  } catch (err) {
    // fallback Gemini
    try {
      const geminiRes = await fetch(FIREBASE_BASE + "/chatGemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message })
      });
      const geminiData = await geminiRes.json();
      const translated = await maybeTranslate(geminiData.reply);
      appendMessage("🤖", translated);
    } catch (err2) {
      appendMessage("❌", "Erreur GPT et Gemini");
    }
  } finally {
    typing.classList.add("hidden");
  }
}

function appendMessage(sender, text) {
  const div = document.createElement("div");
  div.textContent = `${sender}: ${text}`;
  chatLog.appendChild(div);
  chatLog.scrollTop = chatLog.scrollHeight;
}

async function maybeTranslate(text) {
  const isEnglish = /[a-z]{3,}/i.test(text) && !/[éèàçùâêîôûëïüœ]/i.test(text);
  if (!isEnglish) return text;

  const res = await fetch(FIREBASE_BASE + "/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target: "fr" })
  });

  const data = await res.json();
  return data?.deepl || text;
}