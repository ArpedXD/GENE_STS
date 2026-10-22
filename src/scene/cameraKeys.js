/**
 * dnaScene.js still imports CAMERA_KEYS from here, so it needs no changes.
 * The poses now live in story/timeline.js, next to the copy they belong to.
 */
import { BEATS, ANT_ORIGIN, EARTH_ORIGIN } from '../story/timeline.js'

export { ANT_ORIGIN, EARTH_ORIGIN }
export const CAMERA_KEYS = BEATS.map((b) => b.cam)