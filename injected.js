// Encapsula todo o código em uma função IIFE para evitar conflitos globais
(function() {
  // Função para detectar o e-mail do remetente ao abrir um e-mail no Gmail
  function detectEmail() {
    const emailElement = document.querySelector(".gD"); // Seletor para o remetente
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

  const observer = new MutationObserver(detectEmail);
  observer.observe(document.body, { childList: true, subtree: true });
})();
