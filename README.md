# Water Lilies — Interactive Pond

## Audio mechanic – Jielun Huang (iteration 3)

The piano soundtrack drives my mechanic. Its loudness changes the fish's speed and a moving warm light on the water, and its frequency content makes lily pads in four regions of the pond grow and tilt. In this third iteration I also added summer rain and animal calls, plus short feedback sounds for water ripples and ice cracks. I chose Schumann's *Kinderszenen* because its lively early pieces and quieter ending suit the pond's move from spring and summer into winter. The moving warm light reinterprets the shifting reflections in Monet's *Water Lilies*, and the summer rain and animal calls make the pond feel like a living place rather than a silent picture. This is a non-commercial student project in our private team repository.

**Run:** `loadSound()` cannot read audio files from `file://`, so open the project through a local server, for example VS Code Live Server on `index.html`, or run `python3 -m http.server 8000` in the project folder and visit `http://localhost:8000`.

### Controls and response

I use **Play music / Pause music** for the piano. The existing season buttons and Auto control still work as described by the team. After the first page click enables browser audio, summer ambience requires both the summer season and piano playback. Rain and animal calls stop when I pause music or leave summer; clicking the pond without playing music does not start ambience. I set the rain gain to **0.21 (21%)**, which is 30% lower than the previous 0.3 gain, the softened ice-crack gain to **2 (200%)**, and the water-click gain to **1 (100%)**. These are file gain multipliers, not perceived loudness percentages.

I add occasional cicada or frog calls during playing summer frames: the first after 180 frames, then a random choice every 420–840 frames (about 7–14 seconds at 60 fps). The two animal clips do not overlap each other. Cicada gain is 0.22 and frog gain is 0.35, applied to files prepared at -23 LUFS. Pausing resets this simple frame counter. These calls suggest summer wildlife; they are not triggered by or attached to a drawn animal.

An actual new input ripple plays a short water plop outside winter; winter water ripples are silent while ice cracks keep their separate sound. I also stop an unfinished water plop on entering winter; a new ice crack plays the softened crack sound. A click that opens a flower or repeats a crack on the same ice floe does not create another sound. Summer dragging can generate ripples too; I limit their water sounds to one per 10 frames. The sound follows the existing input event arrays, without changing the input code.

I keep the existing piano level response for fish speed (up to 6x, original speed in winter) and the moving warm reflections. The teammate's current fish size stays unchanged. Rain and sound effects do not feed either music analyser.

### Frequency mapping and structure

All new runtime code is grouped in **audio-mechanic.js**. The team's existing preload, setup and update calls are sufficient; I did not edit sketch.js, time-mechanic.js, input-controls.js or the Perlin scripts.

- `preloadAudioMechanic()` loads piano, rain, water-click, ice-crack, cicada and frog assets through the single preload in sketch.js.
- `setupAudioMechanic()` connects the analysers, sets gains and binds browser audio unlocking to a real click.
- `setupAudioLeaves()` assigns each pad to a fixed quadrant using its original coordinates: top-left, top-right, bottom-right and bottom-left. Pads within the central 36% of both width and height do not receive a spectrum response; their original drift and input interactions remain. Dragging does not reassign a pad.
- `updateAudioLeaves(state)` analyses 256 FFT values and averages four non-overlapping ranges: top-left bins 1–7 (140–255 mapped to 0–1), top-right 8–15 (100–235), bottom-right 16–31 (50–185), and bottom-left 32–63 (6–85). These unequal ranges and thresholds are visual tuning choices for this piano, not universal pitch/mood or beat detectors. At 44.1 kHz, one bin is about 86 Hz. I exclude bin 0 and leave the quiet upper spectrum unassigned. The strongest mapped region gets full response; other regions retain 20% of their own response, except bottom-left, which retains 45% to make this recording's quieter upper frequencies more visible. This deliberate emphasis makes regional differences clearer. Equal targets favour the first region, and the music determines which area leads rather than a timed sequence. Smoothing is 0.32, softened to 0.22 in summer.
- Each region's response directly controls pad size (1–1.7 times its saved size) and tilt (0–28 degrees). In summer, I reduce these audio limits to 1–1.35 times and 0–16 degrees because the seasonal pads are already larger. Opposite regions tilt in the same fixed direction. There is no independent sine clock or accumulating growth. Quiet music and pausing restore the saved values. The seasonal scale still applies and the teammate's renderer draws the pads.
- On a rising response crossing 0.65, each affected pad has a 20% chance of calling the team's `addInputRipple()`, only in spring or summer. A global 45-frame gap limits the effect to at most one ripple per interval. The ordinary ripple cap, movement and interaction with the fish stay in the team input/Perlin code. The new ripple receives the same water-click sound through `updateAudioEnvironment()`. Held strong notes cannot repeatedly fire without the response falling and rising again. Autumn and winter do not produce music-triggered ripples.
- `updateAudioEnvironment(state)` reads the current visual season and the last ripple/crack object. Comparing object identity detects fresh events even at the input module's capped ripple count. Playback never creates input events, so there is no feedback loop.

### Course and official sources

I use the [Week 10 tutorial](https://canvas.sydney.edu.au/courses/74653/pages/week-10-tutorial?module_item_id=3241914): Part 1 for loadSound, p5.Amplitude, setInput and getLevel; Part 2 for setVolume, which sets each file's gain; and Parts 3 and 5 for p5.FFT, analyze() and frequency energy mapped to 2D values. Arrays, ordinary functions, loops, conditions, map, constrain, lerp, sin, angles and frames are course techniques already used by the project. I do not use another framework, native Web Audio analysis or a new algorithm library.

Official p5 supplements that the tutorial does not show are explicitly identified in code: [FFT.setInput](https://v1.p5js.org/reference/p5.FFT/setInput/) isolates the piano (the tutorial uses setInput only on Amplitude), and [userStartAudio](https://p5js.org/reference/p5/userStartAudio/) unlocks audio after user interaction. The tutorial's play/pause button calls stop(); my existing [pause](https://p5js.org/reference/p5.SoundFile/pause/), [jump](https://p5js.org/reference/p5.SoundFile/jump/) and [currentTime](https://v1.p5js.org/reference/p5.SoundFile/currentTime/) retain true pause and seasonal seeking. Basic DOM click binding uses [addEventListener](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener); I treat this as a browser supplement, not a claimed Week 10 example.

### Audio assets and AI assistance

- Rain: **Rain, Heavy, Falling on Leaves**, CHallSmith, [Freesound 870824](https://freesound.org/people/CHallSmith/sounds/870824/), CC0. I use seconds 10–50 of the public HQ MP3 preview, exported to WAV with a 70 Hz high-pass, -18 LUFS loudness target, and 0.2/0.5-second edge fades, then encoded to AAC (`summer-heavy-rain.m4a`, 128 kbps) to reduce loading. This excerpt is not verified as a seamless loop.
- Water: **Water.wav**, danielpodlovics, [Freesound 530359](https://freesound.org/people/danielpodlovics/sounds/530359/), CC0. The file is the public HQ MP3 preview.
- Ice: **Ice Crack 1**, j_p_higgins, [Freesound 262635](https://freesound.org/people/j_p_higgins/sounds/262635/), CC0. The public HQ MP3 preview was exported to WAV with a 2.2 kHz low-pass, 0.6 gain and short fades. The runtime gain of 2 is applied to this softened file.
- Cicada: **Cicada**, TannerMetro, [Freesound 825960](https://freesound.org/people/TannerMetro/sounds/825960/), CC0. I use seconds 1–5 of the public HQ MP3 preview, exported to WAV with a 200 Hz high-pass, 6.5 kHz low-pass, -23 LUFS target and 0.35/0.5-second edge fades.
- Frog: **Small Frog Croaks**, clif_creates, [Freesound 802737](https://freesound.org/people/clif_creates/sounds/802737/), CC0. I use the public HQ MP3 preview exported to WAV with an 80 Hz high-pass, -23 LUFS target and short edge fades.
- Piano: Robert Schumann, Kinderszenen Op. 15, Anna Vinnitskaya, SWR Classic / ARD Klassik, [source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY). The previous 100-second OBS edit remains, now encoded to AAC (`pond-loop.m4a`, 192 kbps) with macOS afconvert to cut the file from about 17.6 MB to 2.4 MB. Attribution and non-commercial use do not grant redistribution rights; public release needs permission or an appropriately licensed replacement recording.

I chose the sound gains, the combined leaf-growth and direct-tilt response, the clearer four-region layout and occasional spring/summer ripples. ChatGPT/Codex helped find sources, process sound files, write parts of the code and comments, adapt the earlier frequency mapping, and check integration. Claude helped split the earlier update into helper functions, move loading into sketch.js, tidy this iteration's comments and README wording, and encode the piano and rain files to AAC. I am responsible for reviewing and explaining the final work.

### Manual checks

Run a local server on index.html. Play/pause the piano and compare different passages: leaves should grow and tilt as their assigned frequency energy rises, shrink and return as it falls, and settle to their saved size and angle when paused. A sustained note should not cause continuous growth or a fixed-period swing. Compare all four corners and the quiet centre; the leading quadrant should respond more strongly than the others. Watch occasional rising strong responses make the same ripple and plop as a mouse click in spring/summer, with no such automatic ripples in autumn/winter. Try all seasons and Auto; ambience should stay silent before Play, play only in summer with the piano, and stop on Pause or a season change. Wait through several intervals to hear occasional animal calls. Click empty water, then a flower; only an actual new ripple should plop. In winter click open water to verify a visual ripple without a water sound; click uncracked ice twice: only the first new crack should sound. Drag a summer pad and confirm sounds remain spaced. Check the 40-second rain loop by ear and review the mix on the presentation speakers. Automated checks cannot judge the musical balance or loop quality.

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
