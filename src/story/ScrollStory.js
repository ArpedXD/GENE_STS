import { useCallback, useState } from 'react'
import { BEATS } from './timeline.js'
import { useScrollTimeline } from './useScrollTimeline.js'
import StoryPanel from './StoryPanel.jsx'
import DnaScene from '../components/DnaScene.jsx'
import DarkSequence from '../components/DarkSequence.jsx'
import Nav from '../components/Nav.jsx'
import Reader from '../components/Reader.jsx'
import { STOPS } from '../content.js'
import './story.css'

// The blackout lines already live in your old STOPS array, so reuse them as they are.
const DARK_BEATS = STOPS.find((s) => s.kind === 'dark')?.beats ?? []

/**
 * Wiring, top to bottom:
 *   BEATS (timeline.js)  ->  one stop element per beat, in order
 *   stop elements        ->  DnaScene (camera flight) and useScrollTimeline (which beat is active)
 *   active beat          ->  StoryPanel (copy), Nav (highlight)
 * Nothing here holds scroll position in React state; only the active index changes state.
 */
export default function ScrollStory({ onOpenChapter }) {
  const { active, refs, getEls, goTo } = useScrollTimeline(BEATS.length)
  const [readerId, setReaderId] = useState(null)

  const handlePrimary = useCallback(
    (beat, index) => {
      if (beat.id === 'home') return goTo(index + 1)
      // No chapter reader yet? Fall back to moving on so the button never does nothing.
      return onOpenChapter ? onOpenChapter(beat.entry) : goTo(index + 1)
    },
    [goTo, onOpenChapter],
  )

  return (
    <>
      <DnaScene getStops={() => getEls().filter(Boolean)} onInspect={setReaderId} />
      <Nav stops={BEATS} getEls={getEls} />

      <StoryPanel beats={BEATS} activeIndex={active} onPrimary={handlePrimary} onSecondary={setReaderId} />

      <main className="stages">
        {BEATS.map((beat, i) =>
          beat.kind === 'dark' ? (
            <DarkSequence key={beat.id} id={beat.id} ref={refs[i]} beats={DARK_BEATS} />
          ) : (
            <section key={beat.id} id={beat.id} ref={refs[i]} className="stage" aria-label={beat.entry?.title ?? beat.id} />
          ),
        )}
      </main>

      <Reader id={readerId} onClose={() => setReaderId(null)} />
    </>
  )
}