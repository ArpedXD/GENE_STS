/**
 * One pose per scroll stop (src/content.js), in world units.
 *
 * DNA world: the helix lies along X, 12 units long, ~1.9 wide, centred on the origin.
 * Ant world: lives at ANT_ORIGIN, far away from the helix, so the two never share a frame.
 *
 * pos / look     where the camera stands and what it aims at
 * roll           tilts the picture, so a horizontal helix can run on a diagonal
 * shift          slides the image by a fraction of the viewport (x: right, y: up)
 * shiftPortrait  same, for phones, where the text sits below
 * world          0 = blue DNA world, 1 = warm ant world (background, fog, bloom)
 * dna / ant      how visible each model is: dna fades its glow, ant is the lamp over the ant
 * curve          when arriving at this key, remap a parameter's progress to [start, end]
 *                of the scroll between the previous key and this one, so the lights go out
 *                early and come back on late, instead of everything easing at once
 * cut            skip the camera flight: jump to this pose halfway, while the screen is black
 */
export const ANT_ORIGIN = [0, -60, 0]
export const EARTH_ORIGIN = [0, -200, 0] // the explorer's planet, parked far below the ant
const A = ANT_ORIGIN[1]
const E = EARTH_ORIGIN[1]

export const CAMERA_KEYS = [
  // 1. Hero: the whole molecule on a diagonal, text on the left
  { pos: [1.5, 1.8, 27], look: [0, 0, 0], roll: 0.3, shift: [0.16, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  // 2. Base pairs: close and level, text on the right
  { pos: [-1.2, 0.6, 8.6], look: [-0.4, 0, 0], roll: -0.2, shift: [-0.37, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  // 3. Length: look along the molecule so it recedes into the distance
  { pos: [-9.2, 2.0, 5.2], look: [-1.5, 0, 0], roll: 0.08, shift: [0.32, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  // 4. Coil: near end-on, looking down the axis
  { pos: [-9, 0.3, 0.5], look: [0, 0, 0], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 0, dna: 1, ant: 0 },
  // 5. Inside the helix
  { pos: [-3.4, 0.05, 0.1], look: [4, 0, 0], roll: 0.15, shift: [0, 0], shiftPortrait: [0, 0.15], world: 0, dna: 1, ant: 0 },
  // 6. Blackout: keep drifting down the tunnel while the glow dies and the words light up
  {
    pos: [2.2, 0.05, 0.1], look: [9, 0, 0], roll: 0.15, shift: [0, 0], shiftPortrait: [0, 0],
    world: 1, dna: 0, ant: 0,
    curve: { dna: [0, 0.42], world: [0, 0.42] },
  },
  // 7. Lights up on the ant, seen from directly above (head at the top of the screen)
  {
    pos: [0, A + 10.4, -0.02], look: [0, A, 0], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2],
    world: 1, dna: 0, ant: 1, cut: true,
    curve: { ant: [0.62, 0.95] },
  },
  // 8. Swing down to three-quarters
  { pos: [5.4, A + 5.0, -4.4], look: [0, A + 0.5, 0.2], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  // 9. Side view
  { pos: [8.4, A + 1.1, 0.3], look: [0, A + 0.9, 0], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  // 10. Zoom in on the head
  { pos: [1.5, A + 1.3, -3.6], look: [0, A + 0.5, -2.5], roll: 0, shift: [0.22, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  // 11. Zoom in on the abdomen
  { pos: [-3.0, A + 1.8, 4.2], look: [0, A + 0.6, 1.6], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 1 },
  // 12. Dark flight, then the planet's surface close up (lamp out early, planet in late)
  {
    pos: [0, E + 33.5, 10], look: [0, E + 30, -2], roll: 0.1, shift: [0.25, 0], shiftPortrait: [0, 0.2],
    world: 1, dna: 0, ant: 0, earth: 1, cut: true,
    curve: { ant: [0, 0.4], earth: [0.6, 0.95] },
  },
  // 13. Zoom out: the continent
  { pos: [0, E + 40, 48], look: [0, E + 10, 0], roll: 0, shift: [-0.3, 0], shiftPortrait: [0, 0.2], world: 1, dna: 0, ant: 0, earth: 1 },
  // 14. Zoom out: the whole planet from orbit
  { pos: [0, E + 78, 118], look: [0, E, 0], roll: 0, shift: [0.28, 0], shiftPortrait: [0, 0.22], world: 1, dna: 0, ant: 0, earth: 1 },
]
