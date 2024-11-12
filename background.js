chrome.runtime.onInstalled.addListener(() => {
  console.log("Ativa CRM extension installed!");
});

// Função para iniciar o processo de login e obter o token
function authenticateUser(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
          console.error("Erro de autenticação:", chrome.runtime.lastError.message);
          return;
      }
      callback(token);
  });
}

// Função para buscar histórico de e-mails usando o Gmail API
function fetchEmailHistory(email, token) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;

  fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  })
  .then(response => response.json())
  .then(data => {
      console.log("Dados de histórico de e-mails:", data);
      // Processar e enviar os dados para content.js ou popup.js
  })
  .catch(error => {
      console.error("Erro ao buscar histórico de e-mails:", error);
  });
}

// Escuta as mensagens enviadas pelo content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getContactEmailHistory") {
      authenticateUser((token) => {
          fetchEmailHistory(message.email, token);
      });
  }
});

// Função para iniciar o processo de login e obter o token
function authenticateUser(callback) {
  chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
          console.error("Erro de autenticação:", chrome.runtime.lastError.message);
          return;
      }
      callback(token);
  });
}

// Função para buscar histórico de e-mails usando o Gmail API
function fetchEmailHistory(email, token) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${email}`;

  fetch(url, {
      headers: {
          Authorization: `Bearer ${token}`,
      },
  })
  .then(response => response.json())
  .then(data => {
      console.log("Dados de histórico de e-mails:", data);
      // Processar e enviar os dados para content.js ou popup.js
  })
  .catch(error => {
      console.error("Erro ao buscar histórico de e-mails:", error);
  });
}

function getUserEmailAddress() {
  const headElement = document.querySelector("head");
  if (headElement) {
      const emailAddress = headElement.getAttribute("data-inboxsdk-user-email-address");
      return emailAddress;
  }
  return null;
}

// Escuta as mensagens enviadas pelo content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getContactEmailHistory") {
      authenticateUser((token) => {
          fetchEmailHistory(message.email, token);
      });
  }
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

// Função para buscar o histórico geral de e-mails
async function getEmailHistory() {
  const token = await getAuthToken();
  const response = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await response.json();

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

// Função para buscar o histórico de e-mails de um contato específico
async function getContactEmailHistoryS(contactEmail) {
  const token = await getAuthToken();
  const response = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:${contactEmail}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await response.json();
  if (!data.messages) {
    console.log("Nenhuma mensagem encontrada para esse contato.");
    return [];
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

// Listener para mensagens do content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getEmailHistory") {
    getEmailHistory()
      .then((history) => {
        sendResponse({ history });
      })
      .catch((error) => {
        console.error("Error fetching email history:", error);
        sendResponse({ error: error.message });
      });
    return true; // Mantém o canal aberto para resposta assíncrona
  } else if (message.type === "login") {
    getAuthToken()
      .then((token) => {
        console.log("Token obtained:", token);
        sendResponse({ success: true, token });
      })
      .catch((error) => {
        console.error("Login failed:", error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  } else if (message.type === "getContactEmailHistory" && message.email) {
    getContactEmailHistoryS(message.email)
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
