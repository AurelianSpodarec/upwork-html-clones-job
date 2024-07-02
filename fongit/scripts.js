"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let prompt = "";
  let messages = null;
  let response = "";
  let loading = false;
  let errorMessage = "";
  let memoryID = Math.floor(new Date().getTime() / 1000);

  const newTextRef = document.querySelector(".chat-box");
  let autoScroll = true;
  const currentHeight = { current: 100 };

  function scrollDomToBottom(messageType) {
    const dom = newTextRef;
    if (dom) {
      requestAnimationFrame(() => {
        autoScroll = true;
        if (messageType === "user") {
          currentHeight.current = dom.scrollHeight;
          dom.scrollTo(0, dom.scrollHeight);
        } else {
          if (currentHeight.current !== 350)
            dom.scrollTo(0, currentHeight.current - 100);
        }
      });
    }
  }

  function updateMessages() {
    const chatBox = document.querySelector(".chat-box");
    chatBox.innerHTML = messages
      ? messages
          .map((message) => {
            return `<div class="message ${
              message.sender === "user" ? " text-red-500" : "bot"
            }">
              <div class="message-content">${message.text}</div>
            </div>`;
          })
          .join("")
      : `<div class="message bot">
          <div class="message-content">
            Here are some pro tips to maximize the effectiveness of using an AI language model (LLM) chatbot for obtaining the best answers:
            <ul>
              <li><strong>Provide Context:</strong> Give background information that could influence the answer.</li>
              <li><strong>Be Specific:</strong> Clearly define your question or problem. Specific details can help the AI provide more accurate and relevant responses.</li>
              <li><strong>Break Down Complex Questions:</strong> If you have a multi-part question, consider breaking it down into simpler, more direct questions. Use follow-up questions if the first response does not completely address your needs.</li>
            </ul>
          </div>
        </div>`;
  }

  function sendPrompt(user_input) {
    if (user_input.trim() === "") return;
    loading = true;

    if (messages) {
      let num = messages.length;
      messages = [...messages, { id: num, text: user_input, sender: "user" }];
    } else {
      messages = [{ id: 0, text: user_input, sender: "user" }];
    }
    updateMessages();
    scrollDomToBottom("user");

    fetch("https://starling-api.fly.dev/chat/gf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_id: memoryID, user_input: user_input })
    })
      .then((response) => response.json())
      .then((data) => {
        let links = data.source_nodes;
        response = data.response + "\n\nReferences:\n\n" + links.join("\n\n");
        messages.push({ id: messages.length, text: response, sender: "bot" });
        updateMessages();
        scrollDomToBottom("bot");
      })
      .catch(() => {
        errorMessage = "Network Error! Please try again.";
        messages.push({ id: messages.length, text: errorMessage, sender: "bot" });
        updateMessages();
      })
      .finally(() => (loading = false));
  }

  document.querySelector("#user-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      let user_input = e.target.value;
      e.target.value = "";
      sendPrompt(user_input);
    }
  });

  document.querySelector("#send-button").addEventListener("click", function () {
    let user_input = document.querySelector("#user-input").value;
    document.querySelector("#user-input").value = "";
    if (!loading) sendPrompt(user_input);
  });

  updateMessages();
});