# Audio mechanic — first iteration

This is an IDEA9103 student project. Audio design and choice of a single existing 2D fish as the visual focus came from the student; ChatGPT/Codex assisted with editing the supplied recording, code, comments, this documentation, and local checks. The team-owned fish movement, drawing, water ripple response, lily interaction, and particles remain in their original scripts.

## Files and controls

- `audio-mechanic.js`: five grouped sections for settings, preload, setup, Play/Pause, seasonal seeking, and level mapping. The audio button is the only playback control; the old pond-click call is ignored inside this file.
- `time-mechanic.js`: seasonal timer, four season buttons, and flower/leaf transition. It reads `state.audioPlaying` and `state.audioTime` from the audio script.
- `index.html`: adds the audio button and loads p5.sound after p5.js. `sketch.js`, `perlin-water-life.js`, `perlin-lilies.js`, and `input-controls.js` are unchanged from the team baseline.
- `assets/pond-loop.wav`: the student-provided edited recording. Open `index.html` through a local HTTP server such as VS Code Live Server, then press **Play music**. There is no autoplay.

## How the fish responds

`p5.Amplitude.getLevel()` measures the song's overall level, **not** its pitch or emotional mood. The script maps approximately 0.005–0.18 to 0–1, constrains that range, and eases it with `lerp(..., 0.12)`. It stores the fish's randomly assigned base `speed` and `size` once and computes from those bases on every frame, so the values never compound. The mapped speed reaches at most 6× its base and size reaches at most 2.2×. Pausing makes the response ease back toward the bases. A water ripple can still add the teammate's separate short speed boost.

All fish scaling happens in `audio-mechanic.js`. The existing Perlin script reads `pondFish.speed` and `pondFish.size` as before; its original 0–1 `audioLevel` connector stays at zero to prevent a second boost. The audio script does not alter the fish's direction, path rules, drawing functions, or ripple behavior.

## How music and seasons stay together

The 100-second recording uses approximate seasonal passages: Spring 0–28 s, Summer 28–57 s, Autumn 57–80 s, Winter 80–100 s. These are presentation timing choices, not detected musical beats. Music playback drives the season only while Auto is On. When music is paused, Auto On continues the original 600-frame seasonal cycle; Play maps the current season and its progress back to the matching recording passage. Auto Off freezes the visual season and keeps music within that season's passage. Pressing a season button moves both the image and music to its passage start, and starts music if paused. A manual change applies flower/leaf values immediately; natural changes use `lerp(..., 0.035)`.

`audio-mechanic.js` defines `seekAudioTo(seconds)` and supplies the sound state. `time-mechanic.js` calls that function on season button clicks. The short seek guard avoids reading the old playback position just after `jump()`.

## Course methods and outside sources

Week 10 Tutorial Part 1 introduces `loadSound`, `p5.Amplitude`, `getLevel`, and the idea of sound controlling a visual parameter. Ordinary functions, conditions, HTML buttons, `map`, `constrain`, and `lerp` are from the course/p5.js techniques. The real pause and seeking behavior uses p5.sound's official `pause()`, `loop()`, `currentTime()`, and `jump()` methods as **supplements**; the tutorial's sample Play/Pause button uses `stop()` instead of a true pause. No FFT, Web Audio API, animation framework, or additional algorithm is used.

- [IDEA9103 assignment](https://canvas.sydney.edu.au/courses/74653/assignments/716000)
- [Week 10 tutorial](https://canvas.sydney.edu.au/courses/74653/pages/week-10-tutorial?module_item_id=3241914)
- [p5.SoundFile pause](https://p5js.org/reference/p5.SoundFile/pause/), [loop](https://p5js.org/reference/p5.SoundFile/loop/), [currentTime](https://v1.p5js.org/reference/p5.SoundFile/currentTime/), [jump](https://v1.p5js.org/reference/p5.SoundFile/jump/)

The included `p5.sound.min.js` came from the student's local classroom pilot; the team's existing p5.js and its license are unchanged. The audio was trimmed from the student's OBS recording, seconds 7.2–107.2, to 100 seconds, with approximately 0.35 s fade-in and 1.2 s fade-out. Gaps between the three musical passages remain. Source performance: Schumann, *Kinderszenen* Op. 15, Anna Vinnitskaya, SWR Classic / ARD Klassik ([source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY)). The recording is attributed for a non-commercial student assignment in a private team repository. Attribution does **not** grant redistribution permission; obtain permission or replace it with a licensed recording before public release.

## Manual check

Load the page through a local server. Confirm: no autoplay; button plays and pauses; loud passages enlarge and accelerate the fish, quiet ones ease back; pond clicks do not start music; water ripple and lily interactions still work; season buttons seek both picture and sound; Auto On advances without music and matches sound when resumed; Auto Off holds the season and repeats its passage; the 100-second song loops to spring. The 1–6× speed range describes the audio multiplier alone, before any ripple boost.
