
const input = document.querySelector('#chat-input input');
const button = document.querySelector('#chat-input button');
const messages = document.getElementById('chat-messages');

function typeText(target, text, speed = 20) {
  return new Promise((resolve) => {
    let i = 0;
    const interval = setInterval(() => {
      target.innerHTML += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        resolve();
      }
    }, speed);
  });
}

button.onclick = async () => {
  const userMsg = input.value.trim();
  if (!userMsg) return;

  messages.innerHTML += `<p><strong>Moi :</strong> ${userMsg}</p>`;
  input.value = '';
  button.disabled = true;

  try {
    const res = await fetch("https://us-central1-neostudio-834fa.cloudfunctions.net/chatTyping", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: userMsg })
    });

    const data = await res.json();
    const aiMsg = data.reply || "[pas de réponse]";
    const p = document.createElement("p");
    p.innerHTML = "<strong>GPT-4 :</strong> ";
    messages.appendChild(p);
    await typeText(p, aiMsg);
  } catch (err) {
    console.error("Erreur:", err);
    messages.innerHTML += `<p><strong>Erreur :</strong> ${err.message}</p>`;
  }

  messages.scrollTop = messages.scrollHeight;
  button.disabled = false;
};
