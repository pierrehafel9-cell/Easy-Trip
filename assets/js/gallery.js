// Easy Trip — carousel photos du kit
(function () {
  const gallery = document.getElementById('kit-gallery');
  if (!gallery) return;

  const track = gallery.querySelector('.gallery-track');
  const slides = Array.from(gallery.querySelectorAll('.gallery-slide'));
  const prevBtn = gallery.querySelector('.gallery-arrow.prev');
  const nextBtn = gallery.querySelector('.gallery-arrow.next');
  const dotsContainer = gallery.querySelector('.gallery-dots');
  const thumbs = Array.from(document.querySelectorAll('.gallery-thumb'));

  // Crée les dots
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Photo ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  });
  const dots = Array.from(dotsContainer.children);

  let index = 0;

  function currentIndex() {
    const slideWidth = slides[0].offsetWidth + 16; // gap
    return Math.round(track.scrollLeft / slideWidth);
  }
  function updateUI() {
    dots.forEach((d, idx) => d.classList.toggle('active', idx === index));
    thumbs.forEach((t, idx) => t.classList.toggle('active', idx === index));
  }
  function goTo(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    slides[index].scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    updateUI();
  }

  thumbs.forEach((t, i) => t.addEventListener('click', () => goTo(i)));

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  track.addEventListener('scroll', () => {
    clearTimeout(track._t);
    track._t = setTimeout(() => {
      index = currentIndex();
      updateUI();
    }, 80);
  });

  // Auto-play léger (toutes les 6 sec, stoppé au hover/touch)
  let auto = setInterval(() => {
    goTo(index >= slides.length - 1 ? 0 : index + 1);
  }, 6000);
  ['mouseenter', 'touchstart'].forEach(ev =>
    gallery.addEventListener(ev, () => { clearInterval(auto); }, { passive: true })
  );
})();
