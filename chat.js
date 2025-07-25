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
    console.log("🔍 Envoi pour modération...");
    const modResponse = await fetch(FIREBASE_BASE + "/moderate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: message })
    });
    const modData = await modResponse.json();
    console.log("✅ Modération : ", modData);

    if (modData.openai?.flagged || modData.perspective?.TOXICITY?.summaryScore?.value > 0.6) {
      appendMessage("⚠️", "Contenu modéré (toxique ou inapproprié).");
      typing.classList.add("hidden");
      return;
    }

    console.log("💬 Envoi vers GPT-4...");
    const gptResponse = await fetch(FIREBASE_BASE + "/chatTyping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: message })
    });

    if (!gptResponse.ok) throw new Error("Erreur GPT-4: " + gptResponse.status);

    const gptData = await gptResponse.json();
    console.log("✅ Réponse GPT-4 : ", gptData);
    const translated = await maybeTranslate(gptData.reply);
    appendMessage("🤖", translated);
  } catch (err) {
    console.warn("❌ GPT-4 KO, fallback Gemini", err);
    try {
      const gemRes = await fetch(FIREBASE_BASE + "/chatGemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message })
      });
      const gemData = await gemRes.json();
      console.log("✅ Gemini : ", gemData);
      const translated = await maybeTranslate(gemData.reply);
      appendMessage("🤖", translated);
    } catch (err2) {
      console.error("❌ Erreur totale (Gemini aussi KO)", err2);
      appendMessage("❌", "Erreur GPT-4 et Gemini : réponse impossible.");
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

  console.log("🌐 Traduction demandée...");
  const res = await fetch(FIREBASE_BASE + "/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target: "fr" })
  });

  const data = await res.json();
  console.log("✅ Traduction reçue : ", data);
  return data?.deepl || text;
}