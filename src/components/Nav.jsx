import { useEffect, useState } from 'react'

export default function Nav({ stops, getEls }) {
  const [active, setActive] = useState(0)
  const [pct, setPct] = useState(0)
  const items = stops.map((s, i) => ({ ...s, i })).filter((s) => s.nav)
  useEffect(() => {
    const on = () => {
      const els = getEls()
      const y = window.scrollY + window.innerHeight * 0.5
      let a = 0
      els.forEach((el, i) => el && el.offsetTop <= y && (a = i))
      setActive(a)
      setPct(window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [getEls])
  const go = (i) => {
    const el = getEls()[i]
    el && window.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
  }
  const cur = items.reduce((c, s) => (s.i <= active ? s.i : c), items[0]?.i)
  return (
    <>
      <header className="topbar">
        <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Gene &amp; Stem</button>
        <nav aria-label="Chapters">
          {items.map((s) => (
            <button key={s.id} type="button" className={s.i === cur ? 'is-on' : ''} aria-current={s.i === cur} onClick={() => go(s.i)}>{s.nav}</button>
          ))}
        </nav>
      </header>
      <div className="progress" aria-hidden="true"><span style={{ transform: `scaleX(${pct})` }} /></div>
      <div className="rail" role="navigation" aria-label="Chapter markers">
        {items.map((s) => (
          <button key={s.id} type="button" title={s.nav} aria-label={s.nav} className={s.i === cur ? 'is-on' : ''} onClick={() => go(s.i)} />
        ))}
      </div>
    </>
  )
}
