import { useRef, useState, useCallback } from 'react'
import './App.css'
import DnaScene from './components/DnaScene.jsx'
import DarkSequence from './components/DarkSequence.jsx'
import Nav from './components/Nav.jsx'
import Reader from './components/Reader.jsx'
import { INSPECT } from './explorer/content.js'
import { STOPS } from './content.js'

function App() {
  const stopsRef = useRef([])
  const [open, setOpen] = useState(null)
  const getEls = useCallback(() => stopsRef.current, [])

  return (
    <>
      <DnaScene getStops={() => stopsRef.current.filter(Boolean)} onInspect={setOpen} />
      <Nav stops={STOPS} getEls={getEls} />
      <Reader id={open} onClose={() => setOpen(null)} />
      <main className="story">
        {STOPS.map((stop, i) => {
          const setRef = (el) => (stopsRef.current[i] = el)
          if (stop.kind === 'dark') {
            return <DarkSequence key={stop.id} id={stop.id} beats={stop.beats} ref={setRef} />
          }
          const Heading = i === 0 ? 'h1' : 'h2'
          return (
            <section
              key={stop.id}
              ref={setRef}
              className={`stop stop--${stop.side}${stop.theme ? ` stop--${stop.theme}` : ''}`}
              aria-labelledby={`${stop.id}-title`}
            >
              <div className="stop__text">
                <Heading id={`${stop.id}-title`}>{stop.title}</Heading>
                <p>{stop.body}</p>
                {stop.hint && <p className="stop__hint">{stop.hint}</p>}
                {stop.buttons && (
                  <div className="stop__chips">
                    {stop.buttons.map((k) => (
                      <button key={k} type="button" className="stop__chip" onClick={() => setOpen(k)}>{INSPECT[k]?.short}</button>
                    ))}
                  </div>
                )}
                {stop.action && (
                  <button
                    type="button"
                    className="stop__action"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  >
                    {stop.action}
                  </button>
                )}
              </div>
            </section>
          )
        })}
      </main>
    </>
  )
}

export default App
