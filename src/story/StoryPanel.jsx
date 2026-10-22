import { useEffect, useRef } from 'react'
import { panelSide } from './timeline.js'
import { usePanelTransition } from './usePanelTransition.js'

/**
 * The floating copy panel. It renders whichever beat `usePanelTransition` says is currently shown,
 * which lags `activeIndex` by one fade so copy never overlaps.
 *
 * Conditional layout lives in one place, `hasSecondary`:
 *   - a beat needs BOTH a secondaryCtaText in the data AND an `inspect` key in the timeline
 *   - with one action the primary button stands alone; with two, the secondary sits beside it
 *   - beats with no entry (the blackout, the continent flyover) render an empty, hidden panel
 */
export default function StoryPanel({ beats, activeIndex, onPrimary, onSecondary }) {
  const { shown, phase, dir } = usePanelTransition(activeIndex)
  const beat = beats[shown]
  const entry = beat?.entry ?? null
  const hasSecondary = Boolean(entry?.secondaryCtaText && beat.inspect)
  const Title = beat?.id === 'home' ? 'h1' : 'h2'

  // Out of reach for keyboard and screen readers while it is fading or empty.
  const ref = useRef(null)
  useEffect(() => {
    ref.current?.toggleAttribute('inert', phase !== 'in' || !entry)
  }, [phase, entry])

  return (
    <aside
      ref={ref}
      className="story-panel"
      data-side={panelSide(beat)}
      data-phase={phase}
      data-empty={!entry}
      aria-live="polite"
    >
      <div className="story-card" style={{ '--dir': dir }}>
        {entry && (
          <>
            <p className="story-eyebrow">{entry.section}</p>
            {entry.subtitle && <p className="story-kicker">{entry.subtitle}</p>}
            <Title className="story-title">{entry.title}</Title>
            <p className="story-lede">{entry.description}</p>
            <div className="story-actions" data-count={hasSecondary ? 2 : 1}>
              <button type="button" className="story-btn story-btn--primary" onClick={() => onPrimary(beat, shown)}>
                {entry.ctaText}
              </button>
              {hasSecondary && (
                <button type="button" className="story-btn story-btn--secondary" onClick={() => onSecondary(beat.inspect)}>
                  {entry.secondaryCtaText}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </aside>
  )
}