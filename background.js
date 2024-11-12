// Autenticação e obtenção de token
async function getAuthToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError || !token) {
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(token);
        });
    });
}

// Função para obter lista de contatos (endereços de e-mail únicos)
async function fetchContactList() {
    const token = await getAuthToken();
    const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();

    const contacts = new Set();
    for (const message of data.messages || []) {
        const msgDetail = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const msgData = await msgDetail.json();
        const fromHeader = msgData.payload.headers.find(h => h.name === "From");
        if (fromHeader) contacts.add(fromHeader.value);
    }

    return Array.from(contacts).map(email => ({ email }));
}

// Função para obter histórico de e-mails de um contato específico
async function getContactEmailHistory(contactEmail) {
    const token = await getAuthToken();
    const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${contactEmail}`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();

    const emailHistory = [];
    for (const message of data.messages || []) {
        const msgDetail = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const msgData = await msgDetail.json();
        emailHistory.push({
            from: msgData.payload.headers.find(h => h.name === "From").value,
            subject: msgData.payload.headers.find(h => h.name === "Subject").value,
            date: msgData.payload.headers.find(h => h.name === "Date").value,
            snippet: msgData.snippet,
        });
    }

    return emailHistory;
}

// Gerencia mensagens de content.js e popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "googleLogin") {
        getAuthToken().catch(error => console.error("Auth error:", error));
    } else if (message.type === "requestContactList") {
        fetchContactList().then(contacts => {
            chrome.runtime.sendMessage({ type: "contactList", contacts });
        });
    } else if (message.type === "getContactEmailHistory") {
        getContactEmailHistory(message.email).then(history => {
            chrome.runtime.sendMessage({ type: "emailHistory", history });
        });
    }
    return true;
});
