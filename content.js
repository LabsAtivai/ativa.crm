// content.js

// Função para detectar o e-mail do contato aberto
function detectEmailAndSendToBackground() {
    const emailElement = document.querySelector(".gD"); // Seletor que geralmente identifica o remetente
    if (emailElement) {
        const email = emailElement.getAttribute("email"); // Obtém o endereço de e-mail do contato
        if (email) {
            // Envia o endereço de e-mail do contato aberto para o background.js
            chrome.runtime.sendMessage({ type: "getContactEmailHistory", email }, (response) => {
                if (chrome.runtime.lastError) {
                    console.error("Erro ao enviar mensagem para o background.js:", chrome.runtime.lastError);
                } else if (response && response.error) {
                    console.error("Erro ao obter histórico de e-mails:", response.error);
                } else {
                    console.log("Histórico de e-mails recebido:", response.history);
                    // Aqui você pode manipular o histórico de e-mails conforme necessário
                }
            });
        }
    }
}

// Observa mudanças na DOM para detectar e-mails conforme são abertos
const observer = new MutationObserver(() => {
    detectEmailAndSendToBackground();
});

observer.observe(document.body, { childList: true, subtree: true });

document.addEventListener("DOMContentLoaded", () => {
    detectEmailAndSendToBackground();
});

// Injeta o `injected.js` na página, evitando múltiplas injeções
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
        chrome.runtime.sendMessage({ type: "getContactEmailHistory", email: event.data.email }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erro ao enviar mensagem para o background.js:", chrome.runtime.lastError);
            } else if (response && response.error) {
                console.error("Erro ao obter histórico de e-mails:", response.error);
            } else {
                console.log("Histórico de e-mails recebido:", response.history);
                // Manipule o histórico de e-mails conforme necessário
            }
        });
    }
});

// Injeta o `injected.js`
injectScript("injected.js");
