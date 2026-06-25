// Easy Trip — logique de réservation
// Calcule le tarif selon dates (basse / haute saison) + options (flat / par jour / par personne / par semaine et personne).

(function () {
  const RATES = {
    low: 35,   // Basse saison : sept → juin
    high: 45,  // Haute saison : juillet & août
  };
  const CAUTION = 500;
  const HIGH_MONTHS = new Set([6, 7]); // juillet (6) & août (7)
  const PORTE_VELO_NAME = 'Porte-vélos (2 vélos)';
  const PORTE_VELO_LEAD_DAYS = 15;

  const form = document.getElementById('reservation-form');
  if (!form) return;

  const startInput = document.getElementById('date-start');
  const endInput = document.getElementById('date-end');
  const personsInput = document.getElementById('persons');
  const summaryDates = document.getElementById('summary-dates');
  const summaryBase = document.getElementById('summary-base');
  const summaryRate = document.getElementById('summary-rate');
  const summaryTotal = document.getElementById('summary-total');
  const summaryOptionsBlock = document.getElementById('summary-options-block');
  const summaryOptions = document.getElementById('summary-options');
  const durationHint = document.getElementById('duration-hint');
  const formMessage = document.getElementById('form-message');
  const submitBtn = document.getElementById('submit-btn');

  const today = new Date().toISOString().split('T')[0];
  startInput.min = today;
  endInput.min = today;

  startInput.addEventListener('change', () => {
    if (startInput.value) {
      const next = new Date(startInput.value);
      next.setDate(next.getDate() + 1);
      endInput.min = next.toISOString().split('T')[0];
      if (endInput.value && endInput.value <= startInput.value) {
        endInput.value = endInput.min;
      }
    }
    updateSummary();
  });
  endInput.addEventListener('change', updateSummary);
  personsInput.addEventListener('change', updateSummary);

  document.querySelectorAll('.option input[type="checkbox"]').forEach(c => {
    c.addEventListener('change', updateSummary);
  });

  function computeBase(start, end) {
    let low = 0, high = 0;
    const d = new Date(start);
    const endD = new Date(end);
    while (d < endD) {
      if (HIGH_MONTHS.has(d.getMonth())) high++;
      else low++;
      d.setDate(d.getDate() + 1);
    }
    return {
      nights: low + high,
      low, high,
      total: low * RATES.low + high * RATES.high,
    };
  }

  function computeOptionPrice(checkbox, nights, persons) {
    const price = parseFloat(checkbox.dataset.price) || 0;
    const type = checkbox.dataset.priceType || 'flat';
    switch (type) {
      case 'per-day':
        return price * nights;
      case 'per-person':
        return price * persons;
      case 'per-week-per-person':
        return price * Math.max(1, Math.ceil(nights / 7)) * persons;
      case 'flat':
      default:
        return price;
    }
  }

  function fmt(n) { return n.toFixed(0) + ' €'; }

  function updateSummary() {
    const start = startInput.value;
    const end = endInput.value;
    const persons = parseInt(personsInput.value, 10) || 1;
    let base = { nights: 0, low: 0, high: 0, total: 0 };
    if (start && end && end > start) {
      base = computeBase(start, end);
    }

    summaryDates.textContent = base.nights > 0
      ? `${base.nights} nuit${base.nights > 1 ? 's' : ''} · ${persons} pers.`
      : '— nuit(s)';

    if (base.nights > 0) {
      let rateLabel = '';
      if (base.high > 0 && base.low > 0) rateLabel = `(${base.low}× 35 € + ${base.high}× 45 €)`;
      else if (base.high > 0) rateLabel = `(${base.high}× 45 € — haute saison)`;
      else rateLabel = `(${base.low}× 35 € — basse saison)`;
      summaryRate.textContent = rateLabel;
      durationHint.textContent = `Durée : ${base.nights} nuit${base.nights > 1 ? 's' : ''}, ${persons} voyageur${persons > 1 ? 's' : ''}.`;
    } else {
      summaryRate.textContent = '';
      durationHint.textContent = 'Sélectionnez vos dates pour voir le tarif.';
    }
    summaryBase.textContent = fmt(base.total);

    // Options
    const selectedOptions = [];
    let optionsTotal = 0;
    document.querySelectorAll('.option input[type="checkbox"]:checked').forEach(c => {
      const name = c.dataset.name;
      const computed = computeOptionPrice(c, base.nights || 1, persons);
      const type = c.dataset.priceType || 'flat';
      selectedOptions.push({ name, price: computed, type });
      optionsTotal += computed;
    });

    if (selectedOptions.length > 0) {
      summaryOptionsBlock.hidden = false;
      summaryOptions.innerHTML = selectedOptions
        .map(o => `<li><span>${o.name}</span><small>${fmt(o.price)}</small></li>`)
        .join('');
    } else {
      summaryOptionsBlock.hidden = true;
      summaryOptions.innerHTML = '';
    }

    const total = base.total + optionsTotal;
    summaryTotal.textContent = fmt(total);
  }

  // Vérifie si le porte-vélos peut être réservé (15 j à l'avance minimum)
  function validatePorteVelo() {
    const veloCheckbox = document.querySelector(`.option input[data-name="${PORTE_VELO_NAME}"]`);
    if (!veloCheckbox || !veloCheckbox.checked) return true;
    if (!startInput.value) return true;
    const start = new Date(startInput.value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((start - now) / (1000 * 60 * 60 * 24));
    if (diffDays < PORTE_VELO_LEAD_DAYS) {
      showMessage(
        `Le porte-vélos doit être réservé au moins ${PORTE_VELO_LEAD_DAYS} jours avant le départ. ` +
        `Choisissez une date plus éloignée ou décochez l'option porte-vélos.`,
        'error'
      );
      return false;
    }
    return true;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    formMessage.hidden = true;

    if (!startInput.value || !endInput.value || endInput.value <= startInput.value) {
      showMessage('Merci de choisir des dates valides (retour postérieur au départ).', 'error');
      return;
    }
    if (!validatePorteVelo()) return;
    if (!form.checkValidity()) {
      showMessage('Merci de compléter tous les champs obligatoires.', 'error');
      form.reportValidity();
      return;
    }

    const payload = collectPayload();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Préparation du paiement…';

    try {
      const resp = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data.error || `Erreur ${resp.status}`);
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('Réponse Stripe invalide');
    } catch (err) {
      console.error('Erreur Stripe Checkout:', err);
      showMessage(
        'Une erreur est survenue lors de la préparation du paiement : ' + err.message +
        '. Merci de réessayer ou de nous contacter à easytrip.kit@gmail.com.',
        'error'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Payer et réserver';
    }
  });

  function collectPayload() {
    const base = computeBase(startInput.value, endInput.value);
    const persons = parseInt(personsInput.value, 10) || 1;
    const options = [];
    let optionsTotal = 0;
    document.querySelectorAll('.option input[type="checkbox"]:checked').forEach(c => {
      const computed = computeOptionPrice(c, base.nights || 1, persons);
      options.push({
        name: c.dataset.name,
        unitPrice: parseFloat(c.dataset.price) || 0,
        priceType: c.dataset.priceType || 'flat',
        price: computed,
      });
      optionsTotal += computed;
    });

    return {
      kit: 'Kit Easy Trip — SUV / Break',
      dates: { start: startInput.value, end: endInput.value, nights: base.nights, low: base.low, high: base.high },
      persons,
      vehicle: {
        brand: document.getElementById('vehicle-brand').value,
        model: document.getElementById('vehicle-model').value,
        year: document.getElementById('vehicle-year').value,
      },
      customer: {
        firstname: document.getElementById('firstname').value,
        lastname: document.getElementById('lastname').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        message: document.getElementById('message').value,
      },
      options,
      pricing: {
        currency: 'EUR',
        baseTotal: base.total,
        optionsTotal,
        rentalTotal: base.total + optionsTotal,
        caution: CAUTION,
      },
    };
  }

  function showMessage(text, type) {
    formMessage.className = 'form-message ' + type;
    formMessage.textContent = text;
    formMessage.hidden = false;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  updateSummary();
})();
