/* Film-reel scroll — frames stack vertically; the active one sits dead centre
   with the previous / next frame peeking above and below.
   The strip snaps fast on every interaction, with motion blur while it moves.
   Load at the end of <body>. */
(() => {
  const stage = document.querySelector('.reel-stage');
const track = document.querySelector('.reel-track');
if (!stage || !track) return;
  const slides = [...track.querySelectorAll('.reel-slide')];
  const N = slides.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- tune here ---- */
  const PITCH  = 1.045; // frame spacing as a fraction of frame height (higher = bigger gap, smaller peek)
  const DIM    = 0.5;   // how dark the peeking frames are (0 = none)
  const SHRINK = 0.05;  // how much smaller the peeking frames are
  const BLUR   = 0.55;  // motion blur while scrolling (0 = off)
  const SNAP   = 560;   // base ms for one step; more frames = a bit longer, still fast

  let pos = 0, cur = 0, pitch = 0, raf = 0, moved = 0, lastWheel = 0;
  const mod = (n, m) => ((n % m) + m) % m;

  function layout() { pitch = track.offsetHeight * PITCH; render(0); }

  function render(v) {                                   // v = speed in frames / second
    const blur = reduce ? 0 : Math.min(7, Math.abs(v) * BLUR);
    slides.forEach((s, i) => {
      const p  = mod(i - pos + N / 2, N) - N / 2;        // signed distance from centre, in frames
      const ap = Math.abs(p);
      const op = ap < 1 ? 1 : Math.max(0, 1 - (ap - 1) * 1.1);
      s.style.transform  = `translateY(${p * pitch}px) scale(${1 - Math.min(ap, 1) * SHRINK})`;
      s.style.opacity    = op;
      s.style.filter     = `brightness(${1 - Math.min(ap, 1) * DIM})` + (blur > 0.2 ? ` blur(${blur.toFixed(1)}px)` : '');
      s.style.zIndex     = String(100 - Math.round(ap * 10));
      s.style.visibility = op < 0.01 ? 'hidden' : 'visible';
    });
  }

  function setActive(i) {
    cur = i;
    slides.forEach((s, k) => s.classList.toggle('is-active', k === i));
  }

  const quint = t => 1 - Math.pow(1 - t, 5);             // explosive start, long settle = "rapid" feel

  function animate(to, ms, done, ease = quint) {
    cancelAnimationFrame(raf);
    const from = pos, t0 = performance.now();
    let last = t0, prev = pos;
    (function tick(now) {
      const t = Math.min(1, (now - t0) / ms);
      pos = from + (to - from) * ease(t);
      const dt = Math.max(1, now - last) / 1000;
      const v = t < 1 ? (pos - prev) / dt : 0;
      last = now; prev = pos;
      render(v);
      if (t < 1) raf = requestAnimationFrame(tick);
      else if (done) done();
    })(t0);
  }

  function go(i) {
    i = mod(i, N);
    const diff = mod(i - pos + N / 2, N) - N / 2;        // shortest way round
    setActive(i);
    animate(pos + diff, reduce ? 1 : Math.min(1500, SNAP + 170 * Math.abs(diff)));
  }
  const step = d => go(cur + d);

  /* ---------- per-frame hooks ---------- */
  slides.forEach((s, i) => {
    const c = s.querySelector('.reel-count');
    if (c) c.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0');
    const sc = s.querySelector('.reel-scroll');
    if (sc) sc.addEventListener('click', () => step(1));
    s.addEventListener('click', e => {
      if (moved > 6) return;
      if (i !== cur) { e.preventDefault(); go(i); }      // click a peeking frame to jump to it
    });
  });

  /* ---------- input ---------- */
  let down = false, sy = 0, sp = 0, lastY = 0, lastT = 0;
  stage.addEventListener('pointerdown', e => {
    down = true; moved = 0; sy = lastY = e.clientY; sp = pos; lastT = performance.now();
    cancelAnimationFrame(raf); stage.classList.add('is-dragging');
  });
  addEventListener('pointermove', e => {
    if (!down) return;
    const now = performance.now(), dy = e.clientY - sy;
    moved = Math.abs(dy);
    const v = -((e.clientY - lastY) / pitch) / Math.max(0.001, (now - lastT) / 1000);
    lastY = e.clientY; lastT = now;
    pos = sp - dy / pitch; render(v);
  });
  addEventListener('pointerup', () => {
    if (!down) return;
    down = false; stage.classList.remove('is-dragging');
    go(moved > 6 ? Math.round(pos) : cur);
  });
  addEventListener('wheel', e => {
    if (document.body.classList.contains('homepage-entering')) return;
    const now = performance.now();
    if (Math.abs(e.deltaY) < 20 || now - lastWheel < 420) return;   // one rapid step per flick
    lastWheel = now; step(e.deltaY > 0 ? 1 : -1);
  }, { passive: true });
  addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') step(1);
    if (e.key === 'ArrowUp') step(-1);
  });
  addEventListener('resize', layout);

  document.querySelectorAll('[data-reel-go]').forEach(el =>
    el.addEventListener('click', () => go(+el.dataset.reelGo)));

  /* ---------- entrance: reel races through all frames, then eases onto the first ---------- */
  layout();
  slides.forEach(s => s.classList.remove('is-active'));
  const body = document.body;
  body.classList.add('homepage-entering');

  if (reduce) {
    body.classList.remove('homepage-entering'); setActive(0);
  } else {
    setTimeout(() => body.classList.remove('homepage-entering'), 2300);  // wordmark + menu drop in
    setTimeout(() => setActive(0), 3600);                                 // details reveal
    animate(3 * N, 4200, null, t => 1 - Math.pow(1 - t, 3.4));
  }

  window.reel = { go, step };
})();
