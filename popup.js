// popup.js

// Botão de login para autenticação no Google
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "googleLogin" });
  });
  
  // Função para exibir a lista de contatos
  function renderContactList(contacts) {
    const contactListElement = document.getElementById("contact-list-items");
    contactListElement.innerHTML = ""; // Limpa lista existente
  
    contacts.forEach((contact) => {
      const listItem = document.createElement("li");
      listItem.textContent = contact.email;
      listItem.addEventListener("click", () => {
        fetchEmailHistoryForContact(contact.email);
      });
      contactListElement.appendChild(listItem);
    });
  }
  
  // Função para exibir o histórico de e-mails no DOM
  function renderEmailHistory(history) {
    const emailHistoryList = document.getElementById("email-history-list");
    emailHistoryList.innerHTML = ""; // Limpa o histórico anterior
  
    history.forEach((email) => {
      const listItem = document.createElement("li");
      listItem.innerHTML = `
              <strong>De:</strong> ${email.from} <br>
              <strong>Assunto:</strong> ${email.subject} <br>
              <strong>Data:</strong> ${email.date} <br>
              <strong>Resumo:</strong> ${email.snippet}
          `;
      emailHistoryList.appendChild(listItem);
    });
  }
  
  // Solicita ao background.js a lista de contatos
  chrome.runtime.sendMessage({ type: "requestContactList" });
  
  // Solicita ao background.js o histórico de e-mails de um contato específico
  function fetchEmailHistoryForContact(email) {
    chrome.runtime.sendMessage({ type: "getContactEmailHistory", email });
  }
  
  // // Listener para mensagens do content script
  // chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  //   if (message.type === "getEmailHistory") {
  //     getEmailHistory()
  //       .then((history) => {
  //         sendResponse({ history });
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching email history:", error);
  //         sendResponse({ error: error.message });
  //       });
  //     return true; // Mantém o canal aberto para resposta assíncrona
  //   } else if (message.type === "login") {
  //     getAuthToken()
  //       .then((token) => {
  //         console.log("Token obtained:", token);
  //         sendResponse({ success: true, token });
  //       })
  //       .catch((error) => {
  //         console.error("Login failed:", error);
  //         sendResponse({ success: false, error: error.message });
  //       });
  //     return true;
  //   } else if (message.type === "getContactEmailHistory" && message.email) {
  //     debugger;
  //     getContactEmailHistoryS(message.email)
  //       .then((history) => {
  //         sendResponse({ history });
  //       })
  //       .catch((error) => {
  //         console.error("Error fetching contact email history:", error);
  //         sendResponse({ error: error.message });
  //       });
  //     return true; // Mantém o canal aberto para resposta assíncrona
  //   }
  // });
  
  // content.js
  // content.js
  
  // Função para enviar mensagem ao background.js com o e-mail do contato
  function getContactEmailHistory(email) {
    chrome.runtime.sendMessage(
      { type: "getContactEmailHistory", email: email },
      (response) => {
        console.log("Resposta do histórico de e-mails:", response);
      }
    );
  }
  
  // Exemplo de uso: capturar um evento e chamar a função
  // Digamos que você tenha um elemento no site onde o usuário clica para ver o histórico de e-mails
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("contact-email")) {
      // Suponha que seja o seletor
      const email = event.target.innerText; // Obtém o e-mail do contato
      getContactEmailHistory(email); // Chama a função para buscar o histórico
    }
  });
  
  // Função para detectar o e-mail do contato aberto
  function detectEmailAndSendToBackground() {
    const emailElement = document.querySelector(".gD"); // Seletor que geralmente identifica o remetente
    if (emailElement) {
      const email = emailElement.getAttribute("email"); // Obtém o endereço de e-mail do contato
      if (email) {
        // Envia o endereço de e-mail do contato aberto para o background.js
        chrome.runtime.sendMessage({ type: "getContactEmailHistory", email });
      }
    }
  }
  
  // Monitora a abertura de e-mails
  const observer = new MutationObserver(() => {
    detectEmailAndSendToBackground();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  function getActiveTabId() {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }
        if (tabs.length === 0) {
          reject(new Error("No active tab found"));
          return;
        }
        resolve(tabs[0].id); // Retorna o ID da aba ativa
      });
    });
  }
  document.addEventListener("DOMContentLoaded", () => {
    debugger;
    getActiveTabId().then((f) => injectAndFetchEmail(f));
  });
  
  chrome.runtime.onInstalled.addListener(() => {
    console.log("Ativa CRM extension installed!");
  });
  
  function injectAndFetchEmail(tabId) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: detectEmailAndSendToBackground,
      },
      (results) => {
        debugger;
        if (chrome.runtime.lastError) {
          console.error("Error injecting script:", chrome.runtime.lastError);
          return;
        }
        if (results && results[0] && results[0].result) {
          const email = results[0].result;
          console.log("Detected email:", email);
  
          // Envie o email detectado para onde for necessário
          fetchEmailHistoryFromServer(email);
        }
      }
    );
  }
  
  // content.js
  
  // // Injeta o `injected.js` na página apenas uma vez
  // function injectScript(file) {
  //   if (document.getElementById("injectedScript")) {
  //     // Se o script já foi injetado, não o injete novamente
  //     return;
  //   }
  
  //   const script = document.createElement("script");
  //   script.src = chrome.runtime.getURL(file);
  //   script.id = "injectedScript"; // Define um ID para evitar múltiplas injeções
  //   script.onload = () => script.remove(); // Remove o script após carregá-lo
  //   (document.head || document.documentElement).appendChild(script);
  // }
  
  // // Escuta mensagens do `injected.js` e as repassa para o `background.js`
  // window.addEventListener("message", (event) => {
  //   if (event.source !== window) return; // Ignora mensagens de outras fontes
  //   if (event.data.type === "emailDetected") {
  //     chrome.runtime.sendMessage({ type: "getContactEmailHistory", email: event.data.email });
  //   }
  // });
  
  // // Injeta o `injected.js`
  // injectScript("injected.js");
  