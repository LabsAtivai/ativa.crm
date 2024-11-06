// popup.js
document.getElementById('getHistory').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'getEmailHistory' }, (response) => {
      document.getElementById('history').innerText = JSON.stringify(response);
    });
  });
  document.getElementById('salvarContato').addEventListener('click', () => {
    // Função para salvar o contato
    const nome = document.getElementById('nomeContato').value;
    const email = document.getElementById('emailContato').value;
    const telefone = document.getElementById('telefoneContato').value;
    const notas = document.getElementById('blocoDeNotas').value;
  
    console.log('Salvar Contato:', { nome, email, telefone, notas });
    // Implementar a lógica de salvar o contato
  });
  
  document.getElementById('abrirMensagem').addEventListener('click', () => {
    // Função para abrir a mensagem em uma nova guia
    chrome.tabs.create({ url: 'https://mail.google.com/mail/u/0/#inbox' });
  });
  