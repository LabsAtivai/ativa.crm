// popup.js

// Botão de login para autenticação no Google
document.getElementById("btnGoogleLogin").addEventListener("click", () => {
    chrome.runtime.sendMessage({ type: "googleLogin" });
});

// Função para exibir a lista de contatos
function renderContactList(contacts) {
    const contactListElement = document.getElementById("contact-list-items");
    contactListElement.innerHTML = ""; // Limpa lista existente

    contacts.forEach(contact => {
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

    history.forEach(email => {
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

// Recebe mensagens do background.js com dados para exibir
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "contactList") {
        renderContactList(message.contacts);
    } else if (message.type === "emailHistory") {
        renderEmailHistory(message.history);
    }
});
