/**
 * Scene layer for Gene & Stem.
 * Owns the renderer, camera, lighting, bloom, the single continuous flight
 * path, per-chapter focus blending, and all pointer picking.
 *
 * The scene never cuts. Scroll progress is damped here, then shared back to
 * the UI, so the camera and the panels are always driven by the same value.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createWorld, HUMAN_ORIGIN, EARTH_CENTER, EARTH_RADIUS } from './structures.js';
import { SECTIONS } from './content.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const clamp01 = (t) => clamp(t, 0, 1);
const smoothstep = (t) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};
const smootherstep = (t) => {
  const x = clamp01(t);
  return x * x * x * (x * (x * 6 - 15) + 10);
};
const lerp = (a, b, t) => a + (b - a) * t;

/* ---------- feel: the knobs that make the camera heavy and cinematic ----------
 * Rates are "per second" in exp(-dt * rate) form, so they behave the same at any frame rate.
 * Lower = heavier and slower to settle.
 */
const FEEL = {
  scrollDamping: 2.8, // camera chasing the scroll position (was 4.2)
  dragGain: 0.38, // how hard a drag shoves the world (was 0.5)
  dragVelocityDecay: 9, // while dragging
  yawGlide: 1.7, // glide after release (was 2.4)
  tiltReturn: 1.0, // tilt settling back (was 1.4)
  yawReturn: 0.18, // slow return to rest (was 0.25)
  dimRate: 3, // how quickly background structures recede while reading
  dimShrink: 0.28, // how far unselected structures shrink while reading
  dimDust: 0.7 // how much of the dust fades while reading
};

/* ---------- eye comfort: bloom and exposure ----------
 * Bloom spreads every bright pixel into a halo. A higher threshold lets only the genuinely
 * bright bits glow, and lower strength keeps the halo subtle. Raise these for more glow.
 */
const GLOW = { strength: 0.3, radius: 0.6, threshold: 0.8 }; // was 0.5 / 0.72 / 0.62
const EXPOSURE = 1.02; // was 1.14

/* ---------- per-chapter tables ----------
 * Every table below is indexed by chapter and MUST have one entry per chapter
 * in content.js. `fit()` trims or pads them so a chapter count that drifts
 * from the tables can no longer shift the whole flight path off its anchors.
 */

const CHAPTERS = SECTIONS.length;
const SPAN = Math.max(1, CHAPTERS - 1);

/** Chapters 0..INTRO-1 are the descent (sky, person, body); the rest fly the genome spline. */
const INTRO = 3;
const FLIGHT = CHAPTERS - INTRO;
const FLIGHT_SPAN = Math.max(1, FLIGHT - 1);

/** Descent keyframes at chapters 0..3, relative to the person's feet: [x, y, z]. */
/** First landing: the whole planet from orbit, tilted 55 degrees off the vertical so the person's spot is on show. */
const ORBIT_DISTANCE = 140;
const EARTH_REL_Y = EARTH_CENTER.y - HUMAN_ORIGIN.y;
const DESCENT_CAM = [
  [0, EARTH_REL_Y + ORBIT_DISTANCE * 0.57, ORBIT_DISTANCE * 0.82], // in orbit, looking at the Earth
  [2.6, 3, 7.4], // third person, just behind the figure
  [-0.14, 2.62, 0.24], // through the skin, among the cells
  [-0.1, 2.6, -0.22] // deep in the chest; the genome flight takes over from here
];
const DESCENT_LOOK = [
  [0, EARTH_REL_Y, 0], // the centre of the Earth
  [0, 2.05, 0],
  [0.1, 2.5, -0.7],
  [0.1, 2.5, -1.6]
];

const fit = (list, fallback = 0) =>
  Array.from({ length: FLIGHT }, (_, i) => list[Math.min(i, list.length - 1)] ?? fallback);

/** Camera distance multiplier per chapter. */
const DISTANCE = fit([1.0, 0.88, 0.74, 0.7, 0.74, 0.9, 0.72, 0.76, 0.8, 0.86], 1);

/** One continuous spline through the world: the helix, then each structure. */
const ANCHORS = [
  [0, -2.4, 14.8],
  [-11, 5.4, 8.6],
  [2, 13.8, 9.2],
  [-9, 12.2, -6.6],
  [-1, 13.7, -9.4],
  [4, 17.6, 3.6],
  [-12, 2.6, -3.0],
  [-5, -11.6, 9.6],
  [9.4, -6.4, 8.8],
  [-3, 3.4, 13.4]
];

const BANK = fit([0, -10, 8, -12, 11, -8, 12, -6, 9, 0]);
const LEAN = fit([0, 0.1, -0.12, 0.14, -0.16, 0.2, -0.1, 0.12, -0.14, 0]);

/** Exactly one anchor per chapter, so chapter i always sits on anchor i. */
const chapterAnchors = () => {
  const list = ANCHORS.slice(0, FLIGHT).map((p) => new THREE.Vector3(p[0], p[1], p[2]));
  if (list.length < FLIGHT) {
    console.warn(`scene.js: ${FLIGHT} flight chapters but only ${ANCHORS.length} camera anchors. Add more to ANCHORS.`);
    while (list.length < FLIGHT) {
      const last = list[list.length - 1];
      list.push(new THREE.Vector3(last.x + 3, last.y - 2, last.z - 3));
    }
  }
  return list;
};

/** How strongly a chapter holds its structure, 1 at the chapter and 0 half a chapter away. */
const holdWeight = (distance) => 1 - smoothstep(distance / 0.55);

export function createScene(canvas, { sky, skyImage, dive, onHover, onInspect, onProgress, reducedMotion }) {
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (error) {
    renderer = null;
  }

  const state = {
    progress: 0,
    target: 0,
    damped: 0,
    selected: null,
    lastSelected: null,
    selectionWeight: 0,
    dim: 0, // 1 while a reader is open: background structures recede
    dimWeight: 0, // damped version of `dim`
    hovered: null,
    available: Boolean(renderer)
  };

  if (!renderer) {
    // No WebGL: there is no frame loop, so push progress to the UI directly.
    return {
      state,
      setProgress(value) {
        state.target = state.damped = state.progress = clamp(value, 0, SPAN);
        onProgress(state.progress);
      },
      select: () => {},
      setDim: () => {},
      resize: () => {},
      dispose: () => {}
    };
  }

  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = EXPOSURE;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 1500);

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  scene.add(new THREE.AmbientLight(0x6678aa, 0.5));
  const cyanLight = new THREE.PointLight(0x5fd0f5, 60, 34);
  const violetLight = new THREE.PointLight(0xa78bfa, 60, 34);
  const sun = new THREE.DirectionalLight(0xffc89a, 1.25);
  sun.position.set(6, 2, -6);
  scene.add(cyanLight, violetLight, sun);

  const world = createWorld();
  scene.add(world.root, world.clouds, world.dust, world.human.group, world.earth.group);

  /* ---------- flight path ---------- */

  const anchors = chapterAnchors();
  const path = new THREE.CatmullRomCurve3(anchors, false, 'centripetal', 0.5);
  // A closed C1 loop gives every progress value a valid tangent, both ends included.
  const loop = new THREE.CatmullRomCurve3(anchors, true, 'centripetal', 0.5);

  const look = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const blended = new THREE.Vector3();
  const scratchA = new THREE.Vector3();
  const scratchB = new THREE.Vector3();

  const rel = (list) => list.map(([x, y, z]) => new THREE.Vector3(x, y, z).add(HUMAN_ORIGIN));
  const descentPath = new THREE.CatmullRomCurve3(rel(DESCENT_CAM), false, 'centripetal', 0.5);
  const descentAim = new THREE.CatmullRomCurve3(rel(DESCENT_LOOK), false, 'centripetal', 0.5);
  const flightPos = new THREE.Vector3();
  const descentPos = new THREE.Vector3();
  const descentTarget = new THREE.Vector3();

  /** World-space position of a structure (the root is rotated, so local positions would be wrong). */
  const focusPoint = (item, out) => (item ? item.group.getWorldPosition(out) : out.set(0, 0, 0));

  /* ---------- pointer state ---------- */

  const pointer = new THREE.Vector2();
  const pointerNorm = { x: 0, y: 0 };
  const parallax = new THREE.Vector2();
  let dragging = false;
  let dragX = 0;
  let dragY = 0;
  let downX = 0;
  let downY = 0;
  let yawVelocity = 0;
  let userYaw = 0;
  let userTilt = 0;

  const raycaster = new THREE.Raycaster();

  const kindOf = (object) => {
    let node = object;
    while (node) {
      if (node.userData && node.userData.kind) return node.userData.kind;
      node = node.parent;
    }
    return null;
  };

  /** Nearest structure under the pointer. The big helix volume only wins when nothing else is hit. */
  const pick = (clientX, clientY, width, height) => {
    if (!world.root.visible) return null; // genome world is hidden during the descent
    pointer.set((clientX / width) * 2 - 1, -(clientY / height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(world.root.children, true);
    let helix = null;
    for (const hit of hits) {
      const kind = kindOf(hit.object);
      if (!kind) continue;
      if (kind === 'dna') {
        helix = helix || kind;
        continue;
      }
      return kind;
    }
    return helix;
  };

  const setPointer = (event) => {
    pointerNorm.x = (event.clientX / width) * 2 - 1;
    pointerNorm.y = (event.clientY / height) * 2 - 1;
  };

  /* ---------- sizing ---------- */

  let width = 0;
  let height = 0;
  let mobile = false;
  let composer = null;

  const buildComposer = () => {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), GLOW.strength, GLOW.radius, GLOW.threshold));
    composer.addPass(new OutputPass());
    composer.setSize(width, height);
  };

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    mobile = width <= 900;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(width, height, false);

    camera.aspect = width / height;
    // On phones the chapter sheet covers the lower frame, so lift the subject.
    if (mobile) camera.setViewOffset(width, height, 0, height * 0.24, width, height);
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();

    if (!mobile && !composer) buildComposer();
    if (composer) {
      composer.setPixelRatio(renderer.getPixelRatio());
      composer.setSize(width, height);
    }
  };

  /* ---------- animation loop ---------- */

  const clock = new THREE.Clock();
  let raf = 0;

  const frame = () => {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const motion = reducedMotion() ? 0 : 1;
    const k = dt * 60; // normalises per-frame constants to a 60fps feel

    /* progress: an exponential lerp toward the scroll position */
    const raw = state.target;
    state.damped += (raw - state.damped) * (1 - Math.exp(-dt * FEEL.scrollDamping));
    if (Math.abs(raw - state.damped) < 0.0004) state.damped = raw;
    state.progress = state.damped;
    onProgress(state.progress);

    const total = clamp(state.damped, 0, SPAN); // 0..SPAN across every chapter
    const scaled = clamp(total - INTRO, 0, FLIGHT_SPAN); // 0..FLIGHT_SPAN across the genome flight
    const index = Math.min(FLIGHT - 2, Math.floor(scaled));
    const local = scaled - index;
    const eased = smootherstep(local);

    /* selection: keep the last selection around so it eases out instead of snapping */
    const selectionTarget = state.selected ? 1 : 0;
    state.selectionWeight += (selectionTarget - state.selectionWeight) * (1 - Math.exp(-dt * (state.selected ? 3.2 : 1.8)));
    if (!state.selected && state.selectionWeight < 0.002) {
      state.selectionWeight = 0;
      state.lastSelected = null;
    }
    const focusKey = state.selected || state.lastSelected;
    const selectedItem = focusKey ? world.lookup[focusKey] : null;

    /* reading focus: background structures recede while a reader is open */
    state.dimWeight += (state.dim - state.dimWeight) * (1 - Math.exp(-dt * FEEL.dimRate));
    if (Math.abs(state.dim - state.dimWeight) < 0.001) state.dimWeight = state.dim;

    /* drag rotates the whole world; release lets it settle back */
    if (dragging) {
      yawVelocity = clamp(
        yawVelocity * Math.exp(-dt * FEEL.dragVelocityDecay) + (pointerNorm.x - dragX) * FEEL.dragGain,
        -0.3,
        0.3
      );
      userTilt = clamp(userTilt + (pointerNorm.y - dragY) * 0.6, -0.5, 0.5);
      dragX = pointerNorm.x;
      dragY = pointerNorm.y;
    } else {
      yawVelocity *= Math.exp(-dt * FEEL.yawGlide);
      userTilt *= Math.exp(-dt * FEEL.tiltReturn);
      userYaw *= Math.exp(-dt * FEEL.yawReturn);
    }
    userYaw += yawVelocity * k;
    world.root.rotation.set(userTilt + lerp(LEAN[index], LEAN[index + 1], eased), userYaw, 0);
    world.root.position.y = Math.sin(t * 0.7) * 0.12 * motion;

    /* structures drift on their orbits */
    const reveal = smoothstep((scaled - 1.4) / 3.2);
    world.items.forEach((item) => {
      const angle = item.a + t * item.orbit * motion;
      const focus = selectedItem === item ? state.selectionWeight : 0;
      const radius = item.radius - reveal * 0.5 - 0.35 * focus;
      const y = item.height + Math.sin(t * 0.7 + item.sway) * 0.16 * motion;
      item.group.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      item.group.rotation.y += dt * item.spin * motion;
      item.group.rotation.x += dt * item.spin * 0.35 * motion;
      // Everything except the selected structure shrinks a little while the reader has focus.
      const recede = selectedItem === item ? 0 : FEEL.dimShrink * state.dimWeight;
      const targetScale = (0.82 + 0.22 * reveal + focus * 0.3) * (1 - recede);
      const next = item.group.scale.x + (targetScale - item.group.scale.x) * (1 - Math.exp(-dt * 3.4));
      item.group.scale.setScalar(next);
    });

    const helixPulse = 0.5 + 0.5 * Math.sin(t * 0.8) * motion;
    world.helix.rungs.material.emissiveIntensity = 0.42 + helixPulse * 0.55;
    world.helix.group.rotation.y = t * 0.05 * motion + userYaw * 0.4;
    world.helix.group.scale.setScalar(1 + helixPulse * 0.02);

    /* the descent: the genome world appears as the person fades, drag turns the figure */
    const vis = smoothstep((total - 2.5) / 0.5);
    world.root.visible = world.clouds.visible = world.dust.visible = vis > 0.001;
    world.root.scale.setScalar(Math.max(vis, 0.001));
    const humanFade = 1 - smoothstep((total - 2.6) / 0.5);
    world.human.group.visible = humanFade > 0.001;
    // The person grows out of the planet's surface as the camera drops in from orbit.
    const humanGrow = smoothstep((total - 0.15) / 0.35);
    if (world.human.group.visible) {
      world.human.group.scale.setScalar(Math.max(humanFade * humanGrow, 0.001));
      world.human.group.rotation.y = userYaw;
      world.human.update(t, dt, motion);
    }
    // The planet is the first landing; it dissolves into the atmosphere on the way down.
    world.earth.update(t, dt, motion, 1 - smoothstep((total - 0.4) / 0.6));

    // Resolve world matrices now, so the camera aims at this frame's truth.
    world.root.updateMatrixWorld(true);

    /* camera */
    const pathT = scaled / FLIGHT_SPAN;
    camPos.copy(path.getPoint(pathT));
    look.copy(loop.getPoint(pathT)).multiplyScalar(0.22);

    // Each chapter holds its structure at its own progress value and lets go by the halfway point.
    const prevItem = world.lookup[SECTIONS[INTRO + index].focus];
    const nextItem = world.lookup[SECTIONS[INTRO + index + 1].focus];
    const prevWeight = holdWeight(local);
    const nextWeight = holdWeight(1 - local);
    const totalWeight = prevWeight + nextWeight;

    if (totalWeight > 0.001) {
      focusPoint(prevItem, scratchA);
      focusPoint(nextItem, scratchB);
      blended.copy(scratchA).lerp(scratchB, nextWeight / totalWeight);
      look.lerp(blended, Math.min(0.68, totalWeight * 0.68));
    }

    // Distance is interpolated between chapters; indexing it by chapter alone popped at every boundary.
    const distance = lerp(DISTANCE[index], DISTANCE[index + 1], eased);
    const zoom = (1 - Math.min(0.42, totalWeight * 0.42)) * distance;
    const camK = Math.max(1, (mobile ? 1.5 : 1.1) / camera.aspect);
    flightPos.copy(camPos.sub(look).multiplyScalar(camK * zoom).add(look));

    // Hand over from the descent to the genome flight between the body and the helix.
    const handoff = smootherstep((total - 2.25) / 0.75);
    if (handoff < 1) {
      const u = clamp(total / INTRO, 0, 1);
      descentPath.getPoint(u, descentPos);
      descentAim.getPoint(u, descentTarget);
      // Orbit framing: keep the whole planet in view on narrow screens, and slide it clear of the text panel.
      const orbit = 1 - smoothstep(total / 0.9);
      const fitOrbit = Math.max(1, 0.77 / camera.aspect);
      descentPos.sub(EARTH_CENTER).multiplyScalar(lerp(1, fitOrbit, orbit)).add(EARTH_CENTER);
      descentTarget.x += (mobile ? 0 : -8) * orbit;
      scratchA.copy(look);
      look.lerpVectors(descentTarget, scratchA, handoff);
      camera.position.lerpVectors(descentPos, flightPos, handoff);
    } else {
      camera.position.copy(flightPos);
    }
    camera.position.x += parallax.x;
    camera.position.y += parallax.y;
    camera.lookAt(look);

    const velocity = raw - state.damped;
    const bankAngle =
      lerp(BANK[index], BANK[index + 1], eased) +
      clamp(-velocity * 6, -8, 8) +
      Math.sin(Math.PI * local) * (index % 2 ? 8 : -8);
    camera.rotateZ((bankAngle * Math.PI) / 180);
    camera.fov =
      36 +
      Math.min(7, Math.abs(velocity) * 8) * motion +
      Math.sin(Math.PI * local) * 2.5 * motion +
      Math.sin(Math.PI * clamp01(total - 2)) * 12 * motion; // warp kick as we leave the body
    camera.updateProjectionMatrix();

    parallax.x += (pointerNorm.x * 0.55 - parallax.x) * 0.045;
    parallax.y += (-pointerNorm.y * 0.32 - parallax.y) * 0.045;

    // The atmosphere banks with the camera so the horizon never feels pasted on.
    const descent = smoothstep(total) * (1 - smoothstep((total - 2.2) / 1.0));
    const skyScale = 1.42 + 0.48 * descent;
    const skyShift = `${(-(descent * 16 + (state.damped / SPAN) * 6)).toFixed(2)}%`;
    if (dive) dive.style.opacity = (smoothstep((total - 1.3) / 0.7) * (1 - smoothstep((total - 2.5) / 0.5))).toFixed(3);
    const skyRotation = `rotate(${(bankAngle * 0.9).toFixed(2)}deg) scale(${skyScale}) translateY(${skyShift})`;
    // Space at the first landing; the dawn atmosphere fades in as we drop towards the person.
    // ...and it dissolves again as we enter the genome (same moment the tissue light fades), revealing the nebula behind it.
    const skyAmount = smoothstep((total - 0.3) / 0.65) * (1 - smoothstep((total - 2.5) / 0.7));
    if (sky) sky.style.opacity = skyAmount.toFixed(3);
    if (skyImage) skyImage.style.opacity = (0.6 * skyAmount).toFixed(3);
    if (sky) sky.style.transform = skyRotation;
    if (skyImage) skyImage.style.transform = skyRotation;

    /* dust */
    const speed = Math.abs(velocity);
    world.dustMat.opacity = clamp(0.12 + speed * 0.4, 0.1, 0.42) * (1 - FEEL.dimDust * state.dimWeight);
    const positions = world.dustGeo.attributes.position.array;
    for (let i = 0; i < world.dustVel.length; i++) {
      positions[i * 3 + 1] += (world.dustVel[i].y + speed * 0.1 * motion) * k;
      positions[i * 3] += Math.sin(t + i) * 0.008 * k * motion;
      if (positions[i * 3 + 1] > 13) {
        positions[i * 3 + 1] = -13;
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
      }
    }
    world.dustGeo.attributes.position.needsUpdate = true;

    cyanLight.position.set(Math.cos(t * 0.4) * 7, 3, Math.sin(t * 0.4) * 7);
    violetLight.position.set(-Math.cos(t * 0.4) * 7, -2, -Math.sin(t * 0.4) * 7);

    if (composer) composer.render();
    else renderer.render(scene, camera);
  };

  /* ---------- events ---------- */

  canvas.addEventListener('pointerdown', (event) => {
    setPointer(event); // touch has no preceding pointermove, so sample the position here
    dragging = true;
    dragX = downX = pointerNorm.x;
    dragY = downY = pointerNorm.y;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = 'grabbing';
    onHover(null, 0, 0);
  });

  canvas.addEventListener('pointermove', (event) => {
    setPointer(event);
    if (dragging) {
      onHover(null, 0, 0);
      return;
    }
    const kind = pick(event.clientX, event.clientY, width, height);
    state.hovered = kind;
    canvas.style.cursor = kind ? 'pointer' : 'grab';
    onHover(kind, event.clientX, event.clientY);
  });

  canvas.addEventListener('pointerup', (event) => {
    setPointer(event);
    const wasDragging = dragging;
    dragging = false;
    canvas.style.cursor = 'grab';
    if (wasDragging && Math.hypot(pointerNorm.x - downX, pointerNorm.y - downY) < 0.02) {
      const kind = pick(event.clientX, event.clientY, width, height);
      if (kind) onInspect(kind);
    }
  });

  canvas.addEventListener('pointercancel', () => {
    dragging = false;
    canvas.style.cursor = 'grab';
    onHover(null, 0, 0);
  });
  canvas.addEventListener('pointerout', () => onHover(null, 0, 0));

  window.addEventListener('resize', resize);
  resize();
  frame();

  return {
    state,
    setProgress(value) {
      state.target = clamp(value, 0, SPAN);
    },
    /** Sets (never toggles) the selected structure; pass null to clear it. */
    select(key) {
      state.selected = key || null;
      if (key) state.lastSelected = key;
    },
    /** Sets (never toggles) reading focus: true makes background structures and dust recede. */
    setDim(value) {
      state.dim = value ? 1 : 0;
    },
    resize,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    }
  };
}