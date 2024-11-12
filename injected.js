// Encapsula todo o código em uma função IIFE para evitar conflitos globais
(function() {
  // Função para detectar o e-mail do remetente ao abrir um e-mail no Gmail
  function detectEmail() {
      // Usa o seletor CSS específico fornecido
      const emailElement = document.querySelector("#\\:o6 > div.adn.ads > div.gs > div.gE.iv.gt > table > tbody > tr:nth-child(1) > td.gF.gK > table > tbody > tr > td > h3.iw.gFxsud > span > span.gD");
      if (emailElement) {
          const email = emailElement.getAttribute("email"); // Obtém o endereço de e-mail
          if (email) {
              // Envia o e-mail do remetente para o content script
              window.postMessage({ type: "emailDetected", email: email }, "*");
          }
      }
  }

  // Executa detectEmail quando a página carrega e observa mudanças no DOM
  window.addEventListener("load", detectEmail);

  // Observador de mutações para detectar novos e-mails abertos sem recarregar a página
  const observer = new MutationObserver(() => {
      detectEmail();
  });

  // Inicia a observação no corpo do documento, incluindo todas as alterações de descendentes
  observer.observe(document.body, { childList: true, subtree: true });

})();
