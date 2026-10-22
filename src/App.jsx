import { useCallback, useState } from 'react'
import './App.css'
import './story/story.css'

import DnaScene from './components/DnaScene.jsx'
import DarkSequence from './components/DarkSequence.jsx'
import Nav from './components/Nav.jsx'
import Reader from './components/Reader.jsx'

import { STOPS } from './content.js'
import { BEATS } from './story/timeline.js'
import { useScrollTimeline } from './story/useScrollTimeline.js'
import StoryPanel from './story/StoryPanel.jsx'

// The blackout lines still come from your old STOPS array.
const DARK_BEATS = STOPS.find((s) => s.kind === 'dark')?.beats ?? []

function App() {
  // refs: one stop element per beat, in timeline order. active: the beat the viewer is on.
  const { active, refs, getEls, goTo } = useScrollTimeline(BEATS.length)
  const [open, setOpen] = useState(null) // INSPECT key shown in the Reader

  // Primary button: home moves on; other chapters move on until you add a chapter reader.
  const handlePrimary = useCallback((beat, index) => goTo(index + 1), [goTo])

  return (
    <>
      <DnaScene getStops={() => getEls().filter(Boolean)} onInspect={setOpen} />
      <Nav stops={BEATS} getEls={getEls} />

      <StoryPanel beats={BEATS} activeIndex={active} onPrimary={handlePrimary} onSecondary={setOpen} />

      <main className="stages">
        {BEATS.map((beat, i) =>
          beat.kind === 'dark' ? (
            <DarkSequence key={beat.id} id={beat.id} ref={refs[i]} beats={DARK_BEATS} />
          ) : (
            <section key={beat.id} id={beat.id} ref={refs[i]} className="stage" aria-label={beat.entry?.title ?? beat.id} />
          ),
        )}
      </main>

      <Reader id={open} onClose={() => setOpen(null)} />
    </>
  )
}

export default App