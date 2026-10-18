/**
 * Geometry layer for Gene & Stem.
 * Pure three.js: no DOM access, no camera, no renderer.
 * `createWorld()` returns every interactive structure plus a lookup table,
 * so the camera path and the UI can be derived from geometry.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const BASE_COLOURS = [0x7dd3fc, 0xa78bfa, 0x5eead4, 0xfcd34d];

/** Resting orbit for each inspectable structure: radius, height, phase, spin, sway, pick size. */
const LAYOUT = [
  { key: 'cell0', r: 3.6, y: 3.4, a: 0.4, spin: 0.05, sway: 0.0, pick: 1.05 },
  { key: 'mol0', r: 3.4, y: -0.6, a: 2.2, spin: 0.06, sway: 1.1, pick: 0.85 },
  { key: 'cell1', r: 4.0, y: 4.4, a: 4.2, spin: 0.04, sway: 2.2, pick: 1.05 },
  { key: 'mol5', r: 3.8, y: -3.4, a: 5.6, spin: 0.05, sway: 3.3, pick: 0.85 },
  { key: 'mol4', r: 4.4, y: 1.6, a: 1.3, spin: 0.03, sway: 4.4, pick: 0.85 },
  { key: 'mol1', r: 3.2, y: -4.6, a: 3.4, spin: 0.06, sway: 5.5, pick: 0.7 },
  { key: 'cell4', r: 4.6, y: 5.6, a: 5.0, spin: 0.04, sway: 0.7, pick: 1.0 },
  { key: 'nucleosome', r: 2.2, y: -6.4, a: 0.9, spin: 0.03, sway: 1.8, pick: 0.9 },
  { key: 'cell2', r: 4.8, y: -1.8, a: 2.6, spin: 0.04, sway: 2.9, pick: 0.95 },
  { key: 'cell3', r: 5.0, y: 2.6, a: 0.1, spin: 0.03, sway: 4.0, pick: 0.95 },
  { key: 'mol2', r: 4.2, y: -5.4, a: 4.6, spin: 0.05, sway: 5.1, pick: 0.8 },
  { key: 'mol3', r: 5.2, y: 6.6, a: 3.0, spin: 0.03, sway: 0.3, pick: 0.95 },
  { key: 'germ0', r: 3.6, y: -2.2, a: 3.9, spin: 0.06, sway: 1.4, pick: 0.65 },
  { key: 'germ1', r: 4.6, y: 0.6, a: 5.9, spin: 0.04, sway: 2.5, pick: 0.7 },
  { key: 'germ2', r: 5.4, y: 3.9, a: 2.0, spin: 0.04, sway: 3.6, pick: 0.7 }
];

const Y_AXIS = new THREE.Vector3(0, 1, 0);

/** Where the person stands: far below the genome world so the two never overlap. */
export const HUMAN_ORIGIN = new THREE.Vector3(0, -40, 0);

/** The planet the person stands on: its top point sits just under their feet. */
export const EARTH_RADIUS = 30;
export const EARTH_CENTER = new THREE.Vector3(HUMAN_ORIGIN.x, HUMAN_ORIGIN.y - 0.55 - EARTH_RADIUS, HUMAN_ORIGIN.z);

/* ---------- procedural noise for the planet textures ---------- */

const hash3 = (x, y, z) => {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
};
const fade = (t) => t * t * (3 - 2 * t);
const vnoise = (x, y, z) => {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const zi = Math.floor(z);
  const fx = fade(x - xi);
  const fy = fade(y - yi);
  const fz = fade(z - zi);
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(hash3(xi, yi, zi), hash3(xi + 1, yi, zi), fx), l(hash3(xi, yi + 1, zi), hash3(xi + 1, yi + 1, zi), fx), fy),
    l(l(hash3(xi, yi, zi + 1), hash3(xi + 1, yi, zi + 1), fx), l(hash3(xi, yi + 1, zi + 1), hash3(xi + 1, yi + 1, zi + 1), fx), fy),
    fz
  );
};
const fbm = (x, y, z, octaves) => {
  let sum = 0;
  let amp = 0.5;
  let norm = 0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * vnoise(x, y, z);
    norm += amp;
    x *= 2.03;
    y *= 2.03;
    z *= 2.03;
    amp *= 0.5;
  }
  return sum / norm;
};
const smooth01 = (a, b, v) => fade(Math.min(1, Math.max(0, (v - a) / (b - a))));

export function createWorld() {
  const root = new THREE.Group();

  /* ---------- shared material language: glass, solid, tinted ---------- */

  const glass = (colour, opacity, env = 1.6) =>
    new THREE.MeshPhysicalMaterial({
      color: colour,
      roughness: 0.06,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      transparent: true,
      opacity,
      envMapIntensity: env,
      depthWrite: false,
      iridescence: 0.5,
      emissive: colour,
      emissiveIntensity: 0.08
    });

  const solid = (colour, opts = {}) =>
    new THREE.MeshPhysicalMaterial({
      color: colour,
      roughness: opts.roughness ?? 0.28,
      metalness: opts.metalness ?? 0,
      clearcoat: opts.clearcoat ?? 0.9,
      clearcoatRoughness: 0.12,
      envMapIntensity: opts.env ?? 1.35,
      emissive: colour,
      emissiveIntensity: opts.emissive ?? 0.22,
      transparent: opts.transparent ?? false,
      opacity: opts.opacity ?? 1
    });

  const nucleusMat = solid(0x5b4bd6, { roughness: 0.3, env: 1.2, emissive: 0.5 });
  const nucleusSoft = solid(0xa78bfa, { roughness: 0.28, env: 1.2, emissive: 0.45 });
  const membraneMat = solid(0x7fa8ff, { roughness: 0.15, transparent: true, opacity: 0.2, emissive: 0.08 });
  const cellMat = solid(0x74d0ff, { roughness: 0.16, transparent: true, opacity: 0.26, env: 1.5, emissive: 0.1 });
  const bondMat = new THREE.MeshStandardMaterial({ color: 0xc8d6f5, roughness: 0.3, metalness: 0.35 });
  const proteinMat = solid(0x8fa9ff, { roughness: 0.3, env: 1.2, emissive: 0.12 });
  const proteinAlt = solid(0xc7b6ff, { roughness: 0.32, env: 1.2, emissive: 0.12 });
  const capsidMat = solid(0x7dd3fc, { roughness: 0.2, transparent: true, opacity: 0.5, env: 1.7, emissive: 0.25 });
  const lipidMat = solid(0xfacc15, { roughness: 0.22, transparent: true, opacity: 0.4, env: 1.6, emissive: 0.2 });
  const rnaMat = solid(0xff9ad5, { roughness: 0.25, env: 1.4, emissive: 0.4 });
  const bacMat = solid(0x34d399, { roughness: 0.3, env: 1.3, emissive: 0.25 });
  const retroMat = solid(0xf43f5e, { roughness: 0.22, env: 1.5, emissive: 0.25 });
  const adenoMat = solid(0xfbbf24, { roughness: 0.22, env: 1.5, emissive: 0.25 });
  const guideMat = solid(0x5eead4, { roughness: 0.2, env: 1.5, emissive: 0.45 });
  const treadMat = new THREE.MeshStandardMaterial({ color: 0x6ee7b7, roughness: 0.4, metalness: 0.1 });

  /* ---------- reusable primitives ---------- */

  const tube = (points, radius, material, segments = 200) =>
    new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p))), segments, radius, 12),
      material
    );

  /** A helical strand as a list of points: radius, height, turns, phase. */
  const strandPoints = (radius, height, turns, phase, count = 26) => {
    const pts = [];
    for (let i = 0; i <= count; i++) {
      const t = i / count;
      const angle = t * turns * Math.PI * 2 + phase;
      pts.push([Math.cos(angle) * radius, (t - 0.5) * height, Math.sin(angle) * radius]);
    }
    return pts;
  };

  /** Capsid-like shells: an icosahedron plus spikes and knobs on every unique vertex. */
  const spikedShell = (radius, detail, shellMat, spikeMat, knobMat, spikeLength = 0.2) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(radius, detail), shellMat));
    const geo = new THREE.IcosahedronGeometry(radius, detail);
    const pos = geo.attributes.position;
    const seen = new Set();
    for (let i = 0; i < pos.count; i++) {
      const key = `${pos.getX(i).toFixed(2)},${pos.getY(i).toFixed(2)},${pos.getZ(i).toFixed(2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
      const dir = v.clone().normalize();
      const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, spikeLength, 6), spikeMat);
      spike.position.copy(dir).multiplyScalar(radius * (1 + spikeLength / radius / 2));
      spike.quaternion.setFromUnitVectors(Y_AXIS, dir);
      g.add(spike);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.036, 10, 8), knobMat);
      knob.position.copy(dir).multiplyScalar(radius + spikeLength * 0.9);
      g.add(knob);
    }
    return g;
  };

  /* ---------- 1. the DNA double helix: the spine of the whole flight ---------- */

  const helixGroup = new THREE.Group();
  const HELIX_R = 1.2;
  const HELIX_H = 8;
  const TURNS = 2.4;

  const helixAt = (t, offset) => {
    const angle = t * TURNS * Math.PI * 2 + offset;
    return new THREE.Vector3(Math.cos(angle) * HELIX_R, (t - 0.5) * HELIX_H, Math.sin(angle) * HELIX_R);
  };

  [
    [0, 0x8fd8ff],
    [Math.PI, 0xb9a6ff]
  ].forEach(([offset, colour]) => {
    const pts = [];
    for (let i = 0; i <= 200; i++) pts.push(helixAt(i / 200, offset));
    helixGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 400, 0.095, 14), glass(colour, 0.5, 1.8))
    );
  });

  const RUNGS = 26;
  const rungs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.05, 0.05, 1, 10),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.25,
      clearcoat: 0.8,
      envMapIntensity: 1.3,
      emissive: 0x1a2a66,
      emissiveIntensity: 0.5
    }),
    RUNGS * 2
  );
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.15, 16, 16), glass(0xcfeaff, 0.7, 2), RUNGS * 2);

  const m4 = new THREE.Matrix4();
  const quat = new THREE.Quaternion();
  const scaleVec = new THREE.Vector3();
  const colour = new THREE.Color();

  for (let i = 0; i < RUNGS; i++) {
    const t = (i + 0.5) / RUNGS;
    const a = helixAt(t, 0);
    const b = helixAt(t, Math.PI);
    const mid = a.clone().add(b).multiplyScalar(0.5);
    [
      [a, mid],
      [mid, b]
    ].forEach(([p0, p1], half) => {
      const dir = p1.clone().sub(p0);
      const len = dir.length();
      quat.setFromUnitVectors(Y_AXIS, dir.normalize());
      m4.compose(p0.clone().add(p1).multiplyScalar(0.5), quat, scaleVec.set(1, len, 1));
      rungs.setMatrixAt(i * 2 + half, m4);
      rungs.setColorAt(i * 2 + half, colour.set(BASE_COLOURS[(i + half * 2) % 4]));
    });
    m4.makeTranslation(a.x, a.y, a.z);
    nodes.setMatrixAt(i * 2, m4);
    m4.makeTranslation(b.x, b.y, b.z);
    nodes.setMatrixAt(i * 2 + 1, m4);
  }
  if (rungs.instanceColor) rungs.instanceColor.needsUpdate = true;
  helixGroup.add(rungs, nodes);

  // Invisible picking volume so the helix can be hovered like any other structure.
  helixGroup.add(
    new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 8.6, 12), new THREE.MeshBasicMaterial({ visible: false }))
  );
  helixGroup.userData.kind = 'dna';
  root.add(helixGroup);

  /* ---------- 2. the fifteen inspectable structures ---------- */

  const builders = {
    // DNA wrapped 1.7 turns around a histone octamer.
    nucleosome() {
      const g = new THREE.Group();
      const dna = strandPoints(0.62, 1.5, 1.7, 0.6, 30).map(([x, y, z]) => [x + 0.06, y, z]);
      g.add(tube(dna, 0.05, glass(0x7dd3fc, 0.85, 1.8), 160));
      const histoneColours = [0xa78bfa, 0x818cf8, 0x5eead4, 0x67e8f9];
      for (let i = 0; i < 8; i++) {
        const h = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 20, 16),
          solid(histoneColours[i % 4], { roughness: 0.28, env: 1.4, emissive: 0.2 })
        );
        const angle = (i / 8) * Math.PI * 2;
        h.position.set(Math.cos(angle) * 0.38, i % 2 ? 0.12 : -0.12, Math.sin(angle) * 0.38);
        h.scale.setScalar(1 + (i % 3) * 0.08);
        g.add(h);
      }
      return g;
    },

    // Blastocyst-derived cell with a pluripotent inner cell mass.
    cell0() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.92, 40, 30), membraneMat));
      for (let i = 0; i < 7; i++) {
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 20, 16), nucleusMat);
        const a = (i / 7) * Math.PI * 2;
        c.position.set(Math.cos(a) * 0.3, Math.sin(a * 1.6) * 0.28, Math.sin(a) * 0.3);
        g.add(c);
      }
      const halo = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.012, 8, 80), glass(0x7dd3fc, 0.5, 1.6));
      halo.rotation.x = Math.PI * 0.5;
      g.add(halo);
      return g;
    },

    // Reprogrammed adult cell: transcription factors circling the nucleus.
    cell1() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.94, 40, 30), cellMat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 26, 20), nucleusMat));
      for (let i = 0; i < 4; i++) {
        const factor = new THREE.Mesh(
          new THREE.SphereGeometry(0.09, 16, 12),
          solid(0xfcd34d, { roughness: 0.2, env: 1.6, emissive: 0.5 })
        );
        const a = (i / 4) * Math.PI * 2;
        factor.position.set(Math.cos(a) * 0.6, Math.sin(a * 2) * 0.4, Math.sin(a) * 0.6);
        g.add(factor);
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.008, 8, 90), glass(0x5eead4, 0.45, 1.6));
      ring.rotation.set(1.1, 0.4, 0);
      g.add(ring);
      return g;
    },

    // Adult multipotent stromal cell: elongated body, cytoskeletal filaments.
    cell2() {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 36, 26), cellMat);
      body.scale.set(1.35, 0.72, 0.9);
      g.add(body);
      const nuc = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 18), nucleusSoft);
      nuc.position.set(-0.25, 0.05, 0);
      nuc.scale.set(1.2, 0.9, 0.9);
      g.add(nuc);
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const f = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 6), treadMat);
        f.position.set(Math.cos(a) * 0.4, Math.sin(a) * 0.12, Math.sin(a) * 0.3);
        f.rotation.set(a * 0.5, 0, a);
        g.add(f);
      }
      return g;
    },

    // Implanted dopamine neuron precursor with dendritic processes and vesicles.
    cell3() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.36, 28, 22), nucleusMat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.4, 30, 24), membraneMat));
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + 0.3;
        const len = 0.85 + (i % 2) * 0.3;
        const pts = [];
        for (let s = 0; s <= 6; s++) {
          const t = s / 6;
          pts.push([Math.cos(a) * t * len, Math.sin(t * 2.4 + a) * 0.14, Math.sin(a) * t * len]);
        }
        g.add(tube(pts, 0.028, proteinMat, 60));
      }
      for (let i = 0; i < 9; i++) {
        const v = new THREE.Mesh(
          new THREE.SphereGeometry(0.045, 12, 10),
          solid(0xff9ad5, { roughness: 0.2, env: 1.7, emissive: 0.7 })
        );
        const a = (i / 9) * Math.PI * 2;
        v.position.set(Math.cos(a) * 0.62, Math.sin(a * 3) * 0.3, Math.sin(a) * 0.62);
        g.add(v);
      }
      return g;
    },

    // Engineered T cell: Y-shaped chimeric antigen receptors on the surface.
    cell4() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.62, 36, 28), cellMat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 18), nucleusSoft));
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const b = 0.42 + (i % 2) * 0.34;
        const base = new THREE.Vector3(Math.cos(a) * 0.6, Math.sin(b) * 0.5, Math.sin(a) * 0.6);
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.24, 6), proteinAlt);
        stem.position.copy(base).multiplyScalar(1.16);
        stem.quaternion.setFromUnitVectors(Y_AXIS, base.clone().normalize());
        g.add(stem);
        for (const s of [-0.5, 0.5]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.16, 6), proteinAlt);
          arm.position
            .copy(base)
            .multiplyScalar(1.42)
            .add(new THREE.Vector3(Math.cos(a + s) * 0.08, 0.06, Math.sin(a + s) * 0.08));
          arm.rotation.set(s * 0.7, -a, s * 0.5);
          g.add(arm);
        }
      }
      return g;
    },

    // Two-lobed nuclease with guide RNA and the target duplex.
    mol0() {
      const g = new THREE.Group();
      const lobeA = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 2), proteinMat);
      lobeA.position.set(-0.16, 0.1, 0);
      lobeA.scale.set(1, 1.15, 1);
      const lobeB = new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), proteinAlt);
      lobeB.position.set(0.24, -0.1, 0.02);
      g.add(lobeA, lobeB);
      g.add(tube(strandPoints(0.26, 0.62, 1.5, 0.4, 20), 0.022, guideMat, 90));
      const target = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.15, 8), bondMat);
      target.rotation.z = Math.PI * 0.5;
      target.position.set(0, 0.46, 0);
      g.add(target);
      return g;
    },

    // Nickase plus deaminase acting on one base: no double-strand break.
    mol5() {
      const g = new THREE.Group();
      const cas = new THREE.Mesh(new THREE.IcosahedronGeometry(0.32, 2), proteinMat);
      cas.position.set(-0.14, -0.06, 0);
      const deaminase = new THREE.Mesh(new THREE.SphereGeometry(0.19, 24, 18), proteinAlt);
      deaminase.position.set(0.28, 0.16, 0.04);
      g.add(cas, deaminase);
      const duplex = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.2, 10), glass(0x7dd3fc, 0.7, 1.5));
      duplex.rotation.z = Math.PI * 0.5;
      duplex.position.set(0, 0.42, 0);
      g.add(duplex);
      const edited = new THREE.Mesh(
        new THREE.SphereGeometry(0.062, 16, 12),
        solid(0xfcd34d, { roughness: 0.15, env: 1.8, emissive: 0.9 })
      );
      edited.position.set(0.16, 0.42, 0.05);
      g.add(edited);
      return g;
    },

    // Small capsid vector: non-integrating delivery shell.
    mol1() {
      return spikedShell(
        0.4,
        1,
        capsidMat,
        solid(0x5eead4, { roughness: 0.2, env: 1.6, emissive: 0.4 }),
        solid(0x5eead4, { roughness: 0.2, env: 1.6, emissive: 0.5 })
      );
    },

    // Synthetic particle: lipid shell, nucleic-acid cargo, PEG chains.
    mol2() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.5, 34, 26), lipidMat));
      g.add(tube(strandPoints(0.2, 0.72, 2.4, 0.2, 22), 0.035, rnaMat, 110));
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        const b = Math.sin(i * 1.7) * 1.1;
        const chain = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.16, 5),
          solid(0xfde68a, { roughness: 0.3, env: 1.4, emissive: 0.3 })
        );
        const dir = new THREE.Vector3(Math.cos(a), b, Math.sin(a)).normalize();
        chain.position.copy(dir).multiplyScalar(0.56);
        chain.quaternion.setFromUnitVectors(Y_AXIS, dir);
        g.add(chain);
      }
      return g;
    },

    // Somatic (non-heritable) scope: treated cell holding a corrected cassette.
    mol3() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.68, 36, 26), membraneMat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.3, 26, 20), nucleusMat));
      const plasmid = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.026, 10, 60), glass(0x5eead4, 0.9, 1.7));
      plasmid.rotation.set(1.2, 0.6, 0.3);
      g.add(plasmid);
      const cassette = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.05, 0.05),
        solid(0xfcd34d, { roughness: 0.2, env: 1.6, emissive: 0.6 })
      );
      cassette.position.set(0.42, 0.05, 0.05);
      g.add(cassette);
      return g;
    },

    // Heritable boundary: eight-cell embryo inside the zona pellucida.
    mol4() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.72, 36, 26), glass(0xbfe6ff, 0.16, 1.6)));
      for (let i = 0; i < 8; i++) {
        const a = (i / 4) * Math.PI;
        const c = new THREE.Mesh(new THREE.SphereGeometry(0.24, 22, 18), nucleusMat);
        c.position.set(Math.cos(a) * 0.3, i < 4 ? 0.26 : -0.26, Math.sin(a) * 0.3);
        g.add(c);
      }
      const edit = new THREE.Mesh(
        new THREE.TorusGeometry(0.86, 0.016, 8, 80),
        solid(0xff9ad5, { roughness: 0.2, env: 1.7, emissive: 0.7 })
      );
      edit.rotation.set(1.3, 0.2, 0);
      g.add(edit);
      const sperm = new THREE.Group();
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 14), nucleusSoft);
      head.scale.set(1, 0.8, 1.3);
      sperm.add(head);
      sperm.add(
        tube(
          strandPoints(0.04, 0.5, 1.4, 0, 12).map(([x, y, z]) => [x * 3, y + 0.34, z * 3]),
          0.012,
          solid(0xa78bfa, { roughness: 0.3, emissive: 0.4 }),
          60
        )
      );
      sperm.position.set(0.95, -0.09, 0.1);
      sperm.rotation.z = -0.4;
      g.add(sperm);
      return g;
    },

    // Recombinant bacterial host producing plasmid DNA.
    germ0() {
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.45, 10, 16), bacMat);
      body.rotation.z = Math.PI / 3;
      g.add(body);
      const plasmid = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.012, 8, 40),
        solid(0x5eead4, { roughness: 0.25, env: 1.5, emissive: 0.5 })
      );
      plasmid.position.set(-0.05, 0.02, 0.12);
      plasmid.rotation.y = 0.7;
      g.add(plasmid);
      for (let f = 0; f < 6; f++) {
        const pts = [];
        for (let s = 0; s <= 6; s++) {
          const t = s / 6;
          pts.push([Math.cos(t * 5 + f) * 0.16 * t, -0.22 - t * 0.34, Math.sin(t * 5 + f) * 0.16 * t]);
        }
        g.add(tube(pts, 0.009, treadMat, 50));
      }
      return g;
    },

    // Integrating vector: envelope, spikes and the strand entering the host genome.
    germ1() {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.26, 2), retroMat));
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, 30, 22), glass(0xfda4af, 0.16, 1.7)));
      for (let s = 0; s < 18; s++) {
        const v = new THREE.Vector3().setFromSphericalCoords(
          0.44,
          Math.acos(2 * Math.random() - 1),
          Math.random() * 6.28
        );
        const spike = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.028, 0.18, 6), retroMat);
        spike.position.copy(v);
        spike.quaternion.setFromUnitVectors(Y_AXIS, v.clone().normalize());
        g.add(spike);
      }
      g.add(
        tube(
          strandPoints(0.1, 0.9, 1.2, 0.4, 16).map(([x, y, z]) => [x + 0.5, y * 0.9, z * 0.5]),
          0.02,
          glass(0x7dd3fc, 0.9, 1.6),
          80
        )
      );
      return g;
    },

    // Oncolytic vector: replicating virus with fibre knobs.
    germ2() {
      return spikedShell(
        0.34,
        1,
        adenoMat,
        adenoMat,
        solid(0xf59e0b, { roughness: 0.2, env: 1.6, emissive: 0.7 }),
        0.24
      );
    }
  };

  /* ---------- place every structure on its resting orbit ---------- */

  const items = LAYOUT.map((cfg) => {
    const group = builders[cfg.key]();
    group.userData.kind = cfg.key;
    group.add(
      new THREE.Mesh(new THREE.SphereGeometry(cfg.pick, 10, 8), new THREE.MeshBasicMaterial({ visible: false }))
    );
    const base = new THREE.Vector3(Math.cos(cfg.a) * cfg.r, cfg.y, Math.sin(cfg.a) * cfg.r);
    group.position.copy(base);
    root.add(group);
    return {
      key: cfg.key,
      a: cfg.a,
      sway: cfg.sway,
      radius: cfg.r,
      height: cfg.y,
      orbit: cfg.spin, // slow drift around the helix, straight from LAYOUT
      spin: 0.18 + (cfg.a % 0.4), // tumble rate of the structure itself
      group,
      base
    };
  });

  /* ---------- atmosphere: soft cloud sprites and a drifting dust field ---------- */

  const spriteCanvas = document.createElement('canvas');
  spriteCanvas.width = spriteCanvas.height = 128;
  const sctx = spriteCanvas.getContext('2d');
  const grad = sctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,255,255,.9)');
  grad.addColorStop(0.5, 'rgba(255,255,255,.32)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  sctx.fillStyle = grad;
  sctx.fillRect(0, 0, 128, 128);
  const softTexture = new THREE.CanvasTexture(spriteCanvas);

  const clouds = new THREE.Group();
  for (let k = 0; k < 22; k++) {
    const angle = Math.random() * 6.28;
    const radius = 10 + Math.random() * 14;
    const y = -7 + Math.random() * 16;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: softTexture,
        color: y < 0 ? 0xf2b48a : 0xeaf0ff,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
        fog: false
      })
    );
    sprite.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    sprite.scale.setScalar(5 + Math.random() * 5);
    clouds.add(sprite);
  }

  const DUST = 160;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(DUST * 3);
  const dustVel = [];
  for (let i = 0; i < DUST; i++) {
    dustPos[i * 3] = (Math.random() - 0.5) * 30;
    dustPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    dustPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    dustVel.push({ y: 0.02 + Math.random() * 0.04 });
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const DUST_SIZE = 0.22; // world units; raise for a hazier field
  const dustMat = new THREE.PointsMaterial({
    size: DUST_SIZE,
    map: softTexture,
    transparent: true,
    opacity: 0.15,
    depthWrite: false,
    color: 0x95b0d0
  });

  const dustPoints = new THREE.Points(dustGeo, dustMat);
  dustPoints.frustumCulled = false;


  /* ---------- 2b. the planet: continents, clouds, atmosphere and stars ---------- */

  const earth = (() => {
    const group = new THREE.Group();
    group.position.copy(EARTH_CENTER);
    const tilt = new THREE.Group();
    tilt.rotation.set(0.8, 0, -0.25); // axial tilt, so the spot under the person is a mid-latitude one
    const spin = new THREE.Group();
    const cloudSpin = new THREE.Group();
    tilt.add(spin, cloudSpin);
    group.add(tilt);

    // Textures are painted in slices after load, so the page never freezes while they build.
    const W = 1024;
    const H = 512;
    const makeCanvas = () => {
      const c = document.createElement('canvas');
      c.width = W;
      c.height = H;
      return c;
    };
    const landCanvas = makeCanvas();
    const cloudCanvas = makeCanvas();
    const landCtx = landCanvas.getContext('2d');
    const cloudCtx = cloudCanvas.getContext('2d');
    landCtx.fillStyle = '#12356f';
    landCtx.fillRect(0, 0, W, H);
    cloudCtx.fillStyle = '#000';
    cloudCtx.fillRect(0, 0, W, H);
    const landTex = new THREE.CanvasTexture(landCanvas);
    landTex.colorSpace = THREE.SRGBColorSpace;
    landTex.anisotropy = 4;
    const cloudTex = new THREE.CanvasTexture(cloudCanvas);
    cloudTex.anisotropy = 4;
    const landImg = landCtx.createImageData(W, H);
    const cloudImg = cloudCtx.createImageData(W, H);

    const mix3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    const SEA = 0.54;
    let row = 0;
    const paintSlice = () => {
      const end = Math.min(H, row + 32);
      for (let y = row; y < end; y++) {
        const lat = (0.5 - (y + 0.5) / H) * Math.PI;
        const cl = Math.cos(lat);
        const sl = Math.sin(lat);
        for (let x = 0; x < W; x++) {
          const lon = ((x + 0.5) / W) * Math.PI * 2;
          const px = cl * Math.cos(lon);
          const pz = cl * Math.sin(lon);
          const h = fbm(px * 1.5 + 3.1, sl * 1.5 + 1.7, pz * 1.5 + 8.3, 5) + (fbm(px * 7, sl * 7, pz * 7, 2) - 0.5) * 0.07;
          const ice = smooth01(0.8, 0.9, Math.abs(lat) / (Math.PI / 2) + (fbm(px * 5, sl * 5, pz * 5, 2) - 0.5) * 0.14);
          let c;
          if (h < SEA) {
            const d = Math.sqrt(Math.min(1, (SEA - h) / 0.17));
            c = mix3([52, 148, 196], [9, 36, 94], d);
          } else {
            const e = Math.min(1, (h - SEA) / 0.2);
            const moist = fbm(px * 2.2 + 11, sl * 2.2, pz * 2.2 + 5, 2);
            const arid = smooth01(0.46, 0.58, moist) * (1 - smooth01(0.35, 0.7, Math.abs(lat) / (Math.PI / 2))) * (1 - e * 0.6);
            c = mix3([58, 120, 60], [204, 174, 116], arid);
            c = mix3(c, [124, 110, 80], smooth01(0.25, 0.7, e));
            c = mix3(c, [222, 216, 206], smooth01(0.7, 0.95, e));
          }
          c = mix3(c, [238, 245, 250], ice);
          const i = (y * W + x) * 4;
          landImg.data[i] = c[0];
          landImg.data[i + 1] = c[1];
          landImg.data[i + 2] = c[2];
          landImg.data[i + 3] = 255;

          const band = 0.7 + 0.3 * Math.cos(lat * 3);
          const cv = Math.round(255 * smooth01(0.5, 0.74, fbm(px * 2.6 + 20, sl * 3.2 + 4, pz * 2.6 + 9, 4) * band + 0.04));
          cloudImg.data[i] = cloudImg.data[i + 1] = cloudImg.data[i + 2] = cv;
          cloudImg.data[i + 3] = 255;
        }
      }
      landCtx.putImageData(landImg, 0, 0, 0, row, W, end - row);
      cloudCtx.putImageData(cloudImg, 0, 0, 0, row, W, end - row);
      landTex.needsUpdate = true;
      cloudTex.needsUpdate = true;
      row = end;
      if (row < H) setTimeout(paintSlice, 12);
    };
    setTimeout(paintSlice, 0);

    // Light comes from the upper left, in front of the camera at the first landing.
    const sunDir = new THREE.Vector3(-0.55, 0.5, 0.67).normalize();
    const planetVert = `
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() {
        vUv = uv;
        vN = normalize(mat3(modelMatrix) * normal);
        vec4 w = modelMatrix * vec4(position, 1.0);
        vW = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`;
    const planetFrag = `
      uniform sampler2D uMap; uniform vec3 uSun; uniform float uOpacity; uniform float uClouds;
      varying vec2 vUv; varying vec3 vN; varying vec3 vW;
      void main() {
        vec3 n = normalize(vN);
        vec3 v = normalize(cameraPosition - vW);
        float l = dot(n, normalize(uSun));
        float day = smoothstep(-0.12, 0.42, l);
        vec4 tex = texture2D(uMap, vUv);
        vec3 col;
        float alpha = uOpacity;
        if (uClouds > 0.5) {
          col = vec3(0.95, 0.97, 1.0) * (0.05 + 0.85 * day);
          alpha *= tex.r * 0.92;
        } else {
          float water = step(1.22 * tex.r, tex.b);
          vec3 h = normalize(normalize(uSun) + v);
          float spec = pow(max(dot(n, h), 0.0), 70.0) * water * day * 0.5;
          float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);
          float dusk = smoothstep(-0.05, 0.12, l) * (1.0 - smoothstep(0.12, 0.38, l));
          col = tex.rgb * (0.04 + 0.9 * day) + vec3(spec);
          col += vec3(0.95, 0.45, 0.15) * dusk * 0.12;
          col += vec3(0.2, 0.45, 0.95) * fres * 0.7 * (0.2 + 0.8 * day);
        }
        gl_FragColor = vec4(col * 0.88, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`;
    const planetMat = (map, clouds) =>
      new THREE.ShaderMaterial({
        uniforms: { uMap: { value: map }, uSun: { value: sunDir }, uOpacity: { value: 1 }, uClouds: { value: clouds ? 1 : 0 } },
        vertexShader: planetVert,
        fragmentShader: planetFrag,
        transparent: true,
        depthWrite: !clouds
      });
    const surfaceMat = planetMat(landTex, false);
    const cloudMat = planetMat(cloudTex, true);
    const surface = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS, 96, 64), surfaceMat);
    const cloudShell = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.012, 96, 64), cloudMat);
    surface.renderOrder = 1;
    cloudShell.renderOrder = 2;
    spin.add(surface);
    cloudSpin.add(cloudShell);

    const atmosphereMat = new THREE.ShaderMaterial({
      uniforms: { uSun: { value: sunDir }, uOpacity: { value: 1 } },
      vertexShader: `
        varying vec3 vVN; varying vec3 vWN;
        void main() {
          vVN = normalize(normalMatrix * normal);
          vWN = normalize(mat3(modelMatrix) * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform vec3 uSun; uniform float uOpacity;
        varying vec3 vVN; varying vec3 vWN;
        void main() {
          float d = dot(vVN, vec3(0.0, 0.0, 1.0));
          float inten = pow(clamp(-d / 0.34, 0.0, 1.0), 2.0);
          float lit = smoothstep(-0.35, 0.55, dot(vWN, normalize(uSun)));
          vec3 col = mix(vec3(0.2, 0.42, 0.95), vec3(0.45, 0.72, 1.0), lit) * inten * (0.18 + 0.95 * lit);
          gl_FragColor = vec4(col * uOpacity, 1.0);
        }`,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });
    const atmosphere = new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.075, 64, 48), atmosphereMat);
    atmosphere.renderOrder = 3;
    group.add(atmosphere);

    // A soft beacon over the spot where the person stands.
    const pingMat = new THREE.SpriteMaterial({
      map: softTexture,
      color: 0x7fe3ff,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false
    });
    const ping = new THREE.Sprite(pingMat);
    ping.position.copy(HUMAN_ORIGIN).sub(EARTH_CENTER).multiplyScalar(1.004);
    ping.renderOrder = 4;
    group.add(ping);

    // Stars: a distant shell around the planet.
    const STARS = 1600;
    const starPos = new Float32Array(STARS * 3);
    const starCol = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      const u = Math.random() * 2 - 1;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const dist = 700;
      starPos.set([r * Math.cos(a) * dist, u * dist, r * Math.sin(a) * dist], i * 3);
      const warm = Math.random();
      const bright = 0.45 + Math.random() * 0.55;
      starCol.set([bright * (0.8 + warm * 0.2), bright * 0.9, bright * (1 - warm * 0.25)], i * 3);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 3.2,
      sizeAttenuation: false,
      map: softTexture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      fog: false
    });
    const stars = new THREE.Points(starGeo, starMat);
    stars.frustumCulled = false;
    stars.renderOrder = -1;
    group.add(stars);

    /** amount: 1 = full planet in space, 0 = gone (the camera has dropped into the atmosphere). */
    const update = (t, dt, motion, amount) => {
      group.visible = amount > 0.002;
      if (!group.visible) return;
      spin.rotation.y += dt * 0.02 * motion;
      cloudSpin.rotation.y += dt * 0.028 * motion;
      surfaceMat.uniforms.uOpacity.value = amount;
      cloudMat.uniforms.uOpacity.value = amount;
      atmosphereMat.uniforms.uOpacity.value = amount;
      starMat.opacity = amount;
      const pulse = 0.5 + 0.5 * Math.sin(t * 2.2) * motion;
      ping.scale.setScalar(2.6 + pulse * 2.2);
      pingMat.opacity = amount * (0.55 + pulse * 0.4);
    };

    return { group, update };
  })();

  /* ---------- 3. the person: a stylised figure with a living interior ---------- */

  const human = (() => {
    const group = new THREE.Group();
    group.position.copy(HUMAN_ORIGIN);

    // Matte, opaque materials: the body reads as a person, not a glass model.
    const matte = (color, roughness) =>
      new THREE.MeshStandardMaterial({ color, roughness, metalness: 0, envMapIntensity: 0.45 });
    const skinTone = matte(0xcf9a73, 0.5);
    const skinDark = matte(0xa86f4d, 0.6);
    const shirt = matte(0x3f6fb0, 0.85);
    const trousers = matte(0x16171c, 0.9);
    const shoes = matte(0x1b1b20, 0.6);
    const hair = matte(0x1a1210, 0.7);
    const chainMat = new THREE.MeshStandardMaterial({ color: 0xcfd6df, roughness: 0.25, metalness: 0.9, envMapIntensity: 0.9 });
    const dark = matte(0x16110f, 0.5);
    const shirtDeep = matte(0x33598f, 0.85);
    const collar = matte(0x6c93cf, 0.8);
    const belt = matte(0x1c1511, 0.55);
    const buckle = new THREE.MeshStandardMaterial({ color: 0xd9b45a, roughness: 0.3, metalness: 0.85, envMapIntensity: 0.8 });
    const eyeWhite = matte(0xf4efe8, 0.4);
    const lips = matte(0xb4655b, 0.55);
    const sole = matte(0xe9e5dc, 0.7);
    const cheek = matte(0xe7a190, 0.65);

    const ball = new THREE.SphereGeometry(1, 28, 20);
    const part = (mat, x, y, z, sx, sy, sz) => {
      const m = new THREE.Mesh(ball, mat);
      m.position.set(x, y, z);
      m.scale.set(sx, sy, sz);
      return m;
    };

    // Third-person, facing -z. Front-face only, so from inside the chest you look out through the skin.
    // Build plan: block chest -> small block torso -> pelvis -> hip / knee / ankle balls -> shoes.
    const skin = new THREE.Group();

    const box = (mat, x, y, z, w, h, d, r = 0.04) => {
      const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 5, r), mat);
      m.position.set(x, y, z);
      return m;
    };

    // Joint balls are the "small circles"; limbs enter them wide, never at a point.
    const JOINT_FILL = 0.62; // limb radius at a joint = 62% of the ball radius (limb still fills well over half of it)
    const limb = (mat, a, b, r0, r1) => {
      const p = new THREE.Vector3(...a);
      const q = new THREE.Vector3(...b);
      const dir = q.clone().sub(p);
      const len = dir.length();
      const m = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 24, 1, true), mat);
      m.position.copy(p).add(q).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
      return m;
    };
    /** points: joint centres in order, balls: ball radius per joint, mats: limb material per segment. */
    const chain = (points, balls, limbMats, ballMats) => {
      points.forEach((pt, i) => {
        skin.add(part(ballMats[i], pt[0], pt[1], pt[2], balls[i], balls[i], balls[i]));
        if (i < points.length - 1) {
          skin.add(limb(limbMats[i], pt, points[i + 1], balls[i] * JOINT_FILL, balls[i + 1] * JOINT_FILL));
        }
      });
    };

    // Physique: a V-taper. Wide deltoids and lats, a chest that narrows (tip trimmed flat)
    // into a small waist, pecs, a six-pack, curly hair, and hands on the hips.
    const chestShape = new THREE.Shape();
    chestShape.moveTo(-0.2, 2.03);
    chestShape.lineTo(0.2, 2.03);
    chestShape.lineTo(0.44, 2.9);
    chestShape.quadraticCurveTo(0.45, 3.07, 0.32, 3.07);
    chestShape.lineTo(-0.32, 3.07);
    chestShape.quadraticCurveTo(-0.45, 3.07, -0.44, 2.9);
    chestShape.closePath();
    const chestGeo = new THREE.ExtrudeGeometry(chestShape, {
      depth: 0.4,
      bevelEnabled: true,
      bevelSize: 0.085,
      bevelThickness: 0.11,
      bevelSegments: 6,
      curveSegments: 12
    });
    chestGeo.translate(0, 0, -0.2);
    skin.add(new THREE.Mesh(chestGeo, skinTone));

    /** Ellipsoid stretched along a→b, for muscle bellies. */
    const bulge = (mat, a, b, t, rad, lenK, off = [0, 0, 0]) => {
      const p = new THREE.Vector3(...a);
      const q = new THREE.Vector3(...b);
      const dir = q.clone().sub(p);
      const m = part(mat, 0, 0, 0, rad, dir.length() * lenK, rad);
      m.position.copy(p).addScaledVector(dir, t).add(new THREE.Vector3(...off));
      m.quaternion.setFromUnitVectors(Y_AXIS, dir.normalize());
      return m;
    };
    const tilted = (mat, x, y, z, sx, sy, sz, rz) => {
      const m = part(mat, x, y, z, sx, sy, sz);
      m.rotation.z = rz;
      return m;
    };

    // small torso (waist), pelvis and waistband
    skin.add(
      box(skinTone, 0, 1.97, 0, 0.5, 0.46, 0.4, 0.12),
      box(belt, 0, 1.79, 0, 0.64, 0.08, 0.44, 0.03),
      box(trousers, 0, 1.64, 0, 0.64, 0.26, 0.43, 0.1)
    );

    // neck, trapezius and clavicles
    skin.add(limb(skinTone, [0, 3.04, 0], [0, 3.3, 0], 0.108, 0.095));
    [-1, 1].forEach((s) => {
      skin.add(
        tilted(skinTone, 0.26 * s, 3.12, 0.02, 0.24, 0.09, 0.17, -0.3 * s),
        tilted(skinTone, 0.15 * s, 3.0, -0.27, 0.15, 0.022, 0.05, -0.12 * s),
        // pecs: upper and lower mass, with a shadow line under each
        part(skinTone, 0.21 * s, 2.83, -0.235, 0.26, 0.12, 0.11),
        part(skinTone, 0.2 * s, 2.64, -0.24, 0.24, 0.11, 0.1),
        part(skinDark, 0.2 * s, 2.545, -0.28, 0.23, 0.012, 0.06),
        // lats flare under the arms, serratus and obliques at the ribs
        tilted(skinTone, 0.43 * s, 2.58, 0.1, 0.1, 0.4, 0.2, -0.24 * s),
        part(skinTone, 0.3 * s, 2.36, -0.14, 0.05, 0.14, 0.1),
        part(skinTone, 0.25 * s, 1.98, -0.03, 0.07, 0.2, 0.15)
      );
      // abs: three rows of blocks and the line between them
      [2.44, 2.3, 2.16].forEach((y) => skin.add(box(skinTone, 0.064 * s, y, -0.315, 0.105, 0.1, 0.05, 0.025)));
      skin.add(box(skinTone, 0.062 * s, 2.0, -0.215, 0.1, 0.1, 0.045, 0.025));
    });
    skin.add(box(skinDark, 0, 2.28, -0.318, 0.014, 0.44, 0.012, 0.005));

    // chain with a small pendant
    const chainTube = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          [[-0.13, 3.14, -0.12], [-0.12, 3.06, -0.3], [-0.06, 2.96, -0.335], [0, 2.9, -0.34], [0.06, 2.96, -0.335], [0.12, 3.06, -0.3], [0.13, 3.14, -0.12]].map(
            (p) => new THREE.Vector3(...p)
          )
        ),
        48,
        0.007,
        8
      ),
      chainMat
    );
    skin.add(chainTube, part(chainMat, 0, 2.885, -0.345, 0.02, 0.026, 0.01));

    // head: face, ears, brows, nose, lips
    skin.add(
      part(skinTone, 0, 3.5, 0, 0.19, 0.235, 0.21),
      part(skinTone, 0, 3.36, -0.03, 0.15, 0.13, 0.16),
      part(skinTone, -0.19, 3.48, 0, 0.03, 0.05, 0.03),
      part(skinTone, 0.19, 3.48, 0, 0.03, 0.05, 0.03),
      part(skinTone, 0, 3.455, -0.205, 0.024, 0.04, 0.034),
      part(cheek, -0.1, 3.4, -0.165, 0.035, 0.022, 0.015),
      part(cheek, 0.1, 3.4, -0.165, 0.035, 0.022, 0.015),
      part(eyeWhite, -0.07, 3.5, -0.178, 0.034, 0.024, 0.02),
      part(eyeWhite, 0.07, 3.5, -0.178, 0.034, 0.024, 0.02),
      part(dark, -0.07, 3.5, -0.196, 0.016, 0.016, 0.01),
      part(dark, 0.07, 3.5, -0.196, 0.016, 0.016, 0.01),
      part(hair, -0.07, 3.56, -0.185, 0.047, 0.01, 0.013),
      part(hair, 0.07, 3.56, -0.185, 0.047, 0.01, 0.013),
      part(lips, 0, 3.385, -0.182, 0.04, 0.008, 0.012),
      part(hair, 0, 3.56, 0.05, 0.2, 0.19, 0.21) // hair base under the curls
    );
    // curly hair: a dome of small clumps (deterministic, so it never changes between loads)
    let seed = 7;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < 70; i++) {
      const th = rand() * Math.PI * 2;
      const ph = Math.acos(1 - rand() * 0.85); // upper dome only
      const x = Math.sin(ph) * Math.cos(th);
      const z = Math.sin(ph) * Math.sin(th);
      const y = Math.cos(ph);
      if (z < -0.35 && y < 0.55) continue; // keep the forehead and face clear
      const r = 0.05 + rand() * 0.035;
      skin.add(part(hair, x * 0.215, 3.56 + y * 0.2, 0.04 + z * 0.22, r, r, r));
    }

    // legs: hip ball -> thigh -> knee ball -> shin -> ankle ball -> shoe (balls kept small)
    [-1, 1].forEach((s) => {
      const HIP = [0.19 * s, 1.62, 0];
      const KNEE = [0.19 * s, 0.96, 0.02];
      const ANKLE = [0.19 * s, 0.2, 0];
      chain([HIP, KNEE, ANKLE], [0.18, 0.12, 0.085], [trousers, trousers], [trousers, trousers, trousers]);
      skin.add(bulge(trousers, HIP, KNEE, 0.42, 0.125, 0.4), bulge(trousers, KNEE, ANKLE, 0.3, 0.095, 0.3, [0, 0, 0.02]));

      // arms: wide deltoid, flared elbow, forearm back in to the hip
      const SH = [0.62 * s, 2.9, 0];
      const EL = [0.88 * s, 2.3, 0.05];
      const WR = [0.4 * s, 1.84, -0.05];
      chain([SH, EL, WR], [0.13, 0.085, 0.062], [skinTone, skinTone], [skinTone, skinTone, skinTone]);
      skin.add(
        part(skinTone, 0.66 * s, 2.9, 0, 0.17, 0.21, 0.19), // deltoid
        bulge(skinTone, SH, EL, 0.5, 0.095, 0.32, [0, 0, -0.035]), // biceps
        bulge(skinTone, SH, EL, 0.45, 0.085, 0.34, [0, 0, 0.045]), // triceps
        bulge(skinTone, EL, WR, 0.3, 0.07, 0.3, [0, 0.01, -0.01]) // forearm
      );

      // hand resting on the hip
      skin.add(
        tilted(skinTone, 0.36 * s, 1.78, -0.09, 0.044, 0.056, 0.026, -0.55 * s),
        tilted(skinTone, 0.31 * s, 1.71, -0.115, 0.04, 0.05, 0.024, -0.55 * s),
        part(skinTone, 0.38 * s, 1.8, -0.12, 0.018, 0.04, 0.02)
      );

      // shoe: rounded body, toe cap, pale sole
      skin.add(
        box(shoes, 0.19 * s, 0.1, -0.08, 0.2, 0.15, 0.4, 0.06),
        part(shoes, 0.19 * s, 0.1, -0.27, 0.1, 0.075, 0.075),
        box(sole, 0.19 * s, 0.022, -0.085, 0.215, 0.04, 0.42, 0.02)
      );
    });
    // wristwatch on one wrist
    {
      const lerp = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
      const EL = [-0.88, 2.3, 0.05];
      const WR = [-0.4, 1.84, -0.05];
      skin.add(limb(dark, lerp(EL, WR, 0.86), lerp(EL, WR, 0.95), 0.052, 0.05));
    }

    // Interior: heart, lungs, brain, spine and the vessels between them.
    const inner = new THREE.Group();
    const heart = part(solid(0xff3b5c, { roughness: 0.35, env: 0.7, emissive: 0.06 }), 0.13, 2.47, -0.12, 0.13, 0.15, 0.12);
    const lungMat = solid(0xff9ab8, { roughness: 0.4, transparent: true, opacity: 0.28, env: 0.7, emissive: 0.02 });
    const boneMat = solid(0xf3e9d2, { roughness: 0.5, env: 0.7, emissive: 0.01 });
    inner.add(
      heart,
      part(lungMat, 0.22, 2.68, 0, 0.15, 0.3, 0.15),
      part(lungMat, -0.22, 2.68, 0, 0.15, 0.3, 0.15),
      part(solid(0xa78bfa, { roughness: 0.4, env: 0.7, emissive: 0.05 }), 0, 3.48, 0, 0.15, 0.12, 0.15)
    );
    for (let i = 0; i < 12; i++) inner.add(part(boneMat, 0, 1.8 + i * 0.1, 0.17, 0.04, 0.05, 0.04));

    const artery = solid(0xff4d6d, { roughness: 0.45, env: 0.7, emissive: 0.04 });
    const vein = solid(0x5aa9ff, { roughness: 0.45, env: 0.7, emissive: 0.03 });
    const routes = [[[0.12, 2.55, -0.1], [0.08, 3.0, -0.03], [0.04, 3.3, 0], [0.03, 3.42, 0.02]]];
    [-1, 1].forEach((s) => {
      routes.push([[0.1, 2.3, -0.05], [0.19 * s, 1.7, 0], [0.19 * s, 0.96, 0.03], [0.19 * s, 0.2, 0.02]]);
      routes.push([[0.12, 2.55, -0.1], [0.34 * s, 2.8, -0.04], [0.62 * s, 2.88, 0], [0.86 * s, 2.3, 0.05], [0.42 * s, 1.86, -0.04]]);
    });
    routes.forEach((r) => {
      inner.add(tube(r, 0.016, artery, 60));
      inner.add(tube(r.map(([x, y, z]) => [x * 0.9, y, z + 0.05]), 0.014, vein, 60));
    });

    // Tissue cells and drifting red blood cells fill the chest the camera dives into.
    const dummy = new THREE.Object3D();
    const inChest = (out) => {
      for (;;) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const z = Math.random() * 2 - 1;
        if (x * x + y * y + z * z <= 1) {
          const cy = 2.5 + y * 0.58;
          return out.set(x * (0.2 + 0.2 * Math.min(1, Math.max(0, (cy - 2.0) / 0.8))), cy, z * 0.26);
        }
      }
    };
    const CELLS = 520;
    const cellMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 10, 8),
      solid(0xffc2d4, { roughness: 0.4, transparent: true, opacity: 0.45, env: 0.6, emissive: 0.015 }),
      CELLS
    );
    const spot = new THREE.Vector3();
    for (let i = 0; i < CELLS; i++) {
      inChest(spot);
      const r = 0.02 + Math.random() * 0.05;
      dummy.position.copy(spot);
      dummy.scale.setScalar(r);
      dummy.updateMatrix();
      cellMesh.setMatrixAt(i, dummy.matrix);
    }
    const RBCS = 240;
    const rbcMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(1, 12, 8),
      solid(0xe11d48, { roughness: 0.45, env: 0.7, emissive: 0.03 }),
      RBCS
    );
    const rbc = Array.from({ length: RBCS }, () => ({
      p: inChest(new THREE.Vector3()),
      speed: 0.03 + Math.random() * 0.06,
      rx: Math.random() * 6,
      ry: Math.random() * 6
    }));

    // Cloud deck under the feet, and cloud layers the camera passes through while descending.
    const puff = (x, y, z, size, color, opacity) => {
      const s = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: softTexture, color, transparent: true, opacity, depthWrite: false, fog: false })
      );
      s.position.set(x, y, z);
      s.scale.setScalar(size);
      group.add(s);
    };
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * 6.28;
      const r = 1.2 + Math.random() * 4.5;
      puff(Math.cos(a) * r, -0.3 + Math.random() * 0.35, Math.sin(a) * r, 3.5 + Math.random() * 3, i % 3 ? 0xd9b4a0 : 0xe6e0f5, 0.15); // was pure white at 0.34: the main source of glare under the figure
    }
    for (let i = 0; i < 30; i++) {
      const a = Math.random() * 6.28;
      const r = 5 + Math.random() * 28;
      puff(Math.cos(a) * r, 3 + Math.random() * 50, Math.sin(a) * r, 9 + Math.random() * 9, i % 2 ? 0xe8c9b0 : 0xcdd8f2, 0.12);
    }

    const key = new THREE.PointLight(0xffd2a8, 45, 28);
    key.position.set(3.5, 5, 6);
    const rim = new THREE.PointLight(0x7fd0ff, 16, 22);
    rim.position.set(-4, 3.5, -4);
    const glow = new THREE.PointLight(0xff4d6d, 0.5, 2.2);
    glow.position.set(0.05, 2.5, 0.1);
    group.add(skin, inner, cellMesh, rbcMesh, key, rim, glow);

    const update = (t, dt, motion) => {
      const beat = Math.pow(Math.max(0, Math.sin(t * 5.8)), 10) * motion;
      heart.scale.set(0.13, 0.15, 0.12).multiplyScalar(1 + 0.16 * beat);
      glow.intensity = 0.5 + beat * 0.45;
      skin.scale.y = 1 + Math.sin(t * 1.1) * 0.004 * motion;
      rbc.forEach((c, i) => {
        c.p.z -= c.speed * dt * motion;
        if (c.p.z < -0.28) inChest(c.p).z = 0.28;
        dummy.position.copy(c.p);
        dummy.rotation.set(c.rx + t * 0.6 * motion, c.ry, 0);
        dummy.scale.set(0.05, 0.018, 0.05);
        dummy.updateMatrix();
        rbcMesh.setMatrixAt(i, dummy.matrix);
      });
      rbcMesh.instanceMatrix.needsUpdate = true;
    };

    return { group, update };
  })();

  const lookup = Object.fromEntries(items.map((item) => [item.key, item]));
  lookup.dna = { key: 'dna', group: helixGroup, base: new THREE.Vector3(0, 0, 0), radius: 0, height: 0 };

  return {
    root,
    human,
    earth,
    helix: { group: helixGroup, rungs, nodes },
    items,
    lookup,
    clouds,
    dust: dustPoints,
    dustGeo,
    dustVel,
    dustMat
  };
}