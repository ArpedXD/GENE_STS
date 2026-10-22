import { useEffect, useRef, useState } from 'react'
import { panelSide } from './timeline.js'
import { usePanelTransition } from './usePanelTransition.js'
import './Chapter.css'

/**
 * The floating copy panel. It renders whichever beat `usePanelTransition` says is currently shown,
 * which lags `activeIndex` by one fade so copy never overlaps.
 *
 * Conditional layout lives in one place, `hasSecondary`:
 *   - a beat needs BOTH a secondaryCtaText in the data AND an `inspect` key in the timeline
 *   - with one action the primary button stands alone; with two, the secondary sits beside it
 *   - beats with no entry (the blackout, the continent flyover) render an empty, hidden panel
 *
 * An entry with `typed: true` in genomeStudyData is a "chapter" beat: its label, title and description are typed out
 * one character at a time, in that order, and the buttons appear once the last line is finished. Its type is set in
 * Chapter.css. Reduced motion shows everything at once.
 */

const TYPE_CPS = [46, 24, 85] // characters per second for: label, title, description
const TYPE_GAP_MS = 200 // pause between lines
const TYPE_TAIL_MS = 250 // pause after the last character, before the buttons

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Types `lines` one after another once the panel is fully shown (phase 'in'). Returns null for beats that are not typed.
 * Progress is kept while the card fades out, so leaving never blanks the text early, and restarts when the beat is shown again.
 */
function useTypedLines(lines, phase, key) {
  const tRef = useRef(0)
  const [t, setT] = useState(0)
  const reduce = reducedMotion()
  const enabled = Boolean(lines)

  const spans = []
  let at = 0
  ;(lines ?? []).forEach((text, i) => {
    const ms = (text.length / TYPE_CPS[i]) * 1000
    spans.push({ start: at, ms, len: text.length, cps: TYPE_CPS[i] })
    at += ms + TYPE_GAP_MS
  })
  const last = spans[spans.length - 1]
  const total = last ? last.start + last.ms + TYPE_TAIL_MS : 0

  // New copy is mounted invisible in phase 'pre': that is the moment to rewind.
  useEffect(() => {
    if (phase === 'pre') {
      tRef.current = 0
      setT(0)
    }
  }, [phase, key])

  useEffect(() => {
    if (!enabled || reduce || phase !== 'in' || tRef.current >= total) return undefined
    let raf = 0
    let prev = performance.now()
    const tick = (now) => {
      tRef.current = Math.min(total, tRef.current + (now - prev))
      prev = now
      setT(tRef.current)
      if (tRef.current < total) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [enabled, reduce, phase, key, total])

  if (!enabled) return null
  if (reduce) return { counts: lines.map((l) => l.length), caret: -1, ready: true }

  const counts = spans.map((s) => clamp(Math.floor(((t - s.start) / 1000) * s.cps), 0, s.len))
  const ready = t >= total
  let caret = -1
  if (!ready) spans.forEach((s, i) => { if (t >= s.start) caret = i })
  return { counts, caret, ready }
}

/** Screen readers get the whole sentence once; the visible characters are hidden from them so the live region stays quiet. */
function Typed({ text, count, caret, em }) {
  // Split the text into plain and emphasised runs. Emphasised runs are set in italic serif (see Chapter.css) even while
  // they are still hidden, so the line breaks never move as the words fill in.
  const segments = []
  if (em?.length) {
    const escaped = em.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const re = new RegExp(`(${escaped.join('|')})`, 'g')
    let pos = 0
    for (const m of text.matchAll(re)) {
      if (m.index > pos) segments.push({ s: text.slice(pos, m.index), em: false })
      segments.push({ s: m[0], em: true })
      pos = m.index + m[0].length
    }
    if (pos < text.length) segments.push({ s: text.slice(pos), em: false })
  } else {
    segments.push({ s: text, em: false })
  }

  let start = 0
  let caretPlaced = false
  const nodes = segments.map((seg, i) => {
    const end = start + seg.s.length
    const visible = seg.s.slice(0, Math.max(0, count - start))
    const rest = seg.s.slice(visible.length)
    const showCaret = caret && !caretPlaced && count <= end
    if (showCaret) caretPlaced = true
    start = end
    const Tag = seg.em ? 'em' : 'span'
    return (
      <Tag key={i} className={seg.em ? 'tw-em' : undefined}>
        {visible}
        {showCaret && <span className="tw-caret" />}
        <span className="tw-rest">{rest}</span>
      </Tag>
    )
  })

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{nodes}</span>
    </>
  )
}

export default function StoryPanel({ beats, activeIndex, onPrimary, onSecondary }) {
  const { shown, phase, dir } = usePanelTransition(activeIndex)
  const beat = beats[shown]
  const entry = beat?.entry ?? null
  const hasSecondary = Boolean(entry?.secondaryCtaText && beat.inspect)
  const Title = beat?.id === 'home' ? 'h1' : 'h2'
  const typed = useTypedLines(entry?.typed ? [entry.section, entry.title, entry.description] : null, phase, shown)

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
      <div className="story-card" data-variant={typed ? 'chapter' : undefined} style={{ '--dir': dir }}>
        {entry && (
          <>
            <p className="story-eyebrow">
              {typed ? <Typed text={entry.section} count={typed.counts[0]} caret={typed.caret === 0} /> : entry.section}
            </p>
            {entry.subtitle && <p className="story-kicker">{entry.subtitle}</p>}
            <Title className="story-title">
              {typed ? <Typed text={entry.title} count={typed.counts[1]} caret={typed.caret === 1} em={entry.titleEm} /> : entry.title}
            </Title>
            <p className="story-lede">
              {typed ? <Typed text={entry.description} count={typed.counts[2]} caret={typed.caret === 2} /> : entry.description}
            </p>
            <div className="story-actions" data-count={hasSecondary ? 2 : 1} data-ready={typed ? typed.ready : true}>
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
