# Water Lily Pond

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

## Time-based mechanic — Jingyi Shi

My time-based mechanic in `time-mechanic.js` shows the pond changing through the seasons. I wanted the lilies to grow, flower and fade, so the passing of time affects the subject of the work as well as its surroundings. This is a simplified artistic cycle, rather than a botanical simulation.

### Development updates

- Started with automatic season changes and gradual changes to lily size and colour.
- Added seasonal details: butterflies in spring, fireflies and rain in summer, mist in autumn, and ice and snow in winter.
- Added falling pink petals near the lilies in autumn to connect the seasonal effects more closely to the water-lily theme.

### How my mechanic works

- **Season clock:** with Auto On and music paused, a counter changes the season every 600 frames. During playback, the existing team integration follows the song's season boundaries at 0, 28, 57 and 80 seconds.
- **Lily appearance:** `seasonSettings` stores the target leaf size, flower size and leaf colour. `lerp()` gradually moves the current appearance towards these targets. Spring has smaller green pads and flowers; summer has larger pads and flowers; autumn brings brown-yellow leaves; winter leaves a few small pads without flowers.
- **Seasonal animation:** counters control butterfly visits and firefly flights. Autumn petals start near flowering lilies, drift onto the water and fade. Ice appears on entering winter, snow builds up, and both melt after winter ends.
- **Drawing:** `drawTimeMechanic()` draws the colour filter, weather and visiting insects. Two small functions draw the repeated petal and maple leaf shapes. Positions use canvas proportions, with many sizes based on the shorter canvas dimension.
- **Team integration:** my code reads the Perlin mechanic's lily positions without changing them. It retains `applyInputToParticle()` for the input teammate's gathering and release effects. The season buttons and music-seeking callbacks are shared controls; they are not solely my individual contribution.

### How to experience it

Run the project through the local server described above. Leave Auto On and watch a complete seasonal cycle. Without music, each season takes about 10 seconds at 60 fps; lower frame rates make it slower. Play the music to use the soundtrack-led cycle, or use the season buttons to preview a particular season. Auto Off holds the selected season while its animations continue. In autumn, look near the lilies for pink petals, distinct from the orange maple leaves.

### Techniques, sources and AI acknowledgement

I used the course techniques of objects and arrays (Week 3), conditions and loops (Week 4), basic p5 drawing (Week 6), transforms and trigonometric movement (Week 8), and easing and timed animation (Week 11). These techniques are combined for the pond rather than reproducing a complete tutorial example. No additional animation library or image asset was added for this mechanic.

I used ChatGPT to help write and revise parts of the seasonal animation code. It helped position petals near the lilies, adjust the shapes and coordinates of insects and ice, and tune animation timing. It also helped identify and fix bugs, such as seasonal timers not restarting and autumn petals being difficult to see, and assisted with code comments and this documentation. Integration checks used simulated drawing and audio, rather than a full browser test. AI assistance is acknowledged in the source file. I am responsible for reviewing and explaining the submitted code.

### Checks

Automated logic checks used the team scripts with mocked p5 drawing and audio. They covered season changes, drawing calls, insect visits, ice growth and melting, autumn petal movement and replay, input integration calls and portrait resizing. These checks do not replace final browser, sound and interaction testing.
