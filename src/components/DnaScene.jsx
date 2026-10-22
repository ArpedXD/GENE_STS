import { useEffect, useRef, useState } from 'react'
import { createDnaScene } from '../scene/dnaScene.js'

const BASE = import.meta.env.BASE_URL
const MODEL_URLS = {
  ant: `${BASE}assets/ant.glb`,
  earth: `${BASE}assets/earth.glb`,
  forest: `${BASE}assets/forest.glb`,
  leaves: `${BASE}assets/leaves.glb`,
}

export default function DnaScene({ getStops, onInspect }) {
  const canvasRef = useRef(null)
  const barRef = useRef(null)
  const labelRef = useRef(null)
  const scaleRef = useRef(null)
  const getStopsRef = useRef(getStops)
  getStopsRef.current = getStops
  const onInspectRef = useRef(onInspect)
  onInspectRef.current = onInspect

  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('loading') // loading | ready | error

  useEffect(() => {
    const scene = createDnaScene({
      canvas: canvasRef.current,
      modelUrls: MODEL_URLS,
      getStops: () => getStopsRef.current(),
      onInspect: (k) => onInspectRef.current?.(k),
      onLoadProgress: setProgress,
      onReady: () => setStatus('ready'),
      onError: () => setStatus('error'),
      // Written straight to the DOM: this fires every frame while you zoom.
      onScale: ({ px, label, opacity }) => {
        if (scaleRef.current) scaleRef.current.style.opacity = opacity
        if (barRef.current) barRef.current.style.width = `${px}px`
        if (labelRef.current) labelRef.current.textContent = label
      },
    })
    return () => scene.dispose()
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`dna-canvas${status === 'ready' ? ' is-ready' : ''}`}
        tabIndex={0}
        aria-label="Three-dimensional DNA double helix. Drag or use the arrow keys to turn it."
      />
      <div className="veil" aria-hidden="true" />

      <div className="scale" ref={scaleRef} aria-hidden="true">
        <span className="scale__bar" ref={barRef} />
        <span className="scale__label" ref={labelRef} />
      </div>

      <div className={`loader${status === 'loading' ? '' : ' is-done'}`} role="status">
        {status === 'error' ? (
          <p>The model could not be loaded. Check that assets/dna.glb is being served, then reload.</p>
        ) : (
          <>
            <p>Loading the helix</p>
            <span className="loader__track">
              <span className="loader__fill" style={{ transform: `scaleX(${progress})` }} />
            </span>
          </>
        )}
      </div>
    </>
  )
}
