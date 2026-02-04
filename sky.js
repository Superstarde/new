/* ========================================= */
/* SENTIENT CINEMATIC NIGHT SKY — JS ADD */
/* ========================================= */

(() => {
  // Create canvas without touching HTML
  const canvas = document.createElement("canvas");
  canvas.id = "sentient-sky";
  document.body.prepend(canvas);

  const ctx = canvas.getContext("2d");
  let w, h, dpr;

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  window.addEventListener("resize", resize);
  resize();

  /* ===================== */
  /* STAR LAYER GENERATION */
  /* ===================== */

  const layers = [
    { count: 420, size: 0.6, alpha: 0.35, drift: 0.002 }, // Infinite
    { count: 140, size: 1.2, alpha: 0.55, drift: 0.006 }, // Awareness
    { count: 18,  size: 1.8, alpha: 0.75, drift: 0.01 }   // Presence
  ];

  const stars = layers.map(layer =>
    Array.from({ length: layer.count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: layer.size * (0.7 + Math.random() * 0.6),
      baseAlpha: layer.alpha * (0.6 + Math.random() * 0.4),
      alpha: layer.alpha,
      phase: Math.random() * Math.PI * 2,
      drift: layer.drift * (0.4 + Math.random())
    }))
  );

  /* ================= */
  /* SHOOTING STAR */
  /* ================= */

  let shootingStar = null;
  const spawnShootingStar = () => {
    shootingStar = {
      x: Math.random() * w * 0.7,
      y: -50,
      vx: 6 + Math.random() * 2,
      vy: 4 + Math.random() * 2,
      life: 0,
      maxLife: 60
    };
    setTimeout(spawnShootingStar, 18000 + Math.random() * 17000);
  };
  setTimeout(spawnShootingStar, 20000);

  /* ================= */
  /* SUBCONSCIOUS INPUT */
  /* ================= */

  let targetParallaxX = 0;
  let targetParallaxY = 0;
  let parallaxX = 0;
  let parallaxY = 0;

  window.addEventListener("mousemove", e => {
    targetParallaxX = (e.clientX / w - 0.5) * 6;
    targetParallaxY = (e.clientY / h - 0.5) * 6;
  });

  /* ================= */
  /* RENDER LOOP */
  /* ================= */

  const draw = () => {
    ctx.clearRect(0, 0, w, h);

    // Atmospheric depth gradient
    const haze = ctx.createRadialGradient(
      w / 2, h / 2, 0,
      w / 2, h / 2, Math.max(w, h)
    );
    haze.addColorStop(0, "rgba(255,255,255,0.015)");
    haze.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, w, h);

    // Ease parallax
    parallaxX += (targetParallaxX - parallaxX) * 0.02;
    parallaxY += (targetParallaxY - parallaxY) * 0.02;

    stars.forEach((layerStars, i) => {
      layerStars.forEach(s => {
        s.phase += s.drift;
        s.alpha = s.baseAlpha * (0.9 + Math.sin(s.phase) * 0.1);

        const depth = i + 1;
        const px = s.x + parallaxX * depth * 0.15;
        const py = s.y + parallaxY * depth * 0.15;

        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });
    });

    // Shooting star (rare, soft)
    if (shootingStar) {
      shootingStar.life++;
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;

      const t = shootingStar.life / shootingStar.maxLife;
      const alpha = Math.min(t * 1.5, 1) * (1 - t);

      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(shootingStar.x, shootingStar.y);
      ctx.lineTo(
        shootingStar.x - shootingStar.vx * 6,
        shootingStar.y - shootingStar.vy * 6
      );
      ctx.stroke();

      if (shootingStar.life > shootingStar.maxLife) {
        shootingStar = null;
      }
    }

    requestAnimationFrame(draw);
  };

  draw();
})();
