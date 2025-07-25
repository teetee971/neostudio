
function sendMessage() {
  const input = document.getElementById("user-input");
  const chatLog = document.getElementById("chat-log");
  const typing = document.getElementById("typing-indicator");
  const message = input.value.trim();
  if (!message) return;
  
  const userMsg = document.createElement("div");
  userMsg.textContent = "👤: " + message;
  chatLog.appendChild(userMsg);
  input.value = "";

  typing.classList.remove("hidden");

  setTimeout(() => {
    typing.classList.add("hidden");
    const reply = document.createElement("div");
    reply.textContent = "🤖: Réponse simulée de ChatGPT...";
    chatLog.appendChild(reply);
    chatLog.scrollTop = chatLog.scrollHeight;
  }, 1800);
}
