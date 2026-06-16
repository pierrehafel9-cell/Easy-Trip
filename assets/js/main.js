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

  // Bouton flottant "Réserver" mobile
  const fab = document.getElementById('mobile-fab');
  if (fab) {
    const btn = fab.querySelector('.mobile-fab-toggle');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      fab.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if (!fab.contains(e.target)) fab.classList.remove('open');
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') fab.classList.remove('open');
    });
  }
});
