# Water Lilies — Interactive Pond

## Audio mechanic (Jielun Huang) — second iteration (2026-11-01)

This is an IDEA9103 student project, shared only in our private team repository for non-commercial class use. This section covers the audio mechanic only; my teammates' sections below are unchanged. The first iteration (2026-10-27) is described in [Audio mechanic notes](docs/audio-mechanic.md) and in the Git history.

**Run:** `loadSound()` cannot read audio from `file://`, so open the project through a local server, for example VS Code Live Server on `index.html`, or run `python3 -m http.server 8000` in the project folder and visit `http://localhost:8000`.

**Controls:**

- Press **Play music / Pause music** to play or pause the 100-second looping soundtrack. Music never autoplays and the microphone is not used. Clicking the water does not start the music.
- The four season buttons jump both the picture and the music to that season. With Auto On, seasons follow the song at 0, 28, 57 and 80 seconds while it plays; while paused, the original 600-frame cycle continues and Play resumes at the current season and its progress. With Auto Off, the season stays fixed and the music repeats that season's passage.

**What the audio does:**

- **Fish:** in spring, summer and autumn, the music's level (overall loudness, measured with `p5.Amplitude.getLevel()`) makes the existing 2D fish swim 1–6 times its base speed. Its size stays constant, and in winter the fish returns to its original speed.
- **Moving warm light (new in this iteration):** while music plays, an area of reflected light drifts slowly between 20% and 80% of the pond's width. Louder music makes nearby horizontal brush marks wider, brighter and warmer yellow, and makes them shimmer up and down; quieter music or pausing lets them settle back. Only my teammate's existing water marks change; no new objects are added and the user-input ripples are not altered.

**Code structure (`audio-mechanic.js`):**

| Function | Role |
| --- | --- |
| `preloadAudioMechanic()` | Loads `assets/pond-loop.wav`; called from the single `preload()` in `sketch.js` |
| `setupAudioMechanic()` | Connects `p5.Amplitude` to the song, wires the button, stores the original values of every fourth fine brush mark |
| `handleAudioPressed()` / `seekAudioTo()` | Play, pause, and jump to a season's passage |
| `keepSongInFrozenSeason()` | Loops the current season's passage when Auto is Off |
| `updateFishFromLevel()` | Maps a level of 0.005–0.18 to 0–1, smooths it with `lerp(…, 0.12)`, then scales the fish's stored speed |
| `updateWaterLightFromLevel()` | Maps a level of 0.02–0.09 to the light's strength; a slower `lerp(…, 0.05)` drives the vertical shimmer so it does not jitter |

Every response is calculated from stored base values and bounded with `map()`, `constrain()` and `lerp()`, so nothing builds up frame by frame. Values shared with teammates' files (600 frames per season, winter index 3, the first 550 broad colour patches) are named at the top of the file with a note on where they come from. The season starts at 0, 28, 57 and 80 seconds were chosen by ear at quiet gaps, not detected automatically; `getLevel()` measures loudness, not pitch or mood.

**Sources and AI assistance:**

- Week 10 Tutorial Part 1 covers `loadSound`, `p5.Amplitude`, `setInput`, `getLevel`, `isPlaying` and `loop`; `map`, `constrain` and `lerp` are course p5.js techniques. [`pause()`](https://p5js.org/reference/p5.SoundFile/pause/), [`jump()`](https://p5js.org/reference/p5.SoundFile/jump/) and [`currentTime()`](https://v1.p5js.org/reference/p5.SoundFile/currentTime/) are official p5.sound methods used as supplements (the tutorial's example uses `stop()`).
- Music: Robert Schumann, *Kinderszenen*, Op. 15, performed by Anna Vinnitskaya, SWR Classic / ARD Klassik ([source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY)). I trimmed my OBS recording from about 7.2 to 107.2 seconds and added short fades. **Attribution and non-commercial use do not grant redistribution rights.** The repository stays private; public release needs permission or a clearly licensed replacement recording.
- The audio design is my own. ChatGPT/Codex helped edit the recording, write the playback and mapping code and comments, tune the warm-light response and run local checks. Claude helped move loading into `sketch.js`, split the update into the helper functions above, name the shared values, and write this section. The matching places in the code are marked with comments.

## Perlin noise and randomness — Zheming Yu

I developed the Perlin noise and randomness mechanic in `perlin-lilies.js` and `perlin-water-life.js`. Inspired by the layered colours and reflections in Monet's *Water Lilies*, I used simple translucent shapes to suggest a pond that is calm but never completely still. The exact artwork reference should be confirmed by the team.

### Development updates

- **15 October — first prototype:** Created the initial water and lily scene. Random values set the lily positions, sizes and other details; noise gives each lily a slow, bounded drift. Water is made from saved translucent ellipse marks, with nearby colours related by two-dimensional noise. Normalised positions help the layout adapt to different window sizes.
- **23 October — interaction and fish:** Integrated the user-input mechanic with the lily movement. Added a fish with a random starting position, direction, size, colour and noise seed. Noise changes its heading smoothly; `sin()` and `cos()` turn the heading into movement. Each new ripple receives a random starting radius and expansion speed, and noise varies that speed. When a wavefront reaches the fish, it triggers one temporary turn and speed boost that gradually fade.
- **30 October — organisation and colour:** Simplified parts of the lily and fish code and added comments. The pond now selects one of four base palettes, then varies each RGB channel by up to 10 once at setup. Saving these colours and the water marks avoids changing them on every frame.
- **5 November — fish appearance:** Reworked the fish drawing with two tail lobes, fins, a shaded body, scale markings, a gill, an eye and a mouth. Its RGB body colour is chosen with `random()` at setup; fixed samples of `noise()` vary the scale brightness without flickering. The existing noise-driven swimming and ripple response are retained. The audio mechanic can change the fish's speed, but no longer changes its size.

### How my mechanic works

- **Lily layout:** `setupPerlinMechanic()` aims for 58–68 pads. It samples random positions, uses two-dimensional noise to vary the probability of placement, and checks distances to reduce overlap. A second pass tries to fill large gaps; the final count can be lower if no clear position is found.
- **Water:** `setupWaterMarks()` stores 550 broad patches and two layers of 1,600 smaller marks. `noise()`, a reflection band and `lerp()` mix the colours. `drawPondWater()` draws the stored marks each frame; the audio mechanic also adjusts some existing marks during playback.
- **Lily movement and drawing:** `updatePerlinMechanic()` maps slowly changing noise to a small offset around each pad's saved position, then combines it with the input mechanic's offset. `drawPerlinMechanic()` draws the pads; `drawLilyFlower()` draws the petals used by the input mechanic.
- **Fish and ripples:** `setupPondFish()` saves the fish's random starting properties. `updatePondFish()` uses noise for direction and steers near the edges. `respondFishToRipples()` compares the fish's position with each flattened wavefront and marks each ripple after it triggers a response. `drawPondFish()` uses ellipses, triangles and circles to draw the fish.
- **Team integration:** The input mechanic owns ripple creation and cleanup. The time mechanic supplies seasonal leaf and flower values. The audio mechanic adjusts the fish's speed; its drawing, direction and ripple response stay in my file. `sketch.js` calls the modules and controls their drawing order.

### How to experience it

Open the project through the local server described above. Refresh the page to generate a new palette, lily layout and fish colour. Watch the lilies drift and the fish swim; click an empty part of the water to create a ripple and watch for the fish's response when the wavefront reaches it. In summer, dragging a lily can also create ripples. Use **Play music** to hear the audio mechanic affect the fish's speed. The fish keeps its generated size while the music plays.

### Techniques, sources and AI acknowledgement

My implementation combines p5.js `random()`, one- and two-dimensional `noise()`, `map()`, `dist()`, `constrain()`, `lerp()`, `sin()`, `cos()`, basic drawing shapes and transforms. Week 8 tutorial examples W08-T-C01 and W08-T-C02 informed my use of random values, noise and arrays; I adapted those concepts to the pond rather than copying a complete example. See [the course-scope notes](docs/course-scope.md) and [the water and randomness notes](docs/painterly-water.md). The team should add the specific artwork citation once confirmed.

ChatGPT/Codex assisted with the initial project structure, Perlin and randomness prototype, later code organisation, palette and fish drawing changes, comments, documentation and local browser checks. The generated code saves random starting values, samples noise for continuous movement and colour variation, and combines the results with the team's existing interaction and audio interfaces. AI assistance is also marked in my source files; I am responsible for reviewing and explaining the implementation.

### Checks

Local checks covered loading the pond, fish movement, a ripple triggering the fish, audio playback and the winter button. A targeted check also confirmed that music can change fish speed while the generated fish size remains unchanged. These checks do not cover every interaction or screen size.

## User input mechanic — Edith Wu

I developed the User Input mechanic in `input-controls.js`. Mouse and keyboard actions make the pond respond differently in each season. `sketch.js` forwards the p5.js input events to my module, and `index.html` shows the controls. The other team mechanics remain in their own files.

**Controls:**

- **All seasons:** Hover near a lily for a soft highlight. Click open water to create a ripple. Press **B** to open all flowers, or **R** to reset User Input changes.
- **Spring and summer:** Click a flower to open it gradually; click again to close it. In summer, drag a lily pad to move it and create small ripples.
- **Autumn:** Hold the mouse near falling leaves to gather them. Release to leave a group of leaves on the pond. When the collected display fills up, the older group fades while new leaves appear.
- **Winter:** A short click on an ice floe leaves one visible crack on that floe. Hold and drag through snow to gather it, then release to scatter it and leave a soft trail. Dragging does not crack the ice, and clicking ice does not collect snow or create a ripple. A crack stays until **R** is pressed or the season changes.

**Code structure (`input-controls.js`):**

| Function | Role |
| --- | --- |
| `setupInputMechanic()` | Sets up the mouse state and saves the lilies' starting positions |
| `updateInputMechanic()` | Updates hover, flower opening, lily movement, ripples and fading marks each frame |
| `handleInputPressed()` / `handleInputReleased()` | Records a press and uses the distance moved to tell a click from a drag |
| `handleInputKey()` | Handles **B** and **R** across seasons |
| `addInputTrail()` | Uses one shared queue operation for collected leaves and snow marks |
| `drawInputMechanic()` / `drawInputIceCracks()` | Draws feedback; cracks are drawn after the time module's ice layer |

The mechanic stores mouse state in `inputHand` and uses arrays for leaves, snow marks and cracks. Each flower's `inputBloom` moves toward `inputTarget` by a fixed step so opening and closing are gradual. Simple distance and oval checks decide which object the mouse reaches. The leaf and snow queues fade an older group before a new group replaces it. Reusing `addInputTrail()` reduces repeated code without changing the behaviour.

**Techniques, sources and AI acknowledgement:**

My User Input code combines variables, objects, arrays, functions, `if` conditions, `for` loops, arithmetic, p5.js mouse and keyboard events, `dist()`, basic shapes, colour and drawing transforms. These are techniques from the Week 1–8 course materials. No online code snippets or external animation frameworks were added for this mechanic. The project-level artwork reference should identify the team's chosen Monet painting when confirmed.

ChatGPT/Codex helped draft and refine the User Input implementation, distinguish winter clicking from dragging, improve the fading handover, organise comments and the shared trail function, write this section and run local logic checks. The AI-assisted code saves input states, changes them in response to mouse or keyboard actions, and draws the resulting flower, water, leaf, snow and ice feedback. The assistance is also noted in `input-controls.js`.

**Checks:** Local logic checks covered persistent single cracks, click-versus-drag separation, open-water ripples, the leaf/snow fading handover, **R** and season resets, and the ice drawing order. These checks do not replace a final visual test in the browser.

## Early prototype notes (historical record)

The following notes describe the **first work-in-progress version**. They are retained as a record of the project's development. The current controls and mechanics are described in the sections above.

### Concept and first stage

Based on the team's water-lily project plan, the first prototype interpreted the calm surface of Monet's *Water Lilies* as a pond moving from calmness to audience disturbance, local response and recovery. That first stage only showed blue-green water, distributed lily pads and slow natural drift. It used basic geometric shapes rather than an imported painting image.

This was the first of four planned development iterations, not the final version. The assignment brief did not specify dates for all four iterations; the course schedule should be used for exact milestones.

### How the first prototype ran

The early version could be opened through `index.html` in a modern browser and used a local copy of p5.js, with no npm installation or CDN connection. The current audio-enabled project should instead use the local server described in the Audio mechanic section.

In that first version, viewers watched the lilies drift, resized the window without replacing the layout, and refreshed to generate a new distribution. Mouse and keyboard functions were placeholders; there were no fish, ripples or audio yet. **This paragraph is historical and does not describe the current build.**

### Original file plan

| File | Role in the first prototype | Status at that time |
| --- | --- | --- |
| `index.html` / `style.css` | Script loading and basic page styling | Completed |
| `sketch.js` | Single p5.js lifecycle, input and resize entry point; shared state and layer order | Framework completed |
| `perlin-lilies.js` | Zheming Yu: Perlin noise and randomness | First prototype, AI-assisted and subject to author review |
| `audio-mechanic.js` | Reserved audio interface | Empty at that time |
| `time-mechanic.js` | Reserved time/event interface | Empty at that time |
| `input-controls.js` | Reserved mouse/keyboard interface | Empty at that time |

Those three empty interfaces were placeholders, not completed contributions. Their owners later developed their actual mechanics in separate files.

### How the early code worked

1. `setup()` created the canvas, saved its dimensions and called each module's setup function.
2. `setupPerlinMechanic()` chose one of four palettes and aimed for 58–68 lily pads. It sampled positions, used two-dimensional noise to vary placement probability, checked distances to reduce overlap, and tried a few extra positions to fill gaps. Starting positions, sizes, colours, flower flags and noise offsets were stored in arrays.
3. `updatePerlinMechanic()` advanced `noiseTime` slightly per frame. `noise(seed + time)` produced continuous values; `map()` converted them to small offsets around saved starting positions.
4. `setupWaterMarks()` created 3,750 stored brush-mark objects: 550 broad colour patches and two layers of 1,600 fine marks. Random positions, two-dimensional noise, a reflection band and `lerp()` for the RGB channels made short water strokes and vertical reflections. The marks themselves stayed fixed; lilies drifted.
5. `drawPerlinMechanic()` looped over the lilies. `drawLily()` drew pads, shadows and notches; `drawLilyFlower()` made petals from rotated ellipses.
6. `windowResized()` updated dimensions without generating a new layout. Positions were saved as proportions, and sizes and movement were based on the shorter canvas side.

Early parameters included a target `lilyCount` of 58–68, `noiseSpeed = 0.003` and `driftAmount = 0.008`. `pondPalettes` held blue-purple, teal-green, pink-purple and warm-green palettes. A refreshed layout could randomly reuse the same palette. Frame-based movement could appear slower on a device with a low frame rate. The 15 October colour revision was documented in [water and randomness notes](docs/painterly-water.md).

### Original module guidance

The project framework called each module's `setup...Mechanic(state)`, `update...Mechanic(state)` and `draw...Mechanic(state)` functions. Separate files and clear variable prefixes were intended to make ownership and shared data easier to follow.

- Only `sketch.js` should define the shared p5.js `setup()`, `draw()`, `mousePressed()`, `keyPressed()` and `windowResized()` callbacks.
- Each module should wrap drawing changes in `push()` and `pop()` so colours and transforms do not leak into the next module.
- The input owner was expected to handle mouse and keyboard actions; the audio owner was expected to load a credited sound source and connect playback to a user click; the time owner could read `state.frame` as a frame count, not milliseconds.
- The shared `pond` object held `width`, `height`, `unit`, `frame` and `ripples`. The proposed ripple fields were `{x, y, radius, strength, age}`, with proportional positions, a radius relative to the short side, a 0–1 strength value and age in frames. The input module would create, update, limit and remove ripples; the other modules would read them.
- The plan was for `updatePerlinMechanic()` to be the only writer of final lily positions, combining the noise offset with the ripple response. At the first stage this shared response and the fish had not yet been implemented.

### Four-stage development plan

| Stage | Zheming Yu's planned work | Team work |
| --- | --- | --- |
| 1 | Basic noise/random pond, continuous drift and responsive layout | Main sketch and module interfaces |
| 2 | Refine distribution, colours and motion; explain noise sampling | Implement each member's mechanic and agree on shared data |
| 3 | Combine local ripple offsets with the base drift | Integrate propagation, response, decay and recovery |
| 4 | Refine visuals and performance; complete personal notes | Full demo, citations, resources, README and submission checks |

The brief requires at least three meaningful Git commits per team member beyond initial setup. Four planned stages alone do not establish that requirement. Contributions must be recorded in the real Git history, not reconstructed or invented.

### Course techniques and references in the first prototype

The [course-scope notes](docs/course-scope.md) list the techniques used in that early version. Its working checklist was based on the team's PDF summary of the course scope and classroom-code excerpts, which were not an official tutor-issued whitelist.

- Weeks 3–4: functions, arrays, objects, conditions and loops.
- Week 6: p5.js lifecycle, drawing and input callbacks.
- Week 8: random/noise, numerical mapping, proportional coordinates, transforms and window resizing.
- The W08-T-C01 and W08-T-C02 examples introduced random values, noise and arrays. The pond adapted these ideas rather than copying a whole tutorial example.

The local `libraries/p5.min.js` was recorded as p5.js **1.11.11** from a [pinned release](https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js), with its licence in `libraries/p5-LICENSE.txt`. The original course material did not specify that exact version. At the first stage no images, fonts or audio had been added. The team's specific Monet artwork citation still needed confirmation.

### AI acknowledgement in the first prototype

ChatGPT/Codex assisted with the original project structure, the first Perlin/randomness prototype, comments, documentation and browser checks. That early code saved random starting properties, sampled continuous noise for bounded lily movement and used proportional coordinates for resizing. The other three mechanics were empty hooks at that point. AI assistance was marked in the authored files.

### First-prototype checks

The first version was checked for page loading, continuous but bounded motion, stable lily count, preserved positions on small and wide windows, and an absence of JavaScript errors. At that time, clicking and pressing keys intentionally produced no feedback because the input interface was empty. These historical checks do not claim to validate the later four-mechanic integration.
