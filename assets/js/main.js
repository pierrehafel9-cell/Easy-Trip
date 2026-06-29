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

  // Bande d'avis clients (charge les avis validés s'il y en a)
  const track = document.getElementById('reviews-marquee-track');
  if (track) {
    fetch('assets/data/reviews.json')
      .then((r) => r.ok ? r.json() : [])
      .then((reviews) => {
        if (Array.isArray(reviews) && reviews.length > 0) {
          const items = reviews.map((rv) => {
            const stars = '★'.repeat(rv.rating || 5) + '☆'.repeat(5 - (rv.rating || 5));
            return `<span>${stars} « ${rv.message} » — ${rv.name}</span>`;
          });
          track.innerHTML = items.concat(items).join('');
        }
      })
      .catch(() => {});
  }

  // Formulaire "Laisser un avis"
  const reviewForm = document.getElementById('review-form');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = document.getElementById('review-message');
      if (!reviewForm.checkValidity()) {
        msg.className = 'form-message error';
        msg.textContent = 'Merci de compléter tous les champs.';
        msg.hidden = false;
        reviewForm.reportValidity();
        return;
      }
      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Envoi en cours…';

      const payload = {
        name: document.getElementById('r-name').value,
        rating: document.getElementById('r-rating').value,
        message: document.getElementById('r-message').value,
      };

      try {
        const res = await fetch('/api/submit-review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('send failed');
        msg.className = 'form-message success';
        msg.textContent = 'Merci pour votre avis ! Il sera publié sur le site après validation.';
        msg.hidden = false;
        reviewForm.reset();
      } catch (err) {
        msg.className = 'form-message error';
        msg.textContent = "Une erreur est survenue. Réessayez ou écrivez-nous à easytrip.kit@gmail.com.";
        msg.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
      }
    });
  }
});
