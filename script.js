(() => {
  const items = [...document.querySelectorAll('.carousel-item')];
  const total = 12;
  const visibleCount = 11;

  const animationDurationRules = [
    { maxItems: 2, duration: 0.8 },
    { maxItems: 4, duration: 0.8 },
    { maxItems: 6, duration: 1 },
    { maxItems: 9, duration: 1 },
    { maxItems: Infinity, duration: 1.2 }
  ];

  let current = 0;
  let lastPositions = new Map();
  const transitionTimeouts = new Map(); // NOVO: controle de timeouts

  const mod = (n, m) => ((n % m) + m) % m;

  function getDuration(count) {
    for (const rule of animationDurationRules)
      if (count <= rule.maxItems) return rule.duration;
    return 1;
  }

  const exitAnimationFraction = 0.7;

  function updateCarousel() {
    const half = Math.floor(visibleCount / 2);
    let visibleIndices = [];
    for (let i = -half; visibleIndices.length < visibleCount; i++) {
      visibleIndices.push(mod(current + i, total));
    }

    const duration = getDuration(visibleCount);
    const centerIndex = Math.floor(visibleCount / 2);

    items.forEach((item, i) => {
      const isVisible = visibleIndices.includes(i);
      const newPos = visibleIndices.indexOf(i);
      const prevPos = lastPositions.get(i);

      const positionChanged =
        prevPos !== undefined &&
        Math.abs(prevPos - newPos) > visibleCount / 2;

      // Cancela timeout anterior se houver
      if (transitionTimeouts.has(i)) {
        clearTimeout(transitionTimeouts.get(i));
        transitionTimeouts.delete(i);
      }

      if (isVisible && positionChanged) {
        item.style.transition = `transform ${duration * exitAnimationFraction}s ease, opacity ${duration * exitAnimationFraction}s ease, filter ${duration * exitAnimationFraction}s ease`;
        item.style.pointerEvents = 'none';
        item.style.opacity = 0;
        item.style.zIndex = 0;
        item.style.filter = `blur(6px) brightness(0.5)`;
        item.style.transform = `translate(-50%, -50%) scale(0.3) rotateY(40deg)`;

        const timeout = setTimeout(() => {
          if (!visibleIndices.includes(i)) return;

          const dist = newPos - centerIndex;
          const dir = dist < 0 ? -1 : 1;
          const absDist = Math.abs(dist);

          const offsetX = dir * Math.pow(absDist, 0.8) * 170;
          const rotateY = dir * absDist * 10;
          const scale = 1 - absDist * 0.1;

          let brightness = 1 - absDist * 0.15;
          brightness = Math.max(brightness, 0.5);

          const filter = absDist > visibleCount / 2
            ? `blur(6px) brightness(${brightness})`
            : `brightness(${brightness})`;

          const zIndex = 100 - absDist;

          item.style.transition = `transform ${duration}s ease, filter ${duration}s ease, opacity ${duration}s ease`;
          item.style.pointerEvents = 'auto';
          item.style.zIndex = zIndex;
          item.style.opacity = 1;
          item.style.filter = filter;
          item.style.transform = `translate(-50%, -50%) translateX(${offsetX}px) scale(${scale}) rotateY(${rotateY}deg)`;

          transitionTimeouts.delete(i);
        }, duration * exitAnimationFraction * 800);

        transitionTimeouts.set(i, timeout);
        lastPositions.set(i, newPos);
        return;
      }

      if (isVisible) {
        const dist = newPos - centerIndex;
        const dir = dist < 0 ? -1 : 1;
        const absDist = Math.abs(dist);

        const offsetX = dir * Math.pow(absDist, 0.8) * 175;
        const rotateY = dir * absDist * 10;
        const scale = 1 - absDist * 0.1;

        let brightness = 1 - absDist * 0.15;
        brightness = Math.max(brightness, 0.5);

        const filter = absDist > visibleCount / 2
          ? `blur(6px) brightness(${brightness})`
          : `brightness(${brightness})`;

        const zIndex = 100 - absDist;

        item.style.transition = `transform ${duration}s ease, filter ${duration}s ease, opacity ${duration}s ease`;
        item.style.pointerEvents = 'auto';
        item.style.zIndex = zIndex;
        item.style.opacity = 1;
        item.style.filter = filter;
        item.style.transform = `translate(-50%, -50%) translateX(${offsetX}px) scale(${scale}) rotateY(${rotateY}deg)`;

        lastPositions.set(i, newPos);
      } else {
        item.style.transition = `transform ${duration}s ease, opacity ${duration}s ease, filter ${duration}s ease`;
        item.style.pointerEvents = 'none';
        item.style.opacity = 0;
        item.style.zIndex = 0;
        item.style.filter = `blur(6px) brightness(0.5)`;
        item.style.transform = `translate(-50%, -50%) scale(0.1) rotateY(0deg)`;

        lastPositions.delete(i);
      }
    });
  }

  // clique para centralizar
  items.forEach((item, i) => {
    item.addEventListener('click', () => {
      current = i;
      updateCarousel();
    });
  });

  // impedir drag da imagem
  document.querySelectorAll('.carousel-item img').forEach(img => {
    img.addEventListener('dragstart', e => e.preventDefault());
  });

  // Drag com pointer events
  let isDragging = false;
  let startX = 0;
  let moved = false;

  const carousel = document.querySelector('.carousel');
  carousel.style.cursor = 'grab';

  carousel.addEventListener('pointerdown', e => {
    isDragging = true;
    moved = false;
    startX = e.clientX;
    carousel.setPointerCapture(e.pointerId);
    carousel.style.cursor = 'grabbing';
  });

  carousel.addEventListener('pointermove', e => {
    if (!isDragging) return;
    const diff = e.clientX - startX;
    if (Math.abs(diff) > 10) moved = true;
  });

  carousel.addEventListener('pointerup', e => {
    if (!isDragging) return;
    const diff = e.clientX - startX;

    if (moved && Math.abs(diff) > 50) {
      if (diff > 0) current = mod(current - 1, total);
      else current = mod(current + 1, total);
      updateCarousel();
    }

    isDragging = false;
    moved = false;
    carousel.releasePointerCapture(e.pointerId);
    carousel.style.cursor = 'grab';
  });

  carousel.addEventListener('pointerleave', e => {
    if (!isDragging) return;
    isDragging = false;
    moved = false;
    carousel.style.cursor = 'grab';
    carousel.releasePointerCapture(e.pointerId);
  });

  updateCarousel();
})();