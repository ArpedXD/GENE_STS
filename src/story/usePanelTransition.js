import { useEffect, useRef, useState } from 'react'

const prefersReduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Turns a fast-changing target index into a calm, one-at-a-time copy swap.
 *
 *   in   -> target changes -> out   (old copy fades and drifts away)
 *   out  -> swap content   -> pre   (new copy mounted at opacity 0, offset, no transition)
 *   pre  -> two frames     -> in    (new copy fades and drifts to rest)
 *
 * Rapid scrolling is handled by the effect cleanup: every new target cancels the pending swap and
 * restarts the timer, so while the viewer is flicking through five beats the panel stays faded out
 * and then shows only the beat they land on. Two copy blocks are never on screen together.
 * If the target returns to what is already shown during `out`, the panel simply fades back in.
 */
export function usePanelTransition(target, { outMs = 240, settleMs = 90 } = {}) {
  const [state, setState] = useState({ shown: target, phase: 'in', dir: 1 })
  const shownRef = useRef(target)

  useEffect(() => {
    if (target === shownRef.current) {
      setState((s) => (s.phase === 'in' ? s : { ...s, phase: 'in' }))
      return undefined
    }
    const dir = target > shownRef.current ? 1 : -1 // 1 = travelling forward through the story
    setState((s) => ({ ...s, phase: 'out', dir }))
    let r1 = 0
    let r2 = 0
    const wait = prefersReduced() ? 0 : outMs + settleMs
    const timer = setTimeout(() => {
      shownRef.current = target
      setState({ shown: target, phase: 'pre', dir })
      // Two frames, so the browser paints the 'pre' state before the transition to 'in' begins.
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => setState((s) => ({ ...s, phase: 'in' })))
      })
    }, wait)
    return () => {
      clearTimeout(timer)
      cancelAnimationFrame(r1)
      cancelAnimationFrame(r2)
    }
  }, [target, outMs, settleMs])

  return state
}