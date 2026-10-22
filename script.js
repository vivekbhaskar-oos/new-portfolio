const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");
const navigationLinks = document.querySelectorAll(".nav-link");
const observedSections = document.querySelectorAll("#home, #projects, #timeline, #skills, #contact");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    menuButton.innerHTML = `<i class="fa-solid ${isOpen ? "fa-xmark" : "fa-bars"}" aria-hidden="true"></i>`;
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
      menuButton.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
  });
}

if ("IntersectionObserver" in window && observedSections.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navigationLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );

  observedSections.forEach((section) => sectionObserver.observe(section));
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

document.querySelectorAll(".star-canvas").forEach((canvas) => {
  const context = canvas.getContext("2d");
  if (!context) return;

  const section = canvas.parentElement;
  let width = 0;
  let height = 0;
  let animationFrame = 0;
  let particles = [];
  let isInView = false;

  const resizeCanvas = () => {
    const bounds = section.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = bounds.width;
    height = bounds.height;
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = Math.min(125, Math.max(48, Math.round((width * height) / 9000)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.34,
      vy: (Math.random() - 0.5) * 0.34,
      radius: 1.25 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2,
      drift: 0.4 + Math.random() * 0.6,
      hue: Math.random() > 0.72 ? 205 : Math.random() > 0.5 ? 174 : 188,
    }));

    draw(false);
  };

  const draw = (move) => {
    context.clearRect(0, 0, width, height);
    const time = performance.now() / 650;

    particles.forEach((particle) => {
      if (move) {
        particle.x += particle.vx * particle.drift;
        particle.y += particle.vy * particle.drift;
        if (particle.x < 0 || particle.x > width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > height) particle.vy *= -1;
      }

      const twinkle = 0.52 + (Math.sin(time + particle.phase) + 1) * 0.22;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = `hsla(${particle.hue}, 85%, 82%, ${twinkle})`;
      context.shadowBlur = 10;
      context.shadowColor = `hsla(${particle.hue}, 100%, 68%, ${twinkle * 0.78})`;
      context.fill();
      context.shadowBlur = 0;
    });

    context.lineWidth = Math.max(1.4, Math.min(2.8, width / 420));
    context.lineCap = "round";

    for (let band = 0; band < 3; band += 1) {
      const baseline = height * (0.3 + band * 0.2);
      const amplitude = Math.max(16, Math.min(48, height * 0.065));
      const gradient = context.createLinearGradient(0, baseline, width, baseline);
      gradient.addColorStop(0, "rgba(19, 229, 197, 0)");
      gradient.addColorStop(0.28, "rgba(19, 229, 197, 0.28)");
      gradient.addColorStop(0.62, "rgba(94, 151, 255, 0.32)");
      gradient.addColorStop(1, "rgba(19, 229, 197, 0)");

      context.beginPath();
      for (let x = 0; x <= width; x += 12) {
        const normalizedX = x / Math.max(width, 1);
        const wave = Math.sin(normalizedX * Math.PI * 3.4 + time * 0.64 + band)
          + Math.sin(normalizedX * Math.PI * 1.8 - time * 0.4 + band * 1.7) * 0.38;
        const y = baseline + wave * amplitude;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }

      context.strokeStyle = gradient;
      context.shadowBlur = 16;
      context.shadowColor = band % 2 === 0
        ? "rgba(13, 220, 194, 0.3)"
        : "rgba(77, 123, 255, 0.32)";
      context.stroke();
      context.shadowBlur = 0;
    }
  };

  const animate = () => {
    animationFrame = 0;
    if (!isInView || document.hidden || prefersReducedMotion.matches) return;
    draw(true);
    animationFrame = window.requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    if (isInView && !document.hidden && !prefersReducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      draw(false);
    }
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  document.addEventListener("visibilitychange", startAnimation);
  prefersReducedMotion.addEventListener("change", startAnimation);

  if ("IntersectionObserver" in window) {
    const visibilityObserver = new IntersectionObserver((entries) => {
      isInView = entries[0].isIntersecting;
      startAnimation();
    });
    visibilityObserver.observe(section);
  } else {
    isInView = true;
    startAnimation();
  }
});