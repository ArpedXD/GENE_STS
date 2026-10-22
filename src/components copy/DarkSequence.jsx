import React, { useEffect, useRef } from 'react'

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/**
 * The blackout. A tall section with one pinned frame: as you scroll through it, each beat's words
 * light up in turn, like subtitles being switched on, then the beat gives way to the next.
 * Everything is written straight to the DOM from the scroll handler, no React state per frame.
 */
const DarkSequence = React.forwardRef(function DarkSequence({ beats, id }, ref) {
  const rootRef = useRef(null)

  useEffect(() => {
    const root = rootRef.current
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const beatEls = [...root.querySelectorAll('[data-beat]')]
    const wordSets = beatEls.map((el) => [...el.querySelectorAll('[data-w]')])
    let raf = 0

    function update() {
      raf = 0
      const r = root.getBoundingClientRect()
      const span = Math.max(1, r.height - window.innerHeight)
      const u = clamp(-r.top / span)
      const n = beatEls.length
      beatEls.forEach((el, k) => {
        const local = clamp((u * n - k))
        const words = wordSets[k]
        const lit = reduce ? words.length : clamp(local / 0.72) * words.length
        words.forEach((w, i) => w.style.setProperty('--w', clamp(lit - i).toFixed(3)))
        const fadeIn = clamp(local / 0.07)
        const fadeOut = k < n - 1 ? clamp((1 - local) / 0.1) : 1
        const visible = u * n >= k && (u * n < k + 1 || k === n - 1)
        el.style.opacity = visible ? Math.min(fadeIn, fadeOut).toFixed(3) : '0'
      })
    }
    const schedule = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={(el) => {
        rootRef.current = el
        if (typeof ref === 'function') ref(el)
        else if (ref) ref.current = el
      }}
      className="dark"
      aria-label="How DNA works"
      id={id}
    >
      <div className="dark__frame">
        {beats.map((text, k) => (
          <p key={k} className="dark__beat" data-beat>
            {text.split(' ').map((word, i) => (
              <span key={i} data-w>
                {word}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
    </section>
  )
})

export default DarkSequence
