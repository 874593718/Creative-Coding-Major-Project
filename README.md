# Water Lily Pond

This is our IDEA9103 Creative Coding major project. We reinterpret the atmosphere of Monet's water lily paintings as a two-dimensional pond that moves through spring, summer, autumn, and winter. The project combines time, audio, Perlin noise and randomness, and user input in separate scripts.

This README describes my second audio iteration. The first audio iteration remains in Git history.

## Inspiration

Claude Monet's *Water Lilies* paintings inspired our layered pond rather than an exact copy of one canvas. We used floating lilies, short horizontal reflection marks, and changing seasonal colours to reinterpret the paintings' water and light. The slowly moving reflection is my audio mechanic's contribution to that idea.

## Run and interact

Open the project through a local HTTP server, such as VS Code Live Server, and load index.html. Press Play music to start the recorded soundtrack and Pause music to pause it. Music does not autoplay, and this project does not use the microphone.

The four season buttons jump both the image and music to the chosen passage. With Auto On, music time leads the seasons while playing. When paused, the original 600-frame seasonal cycle continues; Play matches the current season. With Auto Off, the season stays fixed and music repeats its matching passage. Click open water for the team's interactive ripples. The interface explains the other seasonal controls.

## My audio work

I selected and edited a piano recording to support the movement from lively spring and summer to quieter winter. In my first iteration, I used p5.Amplitude.getLevel() to make the existing fish swim faster and grow larger as the music becomes louder. I left the fish's Perlin path, drawing, and response to user-created ripples in my teammate's script. I also added genuine Play/Pause and supplied song time for the seasonal controls.

In my **second audio iteration**, I keep the fish response in spring, summer, and autumn, and change only existing horizontal water brush marks. A small area of reflected light moves slowly across the pond while music plays. Louder music makes nearby marks wider, brighter, and warmer yellow. A separate, slower response filters quick changes in the sound level, so the marks move more gradually and farther up or down. The code still updates their positions every frame. Quieter music returns them to their stored values. Pausing the music stops the moving area and lets the marks settle. In winter, the fish returns to its original Perlin speed and size while the water still responds to music. I do not create or alter the user-input ripple objects. Only audio-mechanic.js changes executable behaviour; this README explains the audio mechanic. My teammate still owns water generation and drawing in perlin-lilies.js.

The recording lasts about 100 seconds. I use approximate season starts at 0, 28, 57, and 80 seconds. These are editing choices, not automatically detected beats. getLevel() measures overall amplitude, not pitch or emotional mood. I use map(), constrain(), and lerp() to keep the response bounded and smooth. In spring through autumn, the fish retains its first-iteration audio range: speed 1–6 times its original value and size 1–2.2 times its original value. In winter, those multipliers are both 1. For water, I select every fourth fine mark after the first 550 broad colour patches and map a song level of about 0.02–0.09 to a bounded response. I use a quicker lerp for colour, width, and opacity and a slower lerp for the stronger vertical motion. Each mark moves around its saved starting position, so the change does not build up over time.

## Files and ownership

| File | Role |
| --- | --- |
| index.html | Loads local p5.js, p5.sound, scripts, and controls. |
| sketch.js | Holds the only p5 setup() and draw() and calls the four mechanics. |
| audio-mechanic.js | My loading, Play/Pause, level analysis, fish mapping, and moving light and shimmer (Git author: jielun-Huang). |
| time-mechanic.js | Season timing, particles, and buttons; it reads music time (time contribution: SHiN666666). |
| perlin-lilies.js | Palettes, brush marks, lilies, and Perlin movement (Perlin contribution: Zheming Yu / 874593718). |
| perlin-water-life.js | Fish movement and ripple response (Perlin contribution: Zheming Yu / 874593718). |
| input-controls.js | Mouse and keyboard interactions and interactive ripples (user-input contribution: EdithWu79; root integration: 874593718). |
| assets/pond-loop.wav | My edited classroom-use recording, subject to the rights note below. |

The handles above follow the Git authors and source headers in this repository. Each teammate retains ownership of their own mechanism.

## Course methods, sources, and AI assistance

My audio mechanic follows [Week 10 Tutorial Part 1](https://canvas.sydney.edu.au/courses/74653/pages/week-10-tutorial?module_item_id=3241914): preload(), loadSound(), p5.Amplitude, setInput(), getLevel(), isPlaying(), loop(), and using sound level to control a visual property. The tutorial's sample Play/Pause button calls stop(), so my true [pause()](https://p5js.org/reference/p5.SoundFile/pause/) and seasonal [jump()](https://p5js.org/reference/p5.SoundFile/jump/) and [currentTime()](https://v1.p5js.org/reference/p5.SoundFile/currentTime/) are official p5.sound supplements, not tutorial examples. The existing HTML button uses basic browser DOM calls from the earlier team interface, rather than the tutorial's createButton(). I use ordinary course JavaScript arrays, conditions, loops, and p5.js [map()](https://p5js.org/reference/p5/map/), [constrain()](https://p5js.org/reference/p5/constrain/), and [lerp()](https://p5js.org/reference/p5/lerp/). This iteration adds no FFT, microphone input, external visual framework, shader, or Web Audio API. The [assignment](https://canvas.sydney.edu.au/courses/74653/assignments/716000) gives the submission requirements.

My audio source is Robert Schumann's *Kinderszenen*, Op. 15, performed by Anna Vinnitskaya and published by SWR Classic / ARD Klassik ([source video](https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY)). I edited my OBS recording from approximately 7.2 to 107.2 seconds and applied short fades. The recording did not preserve reliable source-video timecode, so I cannot claim an exact match to the video timestamps. This private student project is non-commercial. Attribution and non-commercial use do not grant redistribution permission; public release needs permission or a clearly licensed replacement.

ChatGPT/Codex helped me edit the supplied recording, write parts of the audio code and comments, calibrate the second-iteration response, and check the result. Teammates' scripts identify their own work and AI assistance. I will keep only code I can explain.

## Manual checks

1. Load the page through a local server. Check that music does not autoplay and no JavaScript error appears.
2. Play and pause. Compare quiet and loud passages: the moving warm reflections brighten quickly while their vertical motion changes more slowly. In winter, check that the fish keeps its original movement and size while the water still responds.
3. Try each season button and Auto On/Off. Check that music and seasons stay aligned.
4. Click open water and try the seasonal controls. Check that user-input ripples and teammate mechanics still work.
5. Check the audio mechanic against the documented sources and AI assistance. Each team member should commit meaningful work under their own contribution.

Earlier notes in docs/ describe previous stages and should not be mistaken for the current integrated project.
