// =====================================
// REEL — 3D VERTICAL RING
// =====================================

(() => {
    const stage = document.querySelector('.reel-stage');
    const track = document.querySelector('.reel-track');
    if (!stage || !track) return;

    const slides = [...track.querySelectorAll('.reel-slide')];
    const N = slides.length;
    if (!N) return;

    const STEP = 360 / N;
    const body = document.body;
    const pipsBox = document.querySelector('.reel-pips');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let angle = 0;     // current ring rotation (deg)
    let cur = 0;       // index of the front card
    let R = 0;         // ring radius (px)
    let raf = 0;
    let moved = 0;     // drag distance, to tell a click from a drag
    let lastWheel = 0;

    const mod = (n, m) => ((n % m) + m) % m;
    const pad = n => String(n).padStart(2, '0');

    // counters ("01 / 06") and pips
    slides.forEach((s, i) => {
        const c = s.querySelector('.reel-count');
        if (c) c.textContent = `${pad(i + 1)} / ${pad(N)}`;

        s.addEventListener('click', () => {
            if (moved > 6) return;
            if (i !== cur) go(i);
        });
    });

    const pips = slides.map((_, i) => {
        const p = document.createElement('i');
        p.addEventListener('click', () => go(i));
        if (pipsBox) pipsBox.appendChild(p);
        return p;
    });

    // ---- layout: measure the spacing between frames ----
    const PITCH  = 1.045;   // distance between frames, as a fraction of frame height
    const SHRINK = 0.05;    // how much smaller the peeking frames are
    const DIM    = 0.35;     // how dark the peeking frames are (0 = not dark)
    let pitch = 0;

    function layout() {
        pitch = track.offsetHeight * PITCH;
        render();
    }

    // ---- render: slide every frame up/down the strip (translateY only) ----
    function render() {
        const pos = -angle / STEP;                          // which frame is in the centre (fractional)
        slides.forEach((s, i) => {
            const p  = mod(i - pos + N / 2, N) - N / 2;     // distance from centre, in frames
            const ap = Math.abs(p);
            const op = ap < 1 ? 1 : Math.max(0, 1 - (ap - 1) * 1.1);
            s.style.transform  = `translateY(${p * pitch}px) scale(${1 - Math.min(ap, 1) * SHRINK})`;
            s.style.opacity    = op;
            s.style.filter     = `brightness(${1 - Math.min(ap, 1) * DIM})`;
            s.style.zIndex     = String(100 - Math.round(ap * 10));
            s.style.visibility = op < 0.01 ? 'hidden' : 'visible';
        });
    }

    // ---- active card: reveal its UI and play only its video ----
    function setCur(i) {
        cur = i;
        slides.forEach((s, k) => {
            const on = k === i;
            s.classList.toggle('is-active', on);
            const v = s.querySelector('video');
            if (v) { on ? v.play().catch(() => {}) : v.pause(); }
        });
        pips.forEach((p, k) => p.classList.toggle('on', k === i));
    }

    // ---- animation ----
const ease = t => 1 + 2.2 * Math.pow(t - 1, 3) + 1.2 * Math.pow(t - 1, 2);

    function animate(to, ms, cb, fn = ease) {
        cancelAnimationFrame(raf);
        const from = angle, t0 = performance.now();
        (function tick(now) {
            const t = Math.min(1, (now - t0) / ms);
            angle = from + (to - from) * fn(t);
            render();
            if (t < 1) raf = requestAnimationFrame(tick);
            else if (cb) cb();
        })(t0);
    }

    function go(i) {
        const base = -i * STEP;
        const diff = mod(base - angle + 180, 360) - 180;   // shortest way round
        setCur(i);
    animate(angle + diff, 750);    }

    const step = d => go(mod(cur + d, N));

    // ---- cinematic entrance: fast spin that eases onto a random card ----
    function enter() {
        if (reduceMotion || !body.classList.contains('homepage-entering')) {
            setCur(0);
            body.classList.remove('homepage-entering');
            return;
        }

        slides.forEach(s => {
            s.classList.remove('is-active');
            const v = s.querySelector('video');
            if (v) v.pause();
        });

        const idx = 1 + Math.floor(Math.random() * (N - 1));   // never the first card
        const turns = 4;
        const target = -(turns * 360 + idx * STEP);

        setTimeout(() => body.classList.remove('homepage-entering'), 1900); // reveal header
        setTimeout(() => setCur(idx), 3000);                                // reveal card UI
        animate(target, 4200, () => setCur(idx), t => 1 - Math.pow(1 - t, 3.4));
    }

    // ---- controls ----
    const prev = document.querySelector('.reel-prev');
    const next = document.querySelector('.reel-next');
    if (prev) prev.addEventListener('click', () => step(-1));
    if (next) next.addEventListener('click', () => step(1));

    slides.forEach(s => {
        const btn = s.querySelector('.reel-scroll');
        if (btn) btn.addEventListener('click', e => { e.stopPropagation(); step(1); });
    });

    const ready = () => !body.classList.contains('homepage-entering');

    document.addEventListener('keydown', e => {
        if (!ready()) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') step(-1);
    });

    // wheel: one card per gesture (throttled so trackpads don't spin it wildly)
    window.addEventListener('wheel', e => {
        if (!ready() || Math.abs(e.deltaY) < 30) return;
        const now = performance.now();
        if (now - lastWheel < 700) return;
        lastWheel = now;
        step(e.deltaY > 0 ? 1 : -1);
    }, { passive: true });

    // drag / swipe vertically
    let down = false, sy = 0, sa = 0;

    stage.addEventListener('pointerdown', e => {
        if (!ready() || e.target.closest('a, button')) return;
        down = true;
        moved = 0;
        sy = e.clientY;
        sa = angle;
        cancelAnimationFrame(raf);
        stage.classList.add('is-dragging');
    });

    window.addEventListener('pointermove', e => {
        if (!down) return;
        const dy = e.clientY - sy;
        moved = Math.abs(dy);
        angle = sa + dy * 0.12;
        render();
    });

    window.addEventListener('pointerup', () => {
        if (!down) return;
        down = false;
        stage.classList.remove('is-dragging');
        if (moved > 6) go(mod(Math.round(-angle / STEP), N));
        else go(cur); // tiny movement: settle back
    });

    window.addEventListener('resize', layout);

    // ---- start ----
    layout();
    enter();
})();


// =====================================
// HEADER DROPDOWNS (hover on desktop, click on touch)
// =====================================

(() => {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)');
    const menus    = [...header.querySelectorAll('.navigation > .about-dropdown')];
    const groups   = [...header.querySelectorAll('.works-group')];
    const timers   = new WeakMap();

    const closeAll = () => {
        menus.forEach(m => m.open = false);
        groups.forEach(g => g.open = false);
    };

    // TOP LEVEL: WORKS and ABOUT
    menus.forEach(menu => {
        const summary = menu.querySelector(':scope > summary');

        menu.addEventListener('mouseenter', () => {
            if (!canHover.matches) return;
            clearTimeout(timers.get(menu));
            menus.forEach(o => { if (o !== menu) o.open = false; });
            menu.open = true;
        });

        menu.addEventListener('mouseleave', () => {
            if (!canHover.matches) return;
            timers.set(menu, setTimeout(() => {
                menu.open = false;
                menu.querySelectorAll('.works-group').forEach(g => g.open = false);
            }, 180));
        });

        // mouse click shouldn't close what hover just opened
        // (keyboard Enter/Space has detail 0, so it still toggles)
        summary.addEventListener('click', e => {
            if (canHover.matches && e.detail > 0) e.preventDefault();
        });

        // touch: only one menu open at a time
        menu.addEventListener('toggle', () => {
            if (menu.open && !canHover.matches) {
                menus.forEach(o => { if (o !== menu) o.open = false; });
            }
        });
    });

    // NESTED: VIDEO PRODUCTION and PHOTOGRAPHY
    groups.forEach(group => {
        const summary = group.querySelector(':scope > summary');

        group.addEventListener('mouseenter', () => {
            if (!canHover.matches) return;
            groups.forEach(g => { if (g !== group) g.open = false; });
            group.open = true;
        });

        summary.addEventListener('click', e => {
            if (canHover.matches && e.detail > 0) e.preventDefault();
        });
    });

    // click outside, Escape, or choosing a link closes everything
    document.addEventListener('click', e => {
        if (!e.target.closest('.site-header')) closeAll();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeAll();
    });

    header.querySelectorAll('.about-submenu a').forEach(a => {
        a.addEventListener('click', closeAll);
    });
})();


// =====================================
// SOCIAL POP-UP (landing page monogram)
// =====================================

(() => {
    const btn   = document.querySelector('.floating-monogram[aria-controls="socialPop"]');
    const panel = document.getElementById('socialPop');
    if (!btn || !panel) return;

    const setOpen = open => {
        panel.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
    };

    btn.addEventListener('click', () => setOpen(!panel.classList.contains('is-open')));

    // click anywhere else, or press Escape, to close
    document.addEventListener('click', e => {
        if (!e.target.closest('#socialPop, .floating-monogram')) setOpen(false);
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') setOpen(false);
    });
})();
