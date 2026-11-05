# Water Lily Pond

IDEA9103 Creative Coding major project. A two-dimensional pond, reinterpreted from Claude Monet's *Water Lilies*, moves through spring, summer, autumn and winter. Four mechanics, each in its own script, drive the piece: time, audio, Perlin noise and randomness, and user input.

## How to run

`loadSound()` cannot read files from `file://`, so open the project through a local HTTP server, for example VS Code **Live Server** on `index.html`, or:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`. Everything (p5.js 1.11.11, p5.sound 1.0.1, the audio file) is included in the repository; no internet connection or npm install is needed.

## Interaction instructions

- **Play music / Pause music** starts or pauses the soundtrack. Music never autoplays and the microphone is not used. While music plays, watch the fish and the warm reflection drifting across the water.
- **Spring / Summer / Autumn / Winter** jump both the picture and the music to that season.
- **Auto: On / Off**. With Auto On, the seasons follow the music while it plays, and a 600-frame timer while it is paused. With Auto Off, the season stays fixed and the music repeats that season's passage.
- **Spring:** click a lily with a flower to open or close it.
- **Summer:** press and drag a lily pad to move it.
- **Autumn:** hold the mouse near falling leaves to gather them, then release to leave a cluster.
- **Winter:** hold and drag through the snow to gather it and leave a short trail.
- **Click open water** in any season to make a ripple; nearby lilies and the fish react.
- **B** opens all flowers. **R** closes flowers and resets your changes.

## Inspiration

Claude Monet's *Water Lilies* series inspired the layered pond rather than a copy of one canvas: floating lily pads, short horizontal reflection strokes and changing light on still water. We added the passing of the seasons so the pond follows a calm → disturbed → recovering rhythm, with each mechanic adding one way the pond can change. The soundtrack, Schumann's *Kinderszenen*, was chosen because its lively opening pieces and quieter ending suit spring and summer moving into winter.

## Techniques

- **Modular structure.** `sketch.js` holds the only p5 lifecycle functions (`preload`, `setup`, `draw`, mouse/key events, `windowResized`). Each mechanic exposes `setup…Mechanic(state)`, `update…Mechanic(state)` and `draw…Mechanic(state)` and receives the shared `pond` object.
- **Normalized coordinates.** Positions are stored as 0–1 fractions of the canvas and sizes as fractions of the shorter side, so `windowResized()` only resizes the canvas and nothing is regenerated.
- **Painterly water.** About 3,750 semi-transparent ellipses (550 broad patches and two layers of fine strokes) placed with `random()` and coloured with 2D `noise()` and `lerp()`.
- **Bounded, eased responses.** Every reactive value is calculated from a stored base value with `map()`, `constrain()` and `lerp()`, so nothing grows frame by frame.
- **Audio analysis.** `p5.Amplitude.getLevel()` measures the song's overall loudness each frame (Week 10).
- **Time.** Frame counters and the song's playhead (`currentTime()`) decide the season; leaf and flower size and colour ease between seasonal targets.
- **Input.** `mousePressed`, `mouseReleased`, `keyPressed` and `dist()` drive the seasonal interactions and ripples.

## Mechanic ownership

| Mechanic | Owner (Git author) | Script(s) | What it does |
| --- | --- | --- | --- |
| Audio | Jielun Huang (`jielun-Huang`) | `audio-mechanic.js` | Plays the soundtrack with true pause and seasonal seeking. The music level makes the fish swim up to 6× faster and 2.2× larger in spring to autumn, and moves a warm reflection across the pond that brightens, widens and shimmers with louder music. |
| Time-based | `SHiN666666` | `time-mechanic.js` | Season timer, season buttons and Auto switch; eases lily and flower size and colour between seasons; falling petals, leaves and snow. Follows the music's playhead while it plays. |
| Perlin noise and randomness | Zheming Yu (`874593718`) | `perlin-lilies.js`, `perlin-water-life.js` | Random palette, lily layout and painterly water; noise-driven lily drift; a fish with noise-steered movement; ripples with random size and noise-varied speed, and the fish's random turning response. |
| User input | `EdithWu79` | `input-controls.js` | Seasonal mouse interactions (bloom, drag, gather leaves, gather snow), water ripples, hover response and the B/R keys. |

`index.html` loads the libraries and scripts and holds the buttons; `sketch.js` connects the mechanics and sets the drawing order.

### Audio mechanic in detail

`audio-mechanic.js` is split into small functions:

- `preloadAudioMechanic()` loads `assets/pond-loop.wav`. It is called from the single `preload()` in `sketch.js`.
- `setupAudioMechanic()` connects a `p5.Amplitude` analyser to the song, wires the Play button, and stores the original values of every fourth fine water stroke.
- `handleAudioPressed()` and `seekAudioTo()` play, pause and jump the song.
- `keepSongInFrozenSeason()` loops the current season's passage when Auto is Off.
- `updateFishFromLevel()` maps a level of 0.005–0.18 to a 0–1 response, eases it with `lerp(…, 0.12)`, and scales the fish's stored base speed (1–6×) and size (1–2.2×). In winter the fish keeps its base values.
- `updateWaterLightFromLevel()` moves a light position slowly between 20% and 80% of the width while music plays. Strokes near it become wider, brighter and warmer as the level (mapped from 0.02–0.09) rises. A second, slower `lerp(…, 0.05)` drives a vertical shimmer so quick spikes do not make it jitter.

The song is about 100 seconds long. The seasons start at 0, 28, 57 and 80 seconds; these were chosen by ear at quiet gaps, not detected automatically. `getLevel()` measures loudness, not pitch or mood.

## AI acknowledgement

All four team members used ChatGPT/Codex, and Claude helped with the final refactor and this README. Each source file marks AI-assisted sections in its comments.

- **Audio (Jielun Huang):** ChatGPT/Codex helped trim and fade the recording, draft the playback, seeking and level-mapping code and comments, and tune the water-light mapping. Claude helped move loading into `sketch.js`, split `updateAudioMechanic()` into helper functions, name the shared constants, and restructure this README. The generated code reads the song level each frame and maps it, within fixed limits, to the fish's speed and size and to the brightness, width, colour and position of existing water strokes, always starting from stored base values.
- **Time, Perlin and User input:** see the header comments in each script, which describe what the AI helped with and how the code works.

## External references

- [IDEA9103 Week 10 Tutorial](https://canvas.sydney.edu.au/courses/74653/pages/week-10-tutorial?module_item_id=3241914): `loadSound`, `p5.Amplitude`, `setInput`, `getLevel`, `isPlaying`, `loop`.
- p5.sound methods used beyond the tutorial (the tutorial's button uses `stop()`): [`pause()`](https://p5js.org/reference/p5.SoundFile/pause/), [`jump()`](https://p5js.org/reference/p5.SoundFile/jump/), [`currentTime()`](https://v1.p5js.org/reference/p5.SoundFile/currentTime/).
- p5.js reference: [`map()`](https://p5js.org/reference/p5/map/), [`constrain()`](https://p5js.org/reference/p5/constrain/), [`lerp()`](https://p5js.org/reference/p5/lerp/), [`noise()`](https://p5js.org/reference/p5/noise/).
- Libraries: p5.js 1.11.11 ([release file](https://cdn.jsdelivr.net/npm/p5@1.11.11/lib/p5.min.js), licence in `libraries/p5-LICENSE.txt`) and p5.sound 1.0.1.
- Artwork: Claude Monet, *Water Lilies* series.
- Music: Robert Schumann, *Kinderszenen*, Op. 15, performed by Anna Vinnitskaya, SWR Classic / ARD Klassik ([source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY)). It was trimmed from a screen recording to 100 seconds with short fades. This is a non-commercial student project in a private repository. Attribution does not grant redistribution rights, so the recording must be replaced with a licensed one before any public release.

More detail: [course scope](docs/course-scope.md), [painterly water](docs/painterly-water.md), [audio first iteration](docs/audio-mechanic.md), [user-input guide (zh)](Water-Lily-User-Input-v1/docs/user-input-guide-zh.md).
