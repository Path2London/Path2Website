// To add or remove an alumnus, edit this list. Everything else updates itself.
const ALUMNI = [
  'Constantine Wang',
  'Jennifer Qiu',
  'Aronima Biswas',
  'Shaylan Roy',
  'Vinay Attra',
  'Tisha Singhal',
  'Annabel Tanner',
  'Joseph Oldfield',
  'Hanif Firdaus',
  'Olufemi Ogunseinde',
  'Jail Anaur Chipantiza Guashpa',
  'Muhammad Hafiz Bin Morshidi',
  'Zachariah Kissel'
];

const PARTNERS = [
  { full: 'Essex Consulting Society', label: 'ECS', ring: 'inner' },
  { full: 'Oxford Brookes Consulting Society', label: 'OBCS', ring: 'inner' },
  { full: 'Swansea Consulting Society', label: 'SCS', ring: 'inner' },
  { full: 'Durham Consulting Society', label: 'DCS', ring: 'outer' },
  { full: 'CCN', label: 'CCN', ring: 'outer' },
  { full: 'Fineda', label: 'FINEDA', ring: 'outer' }
];

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


/* HERO PARTICLES */
(function () {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const NODE_COUNT = 55;
  const MAX_DIST = 155;
  const MOUSE_DIST = 210;
  const mouse = { x: -9999, y: -9999 };
  let width = 0;
  let height = 0;
  let nodes = [];

  const rand = (min, max) => min + Math.random() * (max - min);

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function init() {
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: rand(-0.28, 0.28),
        vy: rand(-0.18, 0.18),
        r: rand(1.5, 3.5),
        opacity: rand(0.2, 0.65)
      });
    }
  }

  function line(x1, y1, x2, y2, colour, lineWidth) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = colour;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.17;
          line(a.x, a.y, b.x, b.y, `rgba(255,255,255,${alpha})`, 0.8);
        }
      }

      const mouseDist = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (mouseDist < MOUSE_DIST) {
        const alpha = (1 - mouseDist / MOUSE_DIST) * 0.5;
        line(a.x, a.y, mouse.x, mouse.y, `rgba(201,168,76,${alpha})`, 0.9);
      }
    }

    for (const n of nodes) {
      const mouseDist = Math.hypot(n.x - mouse.x, n.y - mouse.y);
      const glow = mouseDist < MOUSE_DIST ? 1 - mouseDist / MOUSE_DIST : 0;

      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + glow * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = glow > 0.1
        ? `rgba(201,168,76,${n.opacity + glow * 0.45})`
        : `rgba(255,255,255,${n.opacity})`;
      ctx.fill();
    }
  }

  function update() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -20) n.x = width + 20;
      if (n.x > width + 20) n.x = -20;
      if (n.y < -20) n.y = height + 20;
      if (n.y > height + 20) n.y = -20;
    }
  }

  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', () => {
    resize();
    init();
    if (reducedMotion) draw();
  });

  document.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  resize();
  init();
  if (reducedMotion) {
    draw();
  } else {
    loop();
  }
})();


/* PARTNER ORBITAL */
(function () {
  const wrap = document.getElementById('orbitalWrap');
  const BASE_SIZE = 480;
  const SPEED = { inner: 0.6, outer: -0.35 };
  const nodes = [];

  function addRing(ring) {
    const members = PARTNERS.filter(p => p.ring === ring);
    // offset the outer ring so its nodes sit between the inner ones
    const offset = ring === 'outer' ? Math.PI / members.length : 0;

    members.forEach((partner, i) => {
      const el = document.createElement('div');
      el.className = 'orbit-node';
      el.dataset.full = partner.full;
      el.setAttribute('aria-label', partner.full);

      const label = document.createElement('span');
      label.className = 'orbit-node-label';
      label.textContent = partner.label;
      el.appendChild(label);

      const connector = document.createElement('div');
      connector.className = 'orbit-connector';

      wrap.appendChild(el);
      wrap.appendChild(connector);
      nodes.push({
        el,
        connector,
        ring,
        baseAngle: (i / members.length) * Math.PI * 2 + offset
      });
    });
  }

  addRing('inner');
  addRing('outer');

  function render(timestamp) {
    const size = wrap.offsetWidth;
    const scale = size / BASE_SIZE;
    const centre = size / 2;
    const radius = { inner: Math.round(120 * scale), outer: Math.round(200 * scale) };
    const nodeSize = Math.max(52, Math.round(80 * scale));
    const half = nodeSize / 2;
    const t = timestamp * 0.001;

    for (const n of nodes) {
      const r = radius[n.ring];
      const angle = n.baseAngle + t * SPEED[n.ring];
      const x = centre + r * Math.cos(angle);
      const y = centre + r * Math.sin(angle);

      n.el.style.width = nodeSize + 'px';
      n.el.style.height = nodeSize + 'px';
      n.el.style.left = (x - half) + 'px';
      n.el.style.top = (y - half) + 'px';

      n.connector.style.left = centre + 'px';
      n.connector.style.top = centre + 'px';
      n.connector.style.width = (r - half) + 'px';
      n.connector.style.transform = `rotate(${angle}rad)`;
    }

    if (!reducedMotion) requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
  if (reducedMotion) {
    window.addEventListener('resize', () => requestAnimationFrame(render));
  }
})();


/* CURSOR RING (mouse users only) */
(function () {
  const ring = document.getElementById('cursorRing');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!finePointer || reducedMotion) return;

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function follow() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(follow);
  }
  follow();

  // delegated so it also covers elements added later (alumni cards, orbit nodes)
  const interactive = 'a, button, .orbit-node';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(interactive)) ring.classList.add('cursor-ring--active');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(interactive)) ring.classList.remove('cursor-ring--active');
  });
})();


/* MOBILE MENU */
(function () {
  const button = document.getElementById('navHamburger');
  const menu = document.getElementById('navMobileMenu');

  function setOpen(open) {
    menu.classList.toggle('open', open);
    button.classList.toggle('open', open);
    button.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  button.addEventListener('click', () => setOpen(!menu.classList.contains('open')));

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      setOpen(false);
      button.focus();
    }
  });

  // close the menu if the window is widened past the mobile breakpoint
  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setOpen(false);
  });
})();


/* NAV BACKGROUND ON SCROLL */
(function () {
  const nav = document.getElementById('nav');
  const update = () => nav.classList.toggle('scrolled', window.scrollY > 60);
  window.addEventListener('scroll', update, { passive: true });
  update();
})();


/* SCROLL REVEAL */
(function () {
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();


/* ALUMNI SLIDER */
(function () {
  const track = document.getElementById('alumniTrack');
  const viewport = document.getElementById('alumniViewport');
  const counter = document.getElementById('alumniCounter');
  const progress = document.getElementById('alumniProgress');
  const prevBtn = document.getElementById('alumniPrev');
  const nextBtn = document.getElementById('alumniNext');
  const GAP = 2;
  const total = ALUMNI.length;
  let index = 0;

  function cardsVisible() {
    const w = window.innerWidth;
    if (w <= 480) return 1;
    if (w <= 768) return 2;
    if (w <= 1024) return 3;
    return 4;
  }

  // last index where the final card is still flush with the right edge
  function maxIndex() {
    return Math.max(0, total - cardsVisible());
  }

  function buildCard(fullName, i) {
    const [first, ...rest] = fullName.trim().split(/\s+/);

    const card = document.createElement('div');
    card.className = 'alumni-slide-card';
    card.setAttribute('role', 'listitem');

    const name = document.createElement('div');
    name.className = 'alumni-slide-name';
    name.append(first, document.createElement('br'));
    const surname = document.createElement('em');
    surname.textContent = rest.join(' ');
    name.appendChild(surname);

    const meta = document.createElement('div');
    meta.className = 'alumni-slide-meta';
    meta.innerHTML =
      '<span class="alumni-slide-cohort-tag">Class of 2026</span>' +
      '<span class="alumni-slide-year">Path2 Academy</span>';

    const number = document.createElement('div');
    number.className = 'alumni-slide-index';
    number.setAttribute('aria-hidden', 'true');
    number.textContent = String(i + 1).padStart(2, '0');

    card.append(name, meta, number);
    return card;
  }

  function buildProgress() {
    progress.replaceChildren();
    for (let i = 0; i <= maxIndex(); i++) {
      const seg = document.createElement('div');
      seg.className = 'alumni-prog-seg';
      progress.appendChild(seg);
    }
  }

  function update() {
    index = Math.min(index, maxIndex());

    const visible = cardsVisible();
    const cardWidth = Math.floor((viewport.offsetWidth - (visible - 1) * GAP) / visible);
    track.querySelectorAll('.alumni-slide-card').forEach(card => {
      card.style.width = cardWidth + 'px';
    });
    track.style.transform = `translateX(-${index * (cardWidth + GAP)}px)`;

    const first = index + 1;
    const last = Math.min(index + visible, total);
    counter.textContent = first === last ? `${first} / ${total}` : `${first}–${last} / ${total}`;

    progress.querySelectorAll('.alumni-prog-seg').forEach((seg, i) => {
      seg.classList.toggle('active', i === index);
    });

    prevBtn.disabled = index === 0;
    nextBtn.disabled = index >= maxIndex();
  }

  function go(step) {
    const next = index + step;
    if (next < 0 || next > maxIndex()) return;
    index = next;
    update();
  }

  ALUMNI.forEach((name, i) => track.appendChild(buildCard(name, i)));
  buildProgress();

  prevBtn.addEventListener('click', () => go(-1));
  nextBtn.addEventListener('click', () => go(1));

  let touchStartX = 0;
  viewport.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  viewport.addEventListener('touchend', e => {
    const dx = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) go(dx > 0 ? 1 : -1);
  }, { passive: true });

  let lastVisible = cardsVisible();
  window.addEventListener('resize', () => {
    if (cardsVisible() !== lastVisible) {
      lastVisible = cardsVisible();
      buildProgress();
    }
    update();
  });

  update();
})();