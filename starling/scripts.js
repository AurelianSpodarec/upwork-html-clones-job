"use strict";

document.addEventListener("DOMContentLoaded", function () {
  let prompt = "";
  let messages = null;
  let response = "";
  let loading = false;
  let errorMessage = "";
  let memoryID = Math.floor(new Date().getTime() / 1000);

  const newTextRef = document.querySelector(".chat-box");
  const sendButton = document.querySelector("#send-button");
  const sendIcon = document.querySelector("#button-send-icon");
  const loadingIcon = document.querySelector("#button-send-icon-loading");
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
          if (message.sender === "user") {
            return `
            <div id="js-message-user" class="flex w-full justify-end"><div id="js-messaage-user-content" class="relative max-w-[70%] rounded-3xl bg-[#f4f4f4] px-5 py-2.5 dark:bg-token-main-surface-secondary">${message.text}</div></div>
            `;
          } else {
            return `
            <div id="js-message-ai" class="flex-start leading-5 text-[17px] flex gap-3 text-base juice:gap-4 juice:md:gap-5 juice:lg:gap-6 md:max-w-3xl lg:max-w-[40rem] xl:max-w-[48rem]"><div class="flex-shrink-0 flex flex-col relative items-end"><div class="border border-gray-300 -mt-2.5 rounded-full overflow-hidden p-1 "><img src="https://starlingtrust.com/libreria/imagenes/preloader.gif?v=2" class="h-8 w-8"></div></div><div id="js-message-ai-content" class="bg-white relative flex w-full min-w-0 flex-col agent-turn">${message.text}</div></div>  
            `;
          }
        })
        .join("")
      : `<div id="js-chat-start" class="text-center m-auto"><img src="https://starlingtrust.com/libreria/imagenes/preloader.gif?v=2" class="h-20 w-20 mx-auto"><div><h2 class="text-3xl">Welcome to Starling Advisor AI</h2><p> Ask me anything about Starling, and I'll provide you with the information you need!</p></div></div>`;
  }

  function sendPrompt(user_input) {
    if (user_input.trim() === "") return;
    loading = true;
    toggleLoadingState(true);

    if (messages) {
      let num = messages.length;
      messages = [...messages, { id: num, text: user_input, sender: "user" }];
    } else {
      messages = [{ id: 0, text: user_input, sender: "user" }];
    }
    updateMessages();
    scrollDomToBottom("user");

    
    // https://starling-api.fly.dev/chat
    // https://true-response.fly.dev/api/v1/chat
    // http://localhost:8000/api/v1/chat
    fetch("https://true-response.fly.dev/api/v1/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_id: memoryID, request: user_input })
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.metadata)
        let links = data.metadata.map(item => item.filename)
        console.log(links)
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
      .finally(() => {
        loading = false;
        toggleLoadingState(false);
      });
  }

  function toggleLoadingState(isLoading) {
    if (isLoading) {
      sendIcon.classList.add("hidden");
      loadingIcon.classList.remove("hidden");
      sendButton.disabled = true;
      sendButton.classList.add("opacity-50", "cursor-not-allowed");
    } else {
      sendIcon.classList.remove("hidden");
      loadingIcon.classList.add("hidden");
      sendButton.disabled = false;
      sendButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
  }

  document.querySelector("#user-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !loading) {
      e.preventDefault();
      let user_input = e.target.value;
      e.target.value = "";
      sendPrompt(user_input);
    }
  });

  sendButton.addEventListener("click", function () {
    let user_input = document.querySelector("#user-input").value;
    document.querySelector("#user-input").value = "";
    if (!loading) sendPrompt(user_input);
  });

  updateMessages();
});
