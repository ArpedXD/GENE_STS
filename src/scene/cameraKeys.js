/**
 * dnaScene.js imports everything it needs from the timeline through this file, the way a building
 * has one front door: the scene never reaches into story/timeline.js directly. The poses live in
 * story/timeline.js, next to the copy they belong to; this file only passes them through.
 *
 * ANT_HEAD, HEAD_RADIUS and EARTH_RADIUS are the three numbers the head-to-planet morph needs:
 * where the planet is born, how big it is at birth, and how big it ends up.
 */
import { BEATS, ANT_ORIGIN, EARTH_ORIGIN, ANT_HEAD, HEAD_RADIUS, EARTH_RADIUS } from '../story/timeline.js'

export { ANT_ORIGIN, EARTH_ORIGIN, ANT_HEAD, HEAD_RADIUS, EARTH_RADIUS }
export const CAMERA_KEYS = BEATS.map((b) => b.cam)