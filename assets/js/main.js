// Easy Trip — script global

// Année dans le footer
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Toggle menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
  }

  // Détail accessoire (bouton "i" dans le formulaire de réservation)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.option-info');
    if (btn) {
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        const wasOpen = !target.hidden;
        document.querySelectorAll('.option-detail').forEach((d) => { d.hidden = true; });
        target.hidden = wasOpen;
      }
    }
  });

  // Fenêtre de chat flottante -> WhatsApp
  const fabToggle = document.getElementById('mobile-fab-toggle');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-panel-close');
  const chatInput = document.getElementById('chat-panel-input');
  const chatSend = document.getElementById('chat-panel-send');
  if (fabToggle && chatPanel) {
    const closeChat = () => {
      chatPanel.classList.remove('open');
      fabToggle.setAttribute('aria-expanded', 'false');
    };
    fabToggle.addEventListener('click', () => {
      const open = chatPanel.classList.toggle('open');
      fabToggle.setAttribute('aria-expanded', open);
      if (open) chatInput.focus();
    });
    chatClose.addEventListener('click', closeChat);
    chatSend.addEventListener('click', () => {
      const text = chatInput.value.trim() || "Bonjour, j'ai une question sur Easy Trip :";
      window.open('https://wa.me/33645044547?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
    document.addEventListener('click', (e) => {
      if (chatPanel.classList.contains('open') && !chatPanel.contains(e.target) && !fabToggle.contains(e.target)) {
        closeChat();
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeChat();
    });
  }
});
