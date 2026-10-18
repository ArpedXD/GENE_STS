# Continuity prompt (paste this into a new Claude chat, with the zip attached)

You are continuing a merge of two three.js scroll projects into one. Read this whole file, then work.

## Target experience (the user's words, organised)
1. START: the procedural DNA helix from the "explorer" project, with the big title text and the clickable
   stem-cell / structure buttons (INSPECT targets, reader modal, hover label).
2. THEN: the ANT scenes (top, three-quarter, side) with several detail zoom-ins, as in the "ant" project.
3. THEN: planet Earth, reached by scrolling, shown as a ZOOM OUT (the human/Earth chapters from the explorer).
4. The explorer's top navigation bar (chapter pills + right-hand dot rail + progress bar) must exist in the
   merged site. For the human chapter, only include it together with the Earth section (no separate person/body descent).
5. The ant project is the MAIN project (Vite + React + three, scroll-driven camera keys). Its dna.glb is REMOVED
   and replaced by the explorer's DNA, which is built in code (src/explorer/structures.js -> createWorld()).

## Layout of this folder
- Main (ant, Vite+React): index.html, src/main.jsx, App.jsx, App.css, index.css, src/content.js (STOPS),
  src/components/{DnaScene,DarkSequence}.jsx, src/scene/{dnaScene,cameraKeys}.js, public/assets/{ant,leaves}.glb
- Explorer (vanilla, reference/donor code): src/explorer/{content,scene,structures,script}.js, index.reference.html
- NOT PROVIDED by the user and needed: style.css (explorer) and heaven.png. Ask for them or rebuild the chapter/nav/reader CSS.
- dna.glb (11 MB) was deliberately NOT copied; do not reintroduce it.

## Key facts already found
- Explorer exports: structures.js -> HUMAN_ORIGIN(0,-40,0), EARTH_RADIUS 30, EARTH_CENTER, createWorld();
  scene.js -> createScene(canvas,{sky,skyImage,dive,onHover,onInspect,onProgress,reducedMotion});
  content.js -> SECTIONS (nav labels, chapter copy), INSPECT, INSPECT_ORDER.
  Explorer scroll model: progress = scrollY / (innerHeight*1.3); chapter nav = custom eased scrollTo in script.js (goToChapter).
- Ant: createDnaScene({canvas,modelUrls,getStops,onLoadProgress,onReady,onError,onScale}) in src/scene/dnaScene.js;
  rebuild(gltf) turns dna.glb into the helix; ANT_ORIGIN=(0,-60,0); camera poses live in cameraKeys.js (one per STOP, same order);
  cameraKeys fields: pos, look, roll, shift, world, dna, ant, curve, cut.
- Explorer imports use import maps ('three/addons/'); the Vite project must use 'three/examples/jsm/...'. Rewrite imports.
- Explorer files have CRLF line endings; normalise.
- Explorer DNA sits at the origin; ant at y=-60; explorer human/Earth at y=-40..-70. These overlap: move the Earth group to a new
  origin (e.g. y=-140) so the three worlds never share a frame, and fog/background per world.

## Suggested order of work
1. Make it build: npm i, fix imports, confirm ant scene still runs.
2. Replace the glb helix in dnaScene.js (delete rebuild/DNA load) with createWorld()'s helix + clickable structures; keep ant + leaves loading.
3. Port picking/hover/reader UI from script.js+scene.js into React components (Reader, HoverLabel, Toast).
4. New STOPS order: hero(+big title, stem-cell buttons) -> pairs -> length -> coil -> inside -> dark -> ant x3-4 (add detail zoom keys) -> earth zoom-out -> ending.
5. Add the nav bar (chapters, dot rail, progress) driven by STOPS; reuse goToChapter easing.
6. Earth zoom-out: camera starts near the Earth surface at the end of the ant chapter, pulls back to orbit (ORBIT_DISTANCE ~140).
7. Check mobile layout, reduced motion, focus styles.

## Status (updated again)
Written but NEVER RUN (no network/npm in the authoring sandbox; node --check passes on dnaScene/cameraKeys/content):
- Explorer helix + 15 clickable structures replace dna.glb (dnaScene.js buildExplorerRig, click picking -> onInspect).
- Reader.jsx, Nav.jsx (top bar, dot rail, progress), hero stem-cell chips, CSS in App.css.
- 14 stops <-> 14 camera keys: hero, pairs, length, coil, inside, dark, ant-top, ant-mid, ant-side, ant-head (zoom), ant-body (zoom),
  earth-near, earth-mid, ending (orbit). Earth lives at EARTH_ORIGIN (0,-200,0); phase.earth fades it (earth.update amount),
  fog thins, a sun light fades in; ant group hides when phase.ant ~ 0. ant->earth uses cut:true with ant [0,.4] / earth [.6,.95] curves.
TODO (in order): 1) npm i && npm run dev, fix import/runtime errors (explorer structures.js may need things from its old scene.js, e.g. lights/env).
2) Eyeball camera keys: ant-head/ant-body poses are GUESSED (head assumed toward -z); adjust. Earth-near pose too.
3) Delete dead rebuild()/buildDnaRig(); loader progress bar no longer tracks anything real.
4) Polish: reader on mobile, focus styles, reduced motion; stop-text colours over the bright Earth (add shade pool like .stop--center).
5) Optional: human/body chapter (world.human) was intentionally dropped; spec says human only alongside Earth if wanted.
