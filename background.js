chrome.runtime.onInstalled.addListener(() => {
  console.log("Ativa CRM extension installed!");
});

async function getAuthToken() {
  return new Promise((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
          if (chrome.runtime.lastError || !token) {
              console.error("Auth token error:", chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
              return;
          }
          console.log("Token obtained:", token);
          resolve(token);
      });
  });
}

// Função para buscar o histórico de e-mails de um contato específico
async function getContactEmailHistory(contactEmail) {
  const token = await getAuthToken();
  const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${contactEmail}`,
      {
          headers: { Authorization: `Bearer ${token}` },
      }
  );

  const data = await response.json();
  if (!data.messages) {
      return []; // Retorna vazio se não houver mensagens
  }

  const emailHistory = [];
  for (const message of data.messages) {
      const msgDetail = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
          {
              headers: { Authorization: `Bearer ${token}` },
          }
      );
      const msgData = await msgDetail.json();
      emailHistory.push({
          from: msgData.payload.headers.find((header) => header.name === "From").value,
          subject: msgData.payload.headers.find((header) => header.name === "Subject").value,
          date: msgData.payload.headers.find((header) => header.name === "Date").value,
          snippet: msgData.snippet,
      });
  }
  return emailHistory;
}

// Ouve as mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getContactEmailHistory" && message.email) {
      getContactEmailHistory(message.email)
          .then((history) => {
              sendResponse({ history });
          })
          .catch((error) => {
              console.error("Error fetching contact email history:", error);
              sendResponse({ error: error.message });
          });
      return true; // Mantém o canal aberto para resposta assíncrona
  }
});
