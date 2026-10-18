import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { createWorld } from '../explorer/structures.js'
import { CAMERA_KEYS, ANT_ORIGIN, EARTH_ORIGIN } from './cameraKeys.js'

const BG_DNA = new THREE.Color(0x040716)
const BG_ANT = new THREE.Color(0x070504)
const HELIX_LENGTH = 12 // the helix is scaled so its long axis spans this many world units
const HELIX_NM_DIAMETER = 2 // real DNA is ~2 nm wide; the scale bar is calibrated to this
const ANT_LENGTH = 5.2 // world units, head to antenna tip
const ANT_SOURCE = { length: 1835, centre: [-33, 0, 277] } // measured from ant.glb, in its own units
const LEAF_SCALE = 25 // the leaves file is ~0.4 units across; scaled up to ant-sized drama

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const lerp = (a, b, t) => a + (b - a) * t
const smoother = (t) => t * t * t * (t * (t * 6 - 15) + 10)
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/** The explorer's procedural helix plus its clickable structures, standing in for the old dna.glb. */
function buildExplorerRig(world) {
  const rig = new THREE.Group()
  const holder = new THREE.Group()
  holder.rotation.z = -Math.PI / 2 // explorer helix is vertical; this one lies along X
  holder.scale.setScalar(HELIX_LENGTH / 8)
  rig.add(holder)
  holder.add(world.helix.group)
  world.items.forEach((it) => {
    it.group.scale.setScalar(1.7) // bigger targets, easier to click from the wide hero shot
    holder.add(it.group)
  })
  const mats = new Set()
  rig.traverse((o) => {
    if (!o.material) return
    ;[].concat(o.material).forEach((m) => {
      if (m.visible === false) return
      m._o = m.opacity
      m._t = m.transparent
      mats.add(m)
    })
  })
  let last = -1
  return {
    rig,
    radius: 1.2 * (HELIX_LENGTH / 8),
    helixMaterial: { dispose() {} },
    items: world.items,
    setFade(d) {
      rig.visible = d > 0.003
      if (d === last) return
      last = d
      mats.forEach((m) => {
        m.transparent = m._t || d < 0.999
        m.opacity = m._o * d
      })
    },
    tick(t) {
      world.items.forEach((it) => {
        const a = it.a + t * it.orbit
        it.group.position.set(Math.cos(a) * it.radius, it.height + Math.sin(t * 0.5 + it.sway) * 0.25, Math.sin(a) * it.radius)
        it.group.rotation.y += 0.004 * it.spin
      })
    },
  }
}

/** A speckled, dark soil texture made on the fly, so the ant has a floor without another download. */
function makeSoilTexture() {
  const size = 512
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.fillStyle = '#1b1510'
  g.fillRect(0, 0, size, size)
  for (let i = 0; i < 9000; i++) {
    const v = 20 + Math.random() * 48
    g.fillStyle = `rgba(${v + 18},${v + 8},${v - 4},${0.15 + Math.random() * 0.4})`
    const r = Math.random() * 2.2 + 0.4
    g.beginPath()
    g.arc(Math.random() * size, Math.random() * size, r, 0, Math.PI * 2)
    g.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(14, 14)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 1-2-5 series, so the scale bar always lands on a number a person would write. */
function niceValue(target) {
  const exp = Math.floor(Math.log10(target))
  const base = Math.pow(10, exp)
  const f = target / base
  const m = f >= 5 ? 5 : f >= 2 ? 2 : 1
  return m * base
}

function formatLength(nm) {
  if (nm >= 1) return `${+nm.toPrecision(2)} nm`
  return `${+(nm * 10).toPrecision(2)} Å`
}

export function createDnaScene({ canvas, modelUrls, getStops, onLoadProgress, onReady, onError, onScale, onInspect }) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let disposed = false

  // ───────────────────────────── renderer, scene, post
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.toneMapping = THREE.NoToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap

  const scene = new THREE.Scene()
  scene.background = BG_DNA.clone()
  scene.fog = new THREE.FogExp2(BG_DNA.clone(), 0.034)

  const pmrem = new THREE.PMREMGenerator(renderer)
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  scene.environment = envTexture
  scene.environmentIntensity = 0.35

  const camera = new THREE.PerspectiveCamera(38, 1, 0.03, 300)
  // MSAA on the post-processing target, otherwise thin ant legs and leaf edges shimmer.
  const target = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 })
  const composer = new EffectComposer(renderer, target)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.6, 0.5, 0.2)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())

  // ───────────────────────────── state
  let dnaInfo = null
  let earthInfo = null // { sun }
  let earth = null // the earth.glb planet: { group, update(dt, amount) }
  let ant = null // { rig, mixer, materials, spot, hemi, ground, leaves }
  let aspect = 1
  let width = 1
  let height = 1
  let stops = []
  let scrollTarget = 0
  let scrollP = 0
  let introT = reduceMotion ? 1 : 0
  let started = false

  const spinBase = { angle: 0 }
  const dragQuat = new THREE.Quaternion()
  const spinQuat = new THREE.Quaternion()
  const tmpQuat = new THREE.Quaternion()
  const AXIS_X = new THREE.Vector3(1, 0, 0)
  const AXIS_Y = new THREE.Vector3(0, 1, 0)
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
  const drag = { active: false, id: null, lastX: 0, lastY: 0, vx: 0, vy: 0, idle: 0 }

  // ───────────────────────────── sizing + scroll
  function measureStops() {
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    stops = getStops().map((el) => {
      const r = el.getBoundingClientRect()
      const centre = r.top + window.scrollY + r.height / 2
      return clamp((centre - window.innerHeight / 2) / total)
    })
  }

  function resize() {
    width = window.innerWidth
    height = window.innerHeight
    aspect = width / height
    renderer.setSize(width, height, false)
    composer.setSize(width, height)
    camera.aspect = aspect
    camera.updateProjectionMatrix()
    measureStops()
    onScroll()
  }

  function onScroll() {
    const total = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
    scrollTarget = clamp(window.scrollY / total)
  }

  // ───────────────────────────── drag to turn the helix (and the ant)
  function onPointerDown(e) {
    if (e.button !== undefined && e.button !== 0) return
    drag.active = true
    drag.id = e.pointerId
    drag.lastX = e.clientX
    drag.lastY = e.clientY
    drag.vx = drag.vy = 0
    drag.idle = 0
    canvas.setPointerCapture?.(e.pointerId)
    canvas.classList.add('is-dragging')
  }

  function onPointerMove(e) {
    pointer.x = (e.clientX / width) * 2 - 1
    pointer.y = (e.clientY / height) * 2 - 1
    if (!drag.active || e.pointerId !== drag.id) return
    const dx = e.clientX - drag.lastX
    // Touch scrolls the page vertically, so only mouse and pen get the second axis.
    const dy = e.pointerType === 'touch' ? 0 : e.clientY - drag.lastY
    drag.lastX = e.clientX
    drag.lastY = e.clientY
    drag.vx = dx * 0.006
    drag.vy = dy * 0.006
    applyDrag(drag.vx, drag.vy)
    drag.idle = 0
  }

  function onPointerUp(e) {
    if (e.pointerId !== drag.id) return
    drag.active = false
    canvas.releasePointerCapture?.(e.pointerId)
    canvas.classList.remove('is-dragging')
  }

  function applyDrag(yaw, pitch) {
    tmpQuat.setFromAxisAngle(AXIS_Y, yaw)
    dragQuat.premultiply(tmpQuat)
    spinBase.angle += pitch // vertical drag spins the helix about its own axis
  }

  function onKeyDown(e) {
    const step = 0.12
    if (e.key === 'ArrowLeft') drag.vx -= step
    else if (e.key === 'ArrowRight') drag.vx += step
    else if (e.key === 'ArrowUp') spinBase.angle -= step
    else if (e.key === 'ArrowDown') spinBase.angle += step
    else return
    drag.idle = 0
    e.preventDefault()
  }

  // ───────────────────────────── camera + scene phases
  const keyPos = new THREE.Vector3()
  const keyLook = new THREE.Vector3()
  const forward = new THREE.Vector3()
  const right = new THREE.Vector3()
  const up = new THREE.Vector3()
  const pullBack = new THREE.Vector3()
  const closest = new THREE.Vector3()
  const dnaCentre = new THREE.Vector3()
  const phase = { dna: 1, ant: 0, world: 0, earth: 0 }

  function curved(B, name, t) {
    const c = B.curve?.[name]
    if (!c) return smoother(t)
    return smoother(clamp((t - c[0]) / (c[1] - c[0])))
  }

  function sampleKeys(p) {
    const n = Math.min(stops.length, CAMERA_KEYS.length)
    if (n === 0 || p <= stops[0]) return { A: CAMERA_KEYS[0], B: CAMERA_KEYS[0], t: 0 }
    if (p >= stops[n - 1]) return { A: CAMERA_KEYS[n - 1], B: CAMERA_KEYS[n - 1], t: 0 }
    let i = 0
    while (i < n - 2 && p > stops[i + 1]) i++
    const span = Math.max(1e-5, stops[i + 1] - stops[i])
    return { A: CAMERA_KEYS[i], B: CAMERA_KEYS[i + 1], t: clamp((p - stops[i]) / span) }
  }

  function updateCamera(dt) {
    const portrait = aspect < 1
    const fit = aspect < 1.25 ? lerp(1, 2.1, clamp((1.25 - aspect) / 0.8)) : 1
    const { A, B, t } = sampleKeys(scrollP)

    phase.dna = lerp(A.dna, B.dna, curved(B, 'dna', t))
    phase.ant = lerp(A.ant, B.ant, curved(B, 'ant', t))
    phase.earth = lerp(A.earth ?? 0, B.earth ?? 0, curved(B, 'earth', t))
    phase.world = lerp(A.world, B.world, curved(B, 'world', t))

    // A "cut" hides the long flight between the two worlds: the screen is black, so jump.
    const pose = B.cut ? (t < 0.5 ? A : B) : null
    const tp = pose ? 0 : smoother(t)
    const P = pose ?? A
    const Q = pose ?? B
    keyPos.set(lerp(P.pos[0], Q.pos[0], tp), lerp(P.pos[1], Q.pos[1], tp), lerp(P.pos[2], Q.pos[2], tp))
    keyLook.set(lerp(P.look[0], Q.look[0], tp), lerp(P.look[1], Q.look[1], tp), lerp(P.look[2], Q.look[2], tp))
    const roll = lerp(P.roll, Q.roll, tp)
    const sa = portrait ? P.shiftPortrait : P.shift
    const sb = portrait ? Q.shiftPortrait : Q.shift
    const sx = lerp(sa[0], sb[0], tp)
    const sy = lerp(sa[1], sb[1], tp)

    // Portrait screens need to sit further back to fit the same subject.
    pullBack.copy(keyPos).sub(keyLook)
    keyPos.copy(keyLook).addScaledVector(pullBack, fit)

    // One-time arrival: start far back and settle onto the first view.
    const intro = 1 - easeOutCubic(clamp(introT))
    if (intro > 0) keyPos.addScaledVector(pullBack.normalize(), intro * 9)

    // Pointer parallax: a little sway sells the depth between the foreground and the subject.
    pointer.sx = lerp(pointer.sx, pointer.x, 1 - Math.exp(-dt * 2.5))
    pointer.sy = lerp(pointer.sy, pointer.y, 1 - Math.exp(-dt * 2.5))
    forward.copy(keyLook).sub(keyPos).normalize()
    right.crossVectors(forward, AXIS_Y).normalize()
    up.crossVectors(right, forward).normalize()
    const sway = 0.16 * Math.min(1, pullBack.length() * 0.2 + 0.35)
    keyPos.addScaledVector(right, pointer.sx * sway).addScaledVector(up, -pointer.sy * sway * 0.7)

    camera.position.copy(keyPos)
    camera.up.set(0, 1, 0)
    camera.lookAt(keyLook)
    camera.rotateZ(roll)
    camera.setViewOffset(width, height, -sx * width, sy * height, width, height)
  }

  /** Dims the helix, lights the ant, and recolours the room to match. */
  function applyPhase(time) {
    const w = phase.world
    scene.background.copy(BG_DNA).lerp(BG_ANT, w)
    scene.fog.color.copy(scene.background)
    scene.fog.density = lerp(0.034, 0.016, w) * (1 - 0.97 * phase.earth)
    bloom.strength = lerp(0.6, 0.32, w)
    bloom.threshold = lerp(0.2, 0.62, w)

    if (dnaInfo) {
      const d = phase.dna
      dnaInfo.setFade(d)
    }

    if (ant) {
      const k = phase.ant
      // A lamp warming up: a few uneven flickers on the way up, then steady.
      const flicker = k < 0.98 ? 1 - 0.4 * Math.max(0, Math.sin(k * 61) * Math.sin(k * 29)) * (1 - k) : 1
      const L = k * flicker
      ant.group.visible = k > 0.002
      ant.spot.intensity = L * 7.5
      ant.hemi.intensity = L * 0.35
      ant.materials.forEach((m) => {
        m.envMapIntensity = L * m.userData.envBase
        if (m.userData.emissiveBase !== undefined) m.emissiveIntensity = L * m.userData.emissiveBase
      })
    }
  }

  // ───────────────────────────── scale bar
  let lastBarPx = -1
  let lastLabel = ''
  let lastOpacity = -1
  function updateScale() {
    if (!dnaInfo) return
    dnaCentre.set(0, 0, 0)
    const cx = clamp(camera.position.x, -HELIX_LENGTH / 2, HELIX_LENGTH / 2)
    closest.set(cx, 0, 0)
    const depth = Math.max(dnaInfo.radius, camera.position.distanceTo(closest))
    const worldPerPx = (2 * depth * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / height
    const nmPerWorld = HELIX_NM_DIAMETER / (dnaInfo.radius * 2)
    const nmPerPx = worldPerPx * nmPerWorld
    const targetNm = nmPerPx * Math.min(150, Math.max(90, width * 0.14))
    const nice = niceValue(targetNm)
    const px = Math.round(nice / nmPerPx)
    const label = formatLength(nice)
    const opacity = +(phase.dna * clamp(introT * 2)).toFixed(2)
    if (px !== lastBarPx || label !== lastLabel || opacity !== lastOpacity) {
      lastBarPx = px
      lastLabel = label
      lastOpacity = opacity
      onScale?.({ px, label, opacity })
    }
  }

  // ───────────────────────────── frame loop
  const clock = new THREE.Clock()
  let raf = 0
  let lastP = 0

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = Math.min(clock.getDelta(), 0.05)
    const time = clock.elapsedTime
    if (!dnaInfo) return

    if (started && introT < 1) introT = Math.min(1, introT + dt / 2.8)

    scrollP += (scrollTarget - scrollP) * (1 - Math.exp(-dt * (reduceMotion ? 12 : 4.5)))
    const dp = scrollP - lastP
    lastP = scrollP

    if (!drag.active) {
      applyDrag(drag.vx, 0)
      drag.vx *= Math.exp(-dt * 3.2)
      drag.idle += dt
      if (drag.idle > 2.2) dragQuat.slerp(tmpQuat.identity(), 1 - Math.exp(-dt * 0.9))
    }

    const idleSpin = reduceMotion ? 0.02 : 0.16 + (1 - easeOutCubic(clamp(introT))) * 1.4
    spinBase.angle += idleSpin * dt + dp * 9
    spinQuat.setFromAxisAngle(AXIS_X, spinBase.angle)
    dnaInfo.rig.quaternion.copy(dragQuat).multiply(spinQuat)
    dnaInfo.tick(performance.now() / 1000)
    if (earthInfo) {
      earthInfo.sun.intensity = 1.5 * phase.earth
      earth?.update(dt, phase.earth)
    }
    if (ant) ant.group.visible = phase.ant > 0.003

    updateCamera(dt)
    applyPhase(time)

    if (ant && ant.group.visible) {
      ant.rig.quaternion.copy(dragQuat) // dragging turns the ant too
      const step = reduceMotion ? 0 : dt
      ant.antMixer.update(step)
      ant.leafMixers.forEach((m) => m.update(step))
    }

    updateScale()
    composer.render()
  }

  // ───────────────────────────── ant, ground, leaves (loaded after the helix is on screen)
  const loader = new GLTFLoader()
  const load = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej))


  /** The Sketchfab planet (earth.glb): scaled to a 30-unit radius, parked at EARTH_ORIGIN, faded by `amount`. */
  function buildEarth(gltf) {
    const model = gltf.scene
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    model.position.sub(box.getCenter(new THREE.Vector3()))
    const group = new THREE.Group()
    group.add(model)
    group.scale.setScalar(60 / Math.max(size.x, size.y, size.z)) // radius 30
    group.position.set(...EARTH_ORIGIN)
    group.rotation.set(0.35, 0, -0.2) // axial tilt; tweak if the poles face the camera
    group.visible = false
    const mats = new Set()
    model.traverse((o) => {
      if (!o.material) return
      ;[].concat(o.material).forEach((m) => {
        m._o = m.opacity
        m._t = m.transparent
        m._e = m.emissiveIntensity ?? 1
        mats.add(m)
      })
    })
    const mixer = gltf.animations.length ? new THREE.AnimationMixer(model) : null
    gltf.animations.forEach((c) => mixer.clipAction(c).play())
    scene.add(group)
    earth = {
      group,
      update(dt, d) {
        group.visible = d > 0.003
        if (!group.visible) return
        if (mixer) mixer.update(reduceMotion ? 0 : dt)
        else model.rotation.y += reduceMotion ? 0 : dt * 0.03
        mats.forEach((m) => {
          m.transparent = m._t || d < 0.999
          m.opacity = m._o * d
          if ('emissiveIntensity' in m) m.emissiveIntensity = m._e * d
        })
      },
    }
  }

  async function buildAnt(antGltf, leafGltf) {
    const group = new THREE.Group()
    group.position.set(...ANT_ORIGIN)
    group.visible = false
    scene.add(group)

    const materials = []
    const track = (m, envBase, emissiveBase) => {
      m.envMap = envTexture
      m.userData.envBase = envBase
      if (emissiveBase !== undefined) m.userData.emissiveBase = emissiveBase
      materials.push(m)
    }

    // the ant: normalised so its length is ANT_LENGTH, centred on the group origin
    const s = ANT_LENGTH / ANT_SOURCE.length
    const rig = new THREE.Group()
    rig.scale.setScalar(s)
    const inner = new THREE.Group()
    inner.position.set(-ANT_SOURCE.centre[0], 0, -ANT_SOURCE.centre[2])
    inner.add(antGltf.scene)
    rig.add(inner)
    group.add(rig)
    antGltf.scene.traverse((o) => {
      if (!o.isMesh) return
      o.frustumCulled = false
      o.castShadow = true
      o.receiveShadow = true
      track(o.material, 0.9, o.material.emissiveIntensity * 0.55)
    })
    const antMixer = new THREE.AnimationMixer(antGltf.scene)
    const action = antMixer.clipAction(antGltf.animations[0])
    action.time = 4 // start inside the walking section of the clip
    action.play()

    // soil under the lamp
    const soil = makeSoilTexture()
    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(70, 64),
      new THREE.MeshStandardMaterial({ map: soil, bumpMap: soil, bumpScale: 2.2, roughness: 0.95, metalness: 0, color: 0xffffff }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.02
    ground.receiveShadow = true
    track(ground.material, 0.2)
    group.add(ground)

    // the lamp
    const spot = new THREE.SpotLight(0xffe2b8, 0, 0, 0.5, 1, 0)
    spot.position.set(0.8, 13, 1.2)
    spot.target.position.set(0, 0, 0)
    spot.castShadow = true
    spot.shadow.mapSize.set(2048, 2048)
    spot.shadow.bias = -0.0004
    spot.shadow.normalBias = 0.02
    spot.shadow.camera.near = 4
    spot.shadow.camera.far = 30
    const hemi = new THREE.HemisphereLight(0xffcf9a, 0x120c08, 0)
    group.add(spot, spot.target, hemi)

    // falling leaves: the user's animated file, cloned so the fall covers the whole frame
    const diffuse = await leafGltf.parser.getDependency('texture', 0)
    diffuse.colorSpace = THREE.SRGBColorSpace
    diffuse.flipY = false
    diffuse.anisotropy = 4
    const leafMixers = []
    const placements = [
      { x: 0, z: 0, ry: 0, t: 0 },
      { x: 2.4, z: -2.6, ry: 1.9, t: 3.3 },
      { x: -2.6, z: 2.2, ry: 4.1, t: 6.7 },
    ]
    placements.forEach((p) => {
      const leaves = cloneSkinned(leafGltf.scene)
      leaves.scale.setScalar(LEAF_SCALE)
      leaves.position.set(p.x - 0.1 * LEAF_SCALE, 0, p.z)
      leaves.rotation.y = p.ry
      leaves.traverse((o) => {
        if (!o.isMesh) return
        o.frustumCulled = false
        o.castShadow = true
        const m = o.material.clone() // the file uses spec-gloss, which three.js no longer reads
        m.map = diffuse
        m.alphaTest = 0.5
        m.side = THREE.DoubleSide
        m.roughness = 0.65
        m.metalness = 0
        m.emissive = new THREE.Color(0xff7a2a)
        m.emissiveMap = diffuse
        m.needsUpdate = true
        o.material = m
        track(m, 0.7, 0.18)
      })
      group.add(leaves)
      const mixer = new THREE.AnimationMixer(leaves)
      const a = mixer.clipAction(leafGltf.animations[0])
      a.time = p.t
      a.play()
      leafMixers.push(mixer)
    })

    ant = { group, rig, antMixer, leafMixers, materials, spot, hemi }
    renderer.compile(scene, camera)
  }

  // ───────────────────────────── boot
  Promise.resolve().then(() => {
      if (disposed) return
      try {
        const world = createWorld()
        dnaInfo = buildExplorerRig(world)
        const sun = new THREE.DirectionalLight(0xfff1dd, 0)
        sun.position.set(90, EARTH_ORIGIN[1] + 110, 130)
        sun.target.position.set(...EARTH_ORIGIN)
        scene.add(sun, sun.target)
        earthInfo = { sun }
        scene.add(dnaInfo.rig)
        measureStops()
        onScroll()
        scrollP = scrollTarget
        lastP = scrollP
        renderer.compile(scene, camera)
        composer.render()
        started = true
        onReady?.()
        // The ant and leaves arrive in the background; the story is long enough that they are
        // ready well before anyone scrolls to the blackout.
        load(modelUrls.earth).then((g) => !disposed && buildEarth(g)).catch((err) => console.error('earth failed to load', err))
        Promise.all([load(modelUrls.ant), load(modelUrls.leaves)])
          .then(([a, l]) => !disposed && buildAnt(a, l))
          .catch((err) => console.error('ant / leaves failed to load', err))
      } catch (err) {
        console.error(err)
        onError?.(err)
      }
  })


  // click a glowing structure to open its record (ignored if the pointer was dragged)
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2()
  let down = null
  const onDown = (e) => (down = [e.clientX, e.clientY])
  const onClick = (e) => {
    if (!dnaInfo || phase.dna < 0.5 || !down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return
    const r = canvas.getBoundingClientRect()
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    ray.setFromCamera(ndc, camera)
    const hit = ray.intersectObjects(dnaInfo.items.map((i) => i.group), true)[0]
    let o = hit?.object
    while (o && !o.userData.kind) o = o.parent
    if (o) onInspect?.(o.userData.kind)
  }
  canvas.addEventListener('pointerdown', onDown)
  canvas.addEventListener('click', onClick)
  window.addEventListener('resize', resize)
  window.addEventListener('scroll', onScroll, { passive: true })
  canvas.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('pointercancel', onPointerUp)
  canvas.addEventListener('keydown', onKeyDown)
  resize()
  frame()

  return {
    dispose() {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', onScroll)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('click', onClick)
      canvas.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('keydown', onKeyDown)
      scene.traverse((o) => {
        if (o.isMesh) o.geometry?.dispose()
      })
      dnaInfo?.helixMaterial.dispose()
      ant?.materials.forEach((m) => m.dispose())
      envTexture.dispose()
      pmrem.dispose()
      composer.dispose()
      renderer.dispose()
    },
  }
}
