/**
 * THE TIMELINE: one ordered list of "beats". Each beat is one scroll stop on the page,
 * and it ties together three things that used to live in three files:
 *
 *   1. a camera pose        (cam)     where the 3D camera stands when this beat is centred
 *   2. a block of copy      (entry)   looked up by id in genomeStudyData
 *   3. an inspectable thing (inspect) the INSPECT key opened by the secondary button
 *
 * dnaScene.js interpolates between CAMERA_KEYS[i] and CAMERA_KEYS[i+1] using the on-screen
 * positions of the stop elements, so the ORDER OF THIS ARRAY IS THE ORDER OF THE FLIGHT.
 * Reorder a beat and its camera, text and button all move together.
 *
 * kind: 'text'   -> floating panel shows the entry's copy
 *       'dark'   -> the pinned DarkSequence (typographic blackout); panel hides
 *       'visual' -> a camera-only beat with no copy; panel hides
 *
 * Pose fields (unchanged from the previous cameraKeys.js):
 *   pos / look     camera position and aim point, world units
 *   roll           tilts the picture
 *   shift          slides the image by a fraction of the viewport (x > 0 pushes the subject RIGHT,
 *                  which is how the panel knows to sit on the LEFT; see panelSide below)
 *   shiftPortrait  same, for phones, where the panel sits below
 *   world          0 = blue DNA world, 1 = warm ant world
 *   dna / ant      how visible each model is
 *   earth          visibility of the planet
 *   curve          remaps a parameter's progress inside the segment, so lights go out early and return late
 *   cut            skip the flight: jump to this pose halfway, while the screen is black
 */
import { genomeStudyData } from './genomeStudyData.js'

export const ANT_ORIGIN = [0, -60, 0]
export const EARTH_ORIGIN = [0, -200, 0]
const A = ANT_ORIGIN[1]
const E = EARTH_ORIGIN[1]

/* ───────────── camera poses, grouped by the 3D scene they live in ───────────── */
const POSE = {
  // DNA world: the helix lies along X, 12 units long, centred on the origin
  hero:       { pos: [1.5, 1.8, 27], look: [0, 0, 0], roll: 0.3, shift: [0.16, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  basePairs:  { pos: [-1.2, 0.6, 8.6], look: [-0.4, 0, 0], roll: -0.2, shift: [-0.37, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  length:     { pos: [-9.2, 2.0, 5.2], look: [-1.5, 0, 0], roll: 0.08, shift: [0.32, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  coil:       { pos: [-9, 0.3, 0.5], look: [0, 0, 0], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  inside:     { pos: [-3.4, 0.05, 0.1], look: [4, 0, 0], roll: 0.15, shift: [0, 0], shiftPortrait: [0, 0.15], world: 0, dna: 1, ant: 0 },
  // Blackout: drift down the tunnel while the glow dies and the words light up
  blackout:   { pos: [2.2, 0.05, 0.1], look: [9, 0, 0], roll: 0.15, shift: [0, 0], shiftPortrait: [0, 0], world: 1, dna: 0, ant: 0, curve: { dna: [0, 0.42], world: [0, 0.42] } },
  // Ant world, lit by one lamp
  antTop:     { pos: [0, A + 10.4, -0.02], look: [0, A, 0], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1, cut: true, curve: { ant: [0.62, 0.95] } },
  antThree:   { pos: [5.4, A + 5.0, -4.4], look: [0, A + 0.5, 0.2], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  antSide:    { pos: [8.4, A + 1.1, 0.3], look: [0, A + 0.9, 0], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  antHead:    { pos: [1.5, A + 1.3, -3.6], look: [0, A + 0.5, -2.5], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  antAbdomen: { pos: [-3.0, A + 1.8, 4.2], look: [0, A + 0.6, 1.6], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  // Planet: dark flight, then surface -> continent -> orbit
  earthLand:  { pos: [0, E + 33.5, 10], look: [0, E + 30, -2], roll: 0.1, shift: [0.25, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 0, earth: 1, cut: true, curve: { ant: [0, 0.4], earth: [0.6, 0.95] } },
  earthLand2: { pos: [0, E + 40, 48], look: [0, E + 10, 0], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 0, earth: 1 },
  earthOrbit: { pos: [0, E + 78, 118], look: [0, E, 0], roll: 0, shift: [0.28, 0], shiftPortrait: [0, 0.22], world: 1, dna: 0, ant: 0, earth: 1 },
}

/* ───────────── the beats ───────────── */
const byId = Object.fromEntries(genomeStudyData.map((e) => [e.id, e]))

/** A beat that shows copy. `nav` is the short label for the top bar and the dot rail. */
const text = (id, nav, cam, inspect) => {
  if (!byId[id]) throw new Error(`timeline: no entry "${id}" in genomeStudyData`)
  return { id, kind: 'text', nav, cam, inspect, entry: byId[id] }
}

export const BEATS = [
  // DNA world ─ space, one body, the genome
  text('home',            'Home',              POSE.hero),                    // whole molecule on a diagonal
  text('the-person',      'The Person',        POSE.basePairs),               // close and level
  text('inside-the-body', 'Inside the Body',   POSE.length),                  // look along the molecule
  text('the-genome',      'The Genome',        POSE.coil, 'dna'),             // end-on, down the axis
  text('about-the-study', 'About the Study',   POSE.inside, 'cell0'),         // inside the helix
  { id: 'blackout', kind: 'dark', cam: POSE.blackout },                      // pinned typographic sequence

  // Ant world ─ lamp comes on, camera orbits the ant
  text('gene-therapy',        'Gene Therapy',        POSE.antTop, 'mol0'),
  text('stem-cell-research',  'Stem Cell Research',  POSE.antThree, 'cell1'),
  text('clinical-milestones', 'Clinical Milestones', POSE.antSide, 'mol5'),
  text('ethical-issues',      'Ethical Issues',      POSE.antHead, 'mol4'),
  text('benefits-and-risks',  'Benefits & Risks',    POSE.antAbdomen, 'mol1'),

  // Planet ─ land on the surface, pull out to orbit
  text('access-and-governance', 'Access & Governance', POSE.earthLand, 'cell4'),
  { id: 'earth-zoom', kind: 'visual', cam: POSE.earthLand2 },                // camera-only: the continent
  text('references',            'References',          POSE.earthOrbit, 'nucleosome'),
]

// Fail loudly in dev if a data entry never made it onto the timeline.
if (import.meta.env?.DEV) {
  genomeStudyData.forEach((e) => {
    if (!BEATS.some((b) => b.id === e.id)) console.warn(`timeline: "${e.id}" has no beat and will never show`)
  })
}

/** Which side the panel docks on: opposite the subject. shift.x > 0 means the subject is pushed right. */
export const panelSide = (beat) => {
  const x = beat?.cam?.shift?.[0] ?? 0
  return x < -0.05 ? 'R' : 'L'
}