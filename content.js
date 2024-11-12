// content.js
// content.js

// Função para enviar mensagem ao background.js com o e-mail do contato
function getContactEmailHistory(email) {
    chrome.runtime.sendMessage({ type: "getContactEmailHistory", email: email }, (response) => {
        console.log("Resposta do histórico de e-mails:", response);
    });
}

// Exemplo de uso: capturar um evento e chamar a função
// Digamos que você tenha um elemento no site onde o usuário clica para ver o histórico de e-mails
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('contact-email')) {  // Suponha que seja o seletor
        const email = event.target.innerText;  // Obtém o e-mail do contato
        getContactEmailHistory(email);  // Chama a função para buscar o histórico
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
  
  function getUserEmailAddress() {
    const headElement = document.querySelector("head");
    if (headElement) {
        const emailAddress = headElement.getAttribute("data-inboxsdk-user-email-address");
        return emailAddress;
    }
    return null;
}

  // Monitora a abertura de e-mails
  const observer = new MutationObserver(() => {
    detectEmailAndSendToBackground();
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  
  document.addEventListener("DOMContentLoaded", () => {
    debugger;
    detectEmailAndSendToBackground();
  });

// content.js

// Injeta o `injected.js` na página apenas uma vez
function injectScript(file) {
  if (document.getElementById("injectedScript")) {
    // Se o script já foi injetado, não o injete novamente
    return;
  }

  const script = document.createElement("script");
  script.src = chrome.runtime.getURL(file);
  script.id = "injectedScript"; // Define um ID para evitar múltiplas injeções
  script.onload = () => script.remove(); // Remove o script após carregá-lo
  (document.head || document.documentElement).appendChild(script);
}

// Escuta mensagens do `injected.js` e as repassa para o `background.js`
window.addEventListener("message", (event) => {
  if (event.source !== window) return; // Ignora mensagens de outras fontes
  if (event.data.type === "emailDetected") {
    chrome.runtime.sendMessage({ type: "getContactEmailHistory", email: event.data.email });
  }
});

// Injeta o `injected.js`
injectScript("injected.js");
