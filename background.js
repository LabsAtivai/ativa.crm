chrome.runtime.onInstalled.addListener(() => {
    console.log('Ativa CRM extension installed!');
  });
  
  // Função para autenticação OAuth2 com a API do Gmail
  async function authenticateGmail() {
    const authUrl = 'https://accounts.google.com/o/oauth2/auth';
    // Completar com o processo de OAuth2 para conectar à API Gmail
  }
  
  // Obter e manipular dados do Gmail
  async function getEmailHistory(senderEmail) {
    // Substituir pelo uso de OAuth2 para acesso a dados da API Gmail
  }
// Armazena uma nota para o contato
function saveNoteForContact(email, note) {
    const key = `notas_${email}`;
    chrome.storage.local.set({ [key]: note }, () => {
      console.log('Nota salva!');
    });
  }
  chrome.runtime.onInstalled.addListener(() => {
    console.log("A extensão CRM Ativa foi instalada.");
  });
  
    