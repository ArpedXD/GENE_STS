import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

/**
 * Scroll bookkeeping for the whole story. It owns the stop elements (one per beat, in timeline order)
 * and answers one question: which beat is the viewer on?
 *
 * "On" means the stop element contains the middle line of the viewport. The stops are equal height, so
 * the middle line crosses a boundary exactly halfway between two camera stops. The copy therefore
 * changes at the midpoint of each camera move, never before the camera has left the previous pose.
 * The tall pinned DarkSequence owns the middle line for its whole length, so no copy appears over it.
 *
 * The 3D scene does its own continuous scroll tracking from the same elements (see getStops in
 * DnaScene), so this hook only drives React state when the active beat changes, not every frame.
 */
export function useScrollTimeline(count) {
  const els = useRef(Array(count).fill(null))
  const [active, setActive] = useState(0)

  // One stable ref callback per beat, so React does not detach and reattach them on every render.
  const refs = useMemo(
    () => Array.from({ length: count }, (_, i) => (el) => { els.current[i] = el }),
    [count],
  )
  const getEls = useCallback(() => els.current, [])

  useEffect(() => {
    let raf = 0
    let last = 0
    const read = () => {
      raf = 0
      const mid = window.innerHeight * 0.5
      let a = 0
      els.current.forEach((el, i) => {
        if (el && el.getBoundingClientRect().top <= mid) a = i
      })
      if (a !== last) {
        last = a
        setActive(a)
      }
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(read) }
    read()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  /** Scroll so beat `i` sits exactly on its camera stop (its centre on the viewport's middle line). */
  const goTo = useCallback((i) => {
    const el = els.current[Math.max(0, Math.min(els.current.length - 1, i))]
    if (!el) return
    const r = el.getBoundingClientRect()
    const top = r.top + window.scrollY + r.height / 2 - window.innerHeight / 2
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' })
  }, [])

  return { active, refs, getEls, goTo }
}