document.addEventListener('DOMContentLoaded', () => {
    // Aguarda a renderização da página para capturar o email do remetente
    setTimeout(() => {
      const emailElement = document.querySelector('.gD'); // Classe geralmente usada para o remetente
      if (emailElement) {
        const email = emailElement.getAttribute('email'); // Captura o atributo de e-mail se presente
        if (email) {
          chrome.runtime.sendMessage({ type: 'getEmailHistory', email }, (response) => {
            console.log(response);
            // Aqui você pode inserir o histórico no DOM
          });
        }
      }
    }, 2000); // Ajuste o tempo se necessário, para garantir que o elemento esteja carregado
  });
  
  