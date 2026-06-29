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
});
