/**
 * UI layer for Gene & Stem.
 * Renders chapters, the reader modal, the hover label and the toast, and
 * wires them to the scene's continuous flight.
 */
import { SECTIONS, INSPECT, INSPECT_ORDER } from './src/content.js';
import { createScene } from './src/scene.js';

const $ = (selector) => document.querySelector(selector);
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');

const STAGE_HEIGHT = () => window.innerHeight * 1.3;
const CHAPTER_SPAN = () => Math.max(1, SECTIONS.length - 1);

let stillMode = prefersReduced.matches;

/* ---------------- scroll model ---------------- */

const progressAt = () => Math.min(CHAPTER_SPAN(), Math.max(0, window.scrollY / STAGE_HEIGHT()));

/* ---------------- cinematic chapter navigation ----------------
 * Native smooth scroll has a fixed, near-linear curve and ignores distance.
 * Instead we tween scrollY ourselves; the scene derives camera progress from
 * scrollY, so the camera follows this easing curve automatically.
 */

/** Cubic-bezier solver (same maths as CSS), Newton-Raphson. */
const cubicBezier = (x1, y1, x2, y2) => {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t) => (3 * ax * t + 2 * bx) * t + cx;
  return (x) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-5) break;
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
};

/** Accelerates and decelerates, like a drone move. */
const NAV_IN_OUT = cubicBezier(0.65, 0, 0.35, 1);
/** Fast start, long glide-out (the cubic-bezier(0.25, 1, 0.5, 1) curve). */
const NAV_OUT = cubicBezier(0.25, 1, 0.5, 1);
const NAV_EASE = NAV_IN_OUT; // swap to NAV_OUT for a snappier launch

let navRaf = 0;
const cancelNav = () => {
  cancelAnimationFrame(navRaf);
  navRaf = 0;
};
// Any manual input hands control straight back to the user.
['wheel', 'touchstart', 'keydown'].forEach((type) => window.addEventListener(type, cancelNav, { passive: true }));

const goToChapter = (index) => {
  const target = Math.round(index * STAGE_HEIGHT());
  cancelNav();
  if (stillMode) {
    window.scrollTo({ top: target, behavior: 'instant' });
    return;
  }
  const from = window.scrollY;
  const distance = target - from;
  if (Math.abs(distance) < 2) return;
  // Longer dives take longer: ~1.1s for one chapter, capped at 3.2s.
  const duration = Math.min(3200, 1100 + (Math.abs(distance) / STAGE_HEIGHT()) * 420);
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / duration);
    window.scrollTo({ top: from + distance * NAV_EASE(p), behavior: 'instant' });
    navRaf = p < 1 ? requestAnimationFrame(step) : 0;
  };
  navRaf = requestAnimationFrame(step);
};

/* ---------------- stage scaffolding ---------------- */

const stages = $('#stages');
stages.innerHTML = SECTIONS.map(() => '<section class="stage"></section>').join('');
const stageEls = [...stages.children];

/** Keeps the scroll track in lockstep with STAGE_HEIGHT (mobile `vh` != `innerHeight`). */
const sizeStages = () => {
  const h = `${STAGE_HEIGHT()}px`;
  stageEls.forEach((el) => {
    el.style.height = h;
  });
};

/* ---------------- navigation ---------------- */

const nav = $('#nav');
const rail = $('#rail');

const navButtons = SECTIONS.map((section, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = section.nav;
  button.addEventListener('click', () => goToChapter(index));
  nav.appendChild(button);

  const dot = document.createElement('button');
  dot.type = 'button';
  dot.title = section.nav;
  dot.setAttribute('aria-label', section.nav);
  dot.addEventListener('click', () => goToChapter(index));
  rail.appendChild(dot);

  return { button, dot };
});

/* Sliding pill behind the active link. */
const pill = document.createElement('span');
pill.className = 'nav-pill';
pill.setAttribute('aria-hidden', 'true');
nav.prepend(pill);

const movePill = (index) => {
  const target = navButtons[index] && navButtons[index].button;
  if (!target) return;
  pill.style.setProperty('--x', `${target.offsetLeft}px`);
  pill.style.setProperty('--w', `${target.offsetWidth}px`);
  pill.classList.add('is-ready');
};

$('#brand').addEventListener('click', (event) => {
  event.preventDefault();
  goToChapter(0);
});

/* ---------------- toast ---------------- */

const toast = $('#toast');
let toastTimer;
const say = (message) => {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
};

/* ---------------- hover label ---------------- */

const hoverLabel = $('#hover-label');
const hoverTag = $('#hover-tag');
const hoverName = $('#hover-name');

const setHover = (key, x, y) => {
  const record = key ? INSPECT[key] : null;
  if (!record) {
    hoverLabel.classList.remove('is-visible');
    return;
  }
  hoverTag.textContent = record.tag.split('·')[0].trim();
  hoverName.textContent = record.short || record.title;
  hoverLabel.style.left = `${x}px`;
  hoverLabel.style.top = `${y}px`;
  hoverLabel.classList.add('is-visible');
};

/* ---------------- block renderer ---------------- */

const escapeHtml = (text) =>
  String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const statGrid = (stats) =>
  `<div class="stat-grid">${stats
    .map(
      (stat) =>
        `<div class="stat"><span class="stat-value">${escapeHtml(stat.value)}</span><span class="stat-label">${escapeHtml(
          stat.label
        )}</span>${stat.note ? `<span class="stat-note">${escapeHtml(stat.note)}</span>` : ''}</div>`
    )
    .join('')}</div>`;

const cardGrid = (cards) =>
  `<div class="card-grid">${cards
    .map((card) => `<div class="info-card"><h4>${escapeHtml(card.heading)}</h4><p>${escapeHtml(card.text)}</p></div>`)
    .join('')}</div>`;

const CALLOUT_CLASS = { risk: 'callout is-risk', note: 'callout is-note', ethics: 'callout' };

/**
 * Renders the compact block grammar documented at the top of `content.js`:
 * every array entry is one block, and an entry with no marker is its own paragraph.
 * Consecutive `=` entries are grouped into a single row of metric tiles.
 */
function renderBlocks(blocks) {
  let html = '';
  let list = null;
  let stats = [];

  const closeList = () => {
    if (list) {
      html += `</${list}>`;
      list = null;
    }
  };
  const flushStats = () => {
    if (stats.length) {
      html += statGrid(stats);
      stats = [];
    }
  };
  const closeAll = () => {
    closeList();
    flushStats();
  };

  blocks.forEach((raw) => {
    const block = String(raw).trim();
    if (!block) return;

    const marker = block[0];
    const body = block.slice(1).trim();

    if (marker === '=') {
      closeList();
      const [value, label = '', ...note] = body.split('|').map((part) => part.trim());
      stats.push({ value, label, note: note.join(' | ') });
      return;
    }

    const isListItem = marker === '-' || marker === '~';
    flushStats();
    if (!isListItem) closeList();

    if (marker === '#') {
      html += `<h3>${escapeHtml(body)}</h3>`;
    } else if (marker === '!') {
      const divider = body.indexOf('|');
      const kind = divider === -1 ? '' : body.slice(0, divider).trim().toLowerCase();
      const text = divider === -1 ? body : body.slice(divider + 1).trim();
      html += `<div class="${CALLOUT_CLASS[kind] || 'callout'}">${escapeHtml(text)}</div>`;
    } else if (marker === '>') {
      html += body.startsWith('—')
        ? `<p class="pullquote-attrib">${escapeHtml(body)}</p>`
        : `<blockquote class="pullquote">${escapeHtml(body)}</blockquote>`;
    } else if (isListItem) {
      const tag = marker === '-' ? 'ul' : 'ol';
      if (list !== tag) {
        closeList();
        html += `<${tag}>`;
        list = tag;
      }
      html += `<li>${escapeHtml(body)}</li>`;
    } else {
      html += `<p>${escapeHtml(block)}</p>`;
    }
  });

  closeAll();
  return html;
}

/* ---------------- reader ---------------- */

const root = document.documentElement;
const reader = $('#reader');
const readerTag = $('#reader-tag');
const readerTitle = $('#reader-title');
const readerBody = $('#reader-body');
const readerNext = $('#reader-next');
const readerClose = $('#reader-close');
let lastTrigger = null;

readerBody.tabIndex = 0; // lets keyboard users scroll long articles

const isReaderOpen = () => reader.classList.contains('is-open');

const openReader = (html, { tag, title }, trigger) => {
  // Chips re-render the reader, so only remember the trigger that first opened it.
  if (!isReaderOpen()) lastTrigger = trigger || null;
  readerTag.textContent = tag;
  readerTitle.textContent = title;
  readerBody.innerHTML = html;
  readerNext.innerHTML = '';
  reader.classList.add('is-open');
  root.classList.add('reader-open');
  scene.setDim(true); // background structures recede while the text has focus
  readerBody.scrollTop = 0;
  readerClose.focus();
};

const closeReader = () => {
  if (!isReaderOpen()) return;
  reader.classList.remove('is-open');
  root.classList.remove('reader-open');
  scene.select(null);
  scene.setDim(false);
  if (lastTrigger && document.contains(lastTrigger) && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  lastTrigger = null;
};

/** Builds the "explore the structures" chips and jumps the camera to them. */
const wireChips = (keys, label) => {
  readerNext.innerHTML = `<span class="reader-next-label">${label}</span>${keys
    .map((key) => `<button class="btn btn-chip" type="button" data-inspect="${key}">${escapeHtml(INSPECT[key].short)}</button>`)
    .join('')}`;
  readerNext.querySelectorAll('[data-inspect]').forEach((chip) => {
    chip.addEventListener('click', () => {
      scene.select(chip.dataset.inspect);
      openInspect(chip.dataset.inspect, chip);
    });
  });
};

/** The `count` structures that follow `key` in INSPECT_ORDER, wrapping around. */
const neighbours = (key, count) => {
  const start = INSPECT_ORDER.indexOf(key);
  const result = [];
  for (let step = 1; step < INSPECT_ORDER.length && result.length < count; step++) {
    const other = INSPECT_ORDER[(start + step + INSPECT_ORDER.length) % INSPECT_ORDER.length];
    if (INSPECT[other]) result.push(other);
  }
  return result;
};

/** Chapter reader: the full article plus quick links to related structures. */
const openChapter = (index, trigger) => {
  const section = SECTIONS[index];
  const focusRecords = [section.focus, ...INSPECT_ORDER].filter(
    (key, position, all) => key && INSPECT[key] && all.indexOf(key) === position
  );
  openReader(
    renderBlocks(section.content),
    { tag: section.eyebrow.split('·').pop().trim(), title: section.readerTitle || section.title },
    trigger
  );
  wireChips(focusRecords.slice(0, 4), 'Explore the structures');
};

/** Structure reader: summary, metric tiles, cards and long-form notes. */
const openInspect = (key, trigger) => {
  const record = INSPECT[key];
  if (!record) return;

  let html = `<p>${escapeHtml(record.summary)}</p>`;
  if (record.stats) html += statGrid(record.stats);
  if (record.cards) html += cardGrid(record.cards);
  html += renderBlocks(record.content);

  openReader(html, { tag: record.tag, title: record.title }, trigger);
  wireChips(neighbours(key, 3), 'Related structures');
};

readerClose.addEventListener('click', closeReader);
reader.addEventListener('click', (event) => {
  if (event.target === reader) closeReader();
});
window.addEventListener('keydown', (event) => {
  if (!isReaderOpen()) return;

  if (event.key === 'Escape') {
    closeReader();
    return;
  }

  // Keep Tab inside the dialog while it is open.
  if (event.key === 'Tab') {
    const stops = [...reader.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')].filter(
      (el) => !el.hidden && el.offsetParent !== null
    );
    if (!stops.length) return;
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (!reader.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
    } else if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
});

/* ---------------- chapter panel ---------------- */

const panel = $('#panel');
const pEyebrow = $('#p-eyebrow');
const pTitle = $('#p-title');
const pLede = $('#p-lede');
const pPrimary = $('#p-primary');
const pSecondary = $('#p-secondary');
const progressBar = $('#progress-bar');
const cue = $('#scroll-cue');
const wash = $('.wash');

/* One pair of [r, g, b] colours per chapter, in the same order as SECTIONS. */
const TINTS = [
  [[60, 90, 190], [120, 70, 190]], // Home: deep space
  [[255, 160, 100], [95, 208, 245]], // The Person: dawn
  [[225, 29, 72], [255, 154, 184]], // Inside the Body: tissue
  [[95, 208, 245], [167, 139, 250]], // The Genome
  [[94, 234, 212], [95, 208, 245]], // About the Study
  [[95, 208, 245], [94, 234, 212]], // Gene Therapy
  [[167, 139, 250], [255, 154, 213]], // Stem Cell Research
  [[251, 191, 36], [94, 234, 212]], // Clinical Milestones
  [[244, 63, 94], [167, 139, 250]], // Ethical Issues
  [[94, 234, 212], [251, 191, 36]], // Benefits & Risks
  [[125, 211, 252], [167, 139, 250]], // Access & Governance
  [[167, 139, 250], [95, 208, 245]] // References
];
const WASH_ALPHA = 0.16; // low, so the nebula image keeps its identity and each chapter only shifts its hue

const bgCell = $('.bg-cell');

/** Slow scroll-driven drift on the background image: a gentle push-in and sideways slide. */
const paintBg = (value) => {
  const p = value / CHAPTER_SPAN();
  bgCell.style.transform = `scale(${(1.12 + p * 0.1).toFixed(4)}) translate3d(${(-p * 3).toFixed(2)}%, ${(-p * 2).toFixed(2)}%, 0)`;
};

/** Blends the two neighbouring chapter tints, so the background shifts with the camera. */
const paintWash = (value) => {
  const last = SECTIONS.length - 1;
  const v = Math.min(last, Math.max(0, value));
  const i = Math.min(last - 1, Math.floor(v));
  const raw = v - i;
  const f = raw * raw * (3 - 2 * raw);
  const tint = (n) => TINTS[Math.min(n, TINTS.length - 1)];
  const mix = (a, b) => a.map((c, n) => Math.round(c + (b[n] - c) * f));
  wash.style.setProperty('--wash-a', `rgba(${mix(tint(i)[0], tint(i + 1)[0])}, ${WASH_ALPHA})`);
  wash.style.setProperty('--wash-b', `rgba(${mix(tint(i)[1], tint(i + 1)[1])}, ${WASH_ALPHA})`);
};

let shownIndex = -1;
let panelTimer;

const paintPanel = (index) => {
  const section = SECTIONS[index];
  pEyebrow.textContent = section.eyebrow;
  pTitle.textContent = section.title;
  pLede.textContent = section.lede;
  pPrimary.textContent = section.primary;

  // Panels alternate sides so the subject always stays in frame.
  panel.classList.toggle('L', index % 2 === 0);
  panel.classList.toggle('R', index % 2 === 1);

  if (section.secondary && INSPECT[section.secondary.key]) {
    pSecondary.hidden = false;
    pSecondary.textContent = section.secondary.label;
    pSecondary.dataset.key = section.secondary.key;
  } else {
    pSecondary.hidden = true;
    delete pSecondary.dataset.key;
  }
};

const setPanel = (index) => {
  if (index === shownIndex) return;
  clearTimeout(panelTimer);
  const needsSwap = shownIndex >= 0;

  if (needsSwap) panel.classList.add('is-out');
  panelTimer = setTimeout(
    () => {
      paintPanel(index);
      requestAnimationFrame(() => panel.classList.remove('is-out'));
    },
    needsSwap && !stillMode ? 300 : 0
  );

  shownIndex = index;
  navButtons.forEach(({ button, dot }, position) => {
    const active = position === index;
    button.setAttribute('aria-current', active ? 'true' : 'false');
    dot.setAttribute('aria-current', active ? 'true' : 'false');
    if (active) button.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  });
  movePill(index);
};

pPrimary.addEventListener('click', () => {
  if (shownIndex === 0) goToChapter(1);
  else openChapter(shownIndex, pPrimary);
});

pSecondary.addEventListener('click', () => {
  const key = pSecondary.dataset.key;
  if (!key) return;
  scene.select(key);
  say(`Flying to ${INSPECT[key].short}`);
  openInspect(key, pSecondary);
});

/* ---------------- scene wiring ---------------- */

const scene = createScene($('#scene'), {
  sky: $('.sky'),
  skyImage: $('.sky-plate'),
  dive: $('.dive'),
  reducedMotion: () => stillMode,
  onHover: (key, x, y) => setHover(key, x, y),
  onInspect: (key) => {
    scene.select(key);
    say(`Inspecting: ${INSPECT[key].short}`);
    openInspect(key, null);
  },
  onProgress: (value) => {
    progressBar.style.width = `${(value / CHAPTER_SPAN()) * 100}%`;
    cue.classList.toggle('is-compact', value > 0.6);
    paintWash(value);
    paintBg(value);
    const rounded = Math.min(SECTIONS.length - 1, Math.round(value));
    if (rounded !== shownIndex) setPanel(rounded);
  }
});

/* ---------------- scroll + motion toggle ---------------- */

let ticking = false;
const syncScroll = () => {
  scene.setProgress(progressAt());
  hoverLabel.classList.remove('is-visible');
};

window.addEventListener(
  'scroll',
  () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      syncScroll();
    });
  },
  { passive: true }
);

const motionButton = $('#motion');
const paintMotionButton = () => {
  motionButton.setAttribute('aria-pressed', stillMode ? 'false' : 'true');
  motionButton.querySelector('.motion-text').textContent = stillMode ? 'Still mode' : 'Ambient motion';
};

motionButton.addEventListener('click', () => {
  stillMode = !stillMode;
  paintMotionButton();
});

prefersReduced.addEventListener('change', (event) => {
  stillMode = event.matches;
  paintMotionButton();
});

/* ---------------- boot ---------------- */

sizeStages();
paintMotionButton();
paintPanel(0);
shownIndex = 0;
movePill(0);
// Web fonts change button widths after first paint, so re-measure the pill once they load.
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => movePill(shownIndex));
syncScroll();
window.addEventListener('resize', () => {
  sizeStages();
  movePill(shownIndex);
  syncScroll();
});

if (!scene.state.available) say('3D view needs WebGL. The chapters and readers still work.');