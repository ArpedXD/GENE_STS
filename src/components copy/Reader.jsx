import { useEffect } from 'react'
import { INSPECT } from '../explorer/content.js'

export default function Reader({ id, onClose }) {
  useEffect(() => {
    if (!id) return
    const k = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [id, onClose])
  const d = id && INSPECT[id]
  if (!d) return null
  return (
    <div className="reader" role="dialog" aria-modal="true" aria-labelledby="reader-title" onClick={onClose}>
      <article className="reader__card" onClick={(e) => e.stopPropagation()}>
        <p className="reader__tag">{d.tag}</p>
        <h2 id="reader-title">{d.title}</h2>
        <p>{d.summary}</p>
        {d.stats?.length > 0 && (
          <dl className="reader__stats">
            {d.stats.map((s) => (
              <div key={s.label}><dt>{s.value}</dt><dd>{s.label}. {s.note}</dd></div>
            ))}
          </dl>
        )}
        {d.cards?.map((c) => (
          <section key={c.heading}><h3>{c.heading}</h3><p>{c.text}</p></section>
        ))}
        <button type="button" className="stop__action" autoFocus onClick={onClose}>Close</button>
      </article>
    </div>
  )
}
