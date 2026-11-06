// AUDIO MECHANIC (Jielun Huang) — iteration 3.
// The piano's loudness drives fish speed and a moving warm water light; its
// frequency content makes lily pads in four regions grow and tilt; summer
// adds rain and animal calls, and input ripples/ice cracks get feedback sounds.
// I designed the audio mechanic and chose its sounds, mappings and limits;
// ChatGPT/Codex assisted me with code, comments and sound file preparation. Claude helped split the update into the helper functions
// in section 6, name the shared constants, and tidy these comments.
// Week 10 Tutorial (Canvas): Part 1 preload/loadSound, p5.Amplitude, setInput,
// getLevel, isPlaying and loop; Part 2 setVolume; Parts 3 and 5 p5.FFT and
// analyze() mapped to 2D shapes. map/constrain/lerp/random are course p5.js.
// Supplements not shown in the tutorial are cited where they are used:
// pause(), jump(), currentTime(), FFT setInput(), userStartAudio() and
// addEventListener().

// 1. AUDIO AND RESPONSE SETTINGS
let audioSong;
let audioAnalyser;
let audioButton;
let audioLevel = 0;
let audioResponse = 0;
let audioQuietLevel = 0.005;
let audioStrongLevel = 0.18;
let audioSmoothing = 0.12;
let audioMaxSpeed = 6;
let audioFishBaseSpeed;
let audioSeekFrames = 0;
// After jump(), currentTime() can report the old position for a few frames.
let audioSeekGuardFrames = 12;
// Shared with teammates' files. These must match the values used there:
// time-mechanic.js counts 600 frames per season when music is paused,
// winter is season index 3, and perlin-lilies.js creates 550 broad patches
// before its fine brush marks.
let audioSeasonFrameLength = 600;
let audioWinterSeason = 3;
let audioBroadPatchCount = 550;
// Water response: preserve each selected brush mark's original values and y.
// The Perlin teammate still creates and draws all water marks in their file.
let audioWaterMarks = [];
let audioWaterResponse = 0;
let audioWaterMotion = 0;
// A moving area of reflection, measured across the existing 2D pond (0..1).
// Simple frame steps keep it slow; the music level still controls brightness.
let audioLightX = 0.2;
let audioLightDirection = 1;
let audioLightSpeed = 0.00035;
let audioLightRadius = 0.26;
// Most 0.1-second RMS windows of the edited piano are near 0.02..0.09.
// This is a local tuning guide, not a measured p5 getLevel() range.
let audioWaterQuietLevel = 0.02;
let audioWaterStrongLevel = 0.09;

// Environment and feedback sounds (section 7). Only audioSong feeds the
// analysers; these clips never change the visual response.
let audioRain;
let audioCicada;
let audioFrog;
let audioWaterClick;
let audioIceClick;
// Count only playing summer frames. First call after about 3 seconds at
// 60 fps, then one animal call every 7–14 seconds, chosen with course random().
let audioAnimalFrames = 0;
let audioAnimalWait = 180;
// Browser audio is unlocked by the first real click on the page.
let audioEnvironmentReady = false;
// Last ripple/crack objects seen, so only genuinely new events make a sound.
let audioLastInputRipple;
let audioLastInputCrack;
let audioLastWaterFrame = -100;

// Four-region frequency response for lily pads (section 8).
let audioLeafFFT;
let audioLeaves = [];
const audioLeafBins = 256;
let audioLeafMaxTilt = 28;
let audioLeafMaxSize = 1.7;
// Summer already has larger pads through the teammate's seasonal scale.
// Reduce only the audio contribution and soften its response in that season.
let audioLeafSummerMaxSize = 1.35;
let audioLeafSummerMaxTilt = 16;
// Fixed clockwise regions: top-left, top-right, bottom-right, bottom-left.
// Unequal bin widths give bass/middle/upper piano content separate regions.
// End bins are exclusive. These are visual tuning ranges, not pitch labels
// detected from the music. At 44.1 kHz, bins are about 86 Hz apart.
let audioLeafRegions = [
  {start:1, end:8, quiet:140, strong:255, target:0},
  {start:8, end:16, quiet:100, strong:235, target:0},
  {start:16, end:32, quiet:50, strong:185, target:0},
  {start:32, end:64, quiet:6, strong:85, target:0}
];
// Central 36% of width AND height does not receive a spectrum response.
// Keep the Perlin teammate's normal drift and input interactions there.
let audioLeafCentreHalfWidth = 0.18;
// Music-triggered ripples: at most one per 45 frames, 20% chance per pad
// whose response newly rises past 0.65.
let audioLeafLastRipple = -100;
let audioLeafRippleGap = 45;
let audioLeafRippleChance = 0.2;
let audioLeafRippleThreshold = 0.65;

// 2. LOAD — called from the single preload() in sketch.js, so p5 finishes
// loading every sound file before setup(). Output: the six sound files.
function preloadAudioMechanic() {
  // The piano and rain are AAC (.m4a) copies of my edited WAV files, encoded
  // with Claude's help using macOS afconvert (192 and 128 kbps), so the page
  // loads about 22 MB less.
  // Piano: Schumann, Kinderszenen Op. 15, Anna Vinnitskaya, SWR Classic / ARD
  // Klassik, trimmed from my OBS recording (rights note in the README):
  // https://www.ardmediathek.de/video/ard-klassik/schumann-kinderszenen-vinnitskaya/ard/Y3JpZDovL3N3ci5kZS9hZXgvbzE0ODU5MzY
  // The other sounds are CC0 Freesound clips, credited at the end of this file.
  audioSong = loadSound('assets/pond-loop.m4a');
  audioRain = loadSound('assets/summer-heavy-rain.m4a');
  audioWaterClick = loadSound('assets/water-click.mp3');
  audioIceClick = loadSound('assets/ice-click-soft.wav');
  audioCicada = loadSound('assets/summer-cicada.wav');
  audioFrog = loadSound('assets/summer-frog.wav');
}

// 3. SETUP — input: the team's pond state (unused here). Connect the song,
// bind the existing HTML button, and save original marks for later updates.
function setupAudioMechanic(state) {
  setupAudioLeaves();
  // setVolume() gain multipliers (Week 10 Tutorial Part 2): rain 0.21 = 21%
  // (30% lower than 0.3), ice 2 = 200%. These are file gains, not loudness.
  // https://v1.p5js.org/reference/p5.SoundFile/setVolume/
  audioRain.setVolume(0.21);
  // Background animals stay quiet; their files were prepared at -23 LUFS.
  audioCicada.setVolume(0.22);
  audioFrog.setVolume(0.35);
  audioIceClick.setVolume(2);
  audioWaterClick.setVolume(1);
  // Basic DOM click binding is an official browser supplement, like the
  // existing Play button. Unlock sound only after a real user interaction.
  // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
  // https://p5js.org/reference/p5/userStartAudio/
  document.addEventListener('click', function() {
    userStartAudio();
    audioEnvironmentReady = true;
  });
  audioAnalyser = new p5.Amplitude();
  audioAnalyser.setInput(audioSong);
  // Basic browser DOM wiring for the button already present in index.html.
  audioButton = document.getElementById('audio-play');
  audioButton.addEventListener('click', function() { handleAudioPressed(); });
  audioButton.disabled = false;
  // Skip the first 550 broad colour patches; keep every fourth fine,
  // horizontal stroke from the teammate's existing waterMarks array.
  // A moving light needs marks outside the original, fixed reflection band.
  // No new water objects are added; selected marks can shift around their original y.
  for (let i = audioBroadPatchCount; i < waterMarks.length; i++) {
    let mark = waterMarks[i];
    if (i % 4 === 0 && mark.w > 0.018 && mark.h < 0.008) {
      audioWaterMarks.push({mark:mark, y:mark.y, w:mark.w, alpha:mark.alpha,
        r:mark.r, g:mark.g, b:mark.b});
    }
  }
}

// 4. PLAY / PAUSE — only the Play music button calls this; pond clicks
// belong to the user-input mechanic and never start the music.
// Official p5.sound pause() preserves playback position, unlike stop():
// https://p5js.org/reference/p5.SoundFile/pause/
function handleAudioPressed() {
  if (audioSong.isPlaying()) {
    audioSong.pause();
    audioButton.innerHTML = 'Play music';
  } else {
    // Seasons can keep moving while paused. Match their current progress.
    let start = seasonStartTimes[season];
    let end = seasonStartTimes[season + 1];
    let progress = constrain(seasonFrames / audioSeasonFrameLength, 0, 0.99);
    seekAudioTo(start + (end - start) * progress);
    // Tell the time mechanic to wait for the jump before reading song time.
    seasonSeekFrames = audioSeekGuardFrames;
  }
}

// 5. SEASON SEEK — input: seconds in the 100-second song. Start playback if
// needed, move the playhead, and output a short guard plus button label.
// Official p5.sound jump(): https://p5js.org/reference/p5.SoundFile/jump/
function seekAudioTo(seconds) {
  if (!audioSong.isPlaying()) audioSong.loop();
  audioSong.jump(seconds);
  audioSeekFrames = audioSeekGuardFrames;
  audioButton.innerHTML = 'Pause music';
}

// 6. ANALYSE AND MAP — input: team state and current song level. Output song
// time/playing state, fish speed, and properties of existing water marks.
// Each step lives in its own helper below so the order is easy to follow.
// Official p5.sound currentTime():
// https://v1.p5js.org/reference/p5.SoundFile/currentTime/
function updateAudioMechanic(state) {
  state.audioTime = audioSong.currentTime();
  state.audioPlaying = audioSong.isPlaying();
  keepSongInFrozenSeason(state);
  audioLevel = 0;
  if (state.audioPlaying) audioLevel = audioAnalyser.getLevel();
  updateFishFromLevel();
  updateWaterLightFromLevel(state);
  updateAudioLeaves(state);
  updateAudioEnvironment(state);
}

// 6a. Auto Off freezes the season; repeat its passage of the same song.
function keepSongInFrozenSeason(state) {
  if (audioSeekFrames > 0) {
    audioSeekFrames--;
    return;
  }
  if (!state.audioPlaying || autoChange) return;
  let start = seasonStartTimes[season];
  let end = seasonStartTimes[season + 1];
  if (state.audioTime < start || state.audioTime >= end) {
    seekAudioTo(start);
    state.audioTime = start;
  }
}

// 6b. FISH — louder music makes the fish swim faster.
// Capture its random base values once; never multiply last frame's values.
// Perlin direction, drawing and ripple response remain in the teammate file.
function updateFishFromLevel() {
  if (!pondFish) return;
  if (audioFishBaseSpeed === undefined) {
    audioFishBaseSpeed = pondFish.speed;
  }
  let target = map(audioLevel, audioQuietLevel, audioStrongLevel, 0, 1);
  target = constrain(target, 0, 1);
  // Winter fish keeps its Perlin movement but has no music-driven boost.
  if (season === audioWinterSeason) target = 0;
  audioResponse = lerp(audioResponse, target, audioSmoothing);
  // The teammate's audioLevel adds a separate 0–50% speed boost.
  // I set it to zero so this AI-assisted amplitude mapping alone gives
  // a clear 1–6x range; I chose the fish and its response limits.
  // In winter, restore the original speed immediately.
  pondFish.audioLevel = 0;
  if (season === audioWinterSeason) {
    pondFish.speed = audioFishBaseSpeed;
  } else {
    pondFish.speed = audioFishBaseSpeed * map(audioResponse, 0, 1, 1, audioMaxSpeed);
  }
}

// 6c. WATER LIGHT — a warm reflection drifts across the pond while music
// plays; louder music makes nearby brush marks wider, brighter and warmer.
// It changes existing marks; it does not draw a new light or input ripple.
// AI assistance: ChatGPT/Codex helped tune this amplitude-to-brush mapping.
function updateWaterLightFromLevel(state) {
  let waterTarget = map(audioLevel, audioWaterQuietLevel, audioWaterStrongLevel, 0, 1);
  waterTarget = constrain(waterTarget, 0, 1);
  audioWaterResponse = lerp(audioWaterResponse, waterTarget, 0.42);
  // A second, slower lerp filters quick level spikes from vertical motion.
  // Marks still update every frame; they move more gradually and farther.
  audioWaterMotion = lerp(audioWaterMotion, waterTarget, 0.05);
  // The reflected light moves only while the music plays, and pauses with it.
  if (state.audioPlaying) {
    audioLightX += audioLightDirection * audioLightSpeed;
    if (audioLightX >= 0.8 || audioLightX <= 0.2) {
      audioLightDirection *= -1;
    }
  }
  // Marks near the moving light change more; distant marks return to normal.
  // Always calculate from stored brush values, so nothing grows each frame.
  for (let i = 0; i < audioWaterMarks.length; i++) {
    let base = audioWaterMarks[i];
    let mark = base.mark;
    let distance = abs(mark.x - audioLightX);
    let nearLight = constrain(map(distance, 0, audioLightRadius, 1, 0), 0, 1);
    let light = audioWaterResponse * nearLight;
    // Neighbouring marks move in opposite directions around their stored y,
    // so the reflection shimmers as the level rises and falls.
    let verticalDirection = 1;
    if (i % 2 === 0) verticalDirection = -1;
    mark.y = base.y + verticalDirection * audioWaterMotion * nearLight * 0.014;
    mark.w = base.w * (1 + light * 1.15);
    mark.alpha = constrain(base.alpha + light * 175, 0, 230);
    mark.r = lerp(base.r, 245, light * 0.9);
    mark.g = lerp(base.g, 220, light * 0.9);
    mark.b = lerp(base.b, 165, light * 0.9);
  }
}

// Water is drawn by the team's existing drawPondWater(); no new overlay.
function drawAudioMechanic(state) {}


// 7. ENVIRONMENT AND INPUT SOUNDS — my design; Codex helped me implement
// these helpers and the offline sound edits. Only audioSong feeds the analysers.
// I leave my teammates' input/time files unchanged. I observe their new
// ripple/crack objects instead of replacing handlers or sounding on every click.
// Variables for this section are declared in section 1.
// Input: current season and teammate event arrays. Output: summer ambience
// and one-shot feedback for actual new events. Object identity detects a new
// ripple even when the input array stays capped at 12 items. Cleared arrays
// reset the observer, so resetting interactions cannot replay an old event.
function updateAudioEnvironment(state) {
  // Summer is index 1 in time-mechanic.js. Ambience requires piano playback,
  // so loading, clicking the pond, or pausing music cannot leave rain running.
  // loop(), stop(), play(), isPlaying(): official p5.sound playback.
  // https://v1.p5js.org/reference/p5.SoundFile/loop/
  let summerPlaying = audioEnvironmentReady && season === 1 && audioSong.isPlaying();
  if (summerPlaying) {
    if (!audioRain.isPlaying()) audioRain.loop();
    audioAnimalFrames++;
    if (audioAnimalFrames >= audioAnimalWait &&
        !audioCicada.isPlaying() && !audioFrog.isPlaying()) {
      // Ordinary course random() and frame counters produce occasional
      // one-shot calls, rather than a continuous chorus or a new audio engine.
      // One animal at a time prevents these two background clips overlapping.
      if (random(1) < 0.5) audioCicada.play();
      else audioFrog.play();
      audioAnimalFrames = 0;
      audioAnimalWait = random(420, 840);
    }
  } else {
    if (audioRain.isPlaying()) audioRain.stop();
    if (audioCicada.isPlaying()) audioCicada.stop();
    if (audioFrog.isPlaying()) audioFrog.stop();
    audioAnimalFrames = 0;
    audioAnimalWait = 180;
  }

  // Winter water ripples remain visual input events but have no water plop.
  // Also cut a previous season's unfinished plop. Ice-crack audio is separate.
  if (season === audioWinterSeason && audioWaterClick.isPlaying()) audioWaterClick.stop();
  let ripple = state.ripples[state.ripples.length - 1];
  if (ripple !== audioLastInputRipple) {
    // Summer dragging also creates input ripples. Space their plops by
    // 10 frames to avoid a wall of overlapping sound during a long drag.
    if (ripple && season !== audioWinterSeason && audioEnvironmentReady &&
        frameCount - audioLastWaterFrame >= 10) {
      audioWaterClick.stop();
      audioWaterClick.play();
      audioLastWaterFrame = frameCount;
    }
    audioLastInputRipple = ripple;
  }
  let crack = inputCracks[inputCracks.length - 1];
  if (crack !== audioLastInputCrack) {
    if (crack && audioEnvironmentReady) {
      audioIceClick.stop();
      audioIceClick.play();
    }
    audioLastInputCrack = crack;
  }
}

// 8. FOUR-REGION FREQUENCY RESPONSE — I chose the size/tilt response and the
// occasional spring/summer ripples; Codex assisted me with this implementation.
// Week 10 Tutorial Parts 3/5: FFT/analyze and frequency energy to 2D values.
// https://canvas.sydney.edu.au/courses/74653/pages/week-10-tutorial?module_item_id=3241914
// FFT setInput isolates piano: https://v1.p5js.org/reference/p5.FFT/setInput/
// Arrays, conditions, loops, map/constrain/lerp and random are course tools.
// Variables and tuning values for this section are declared in section 1.
// Input: original lily coordinates and the loaded piano. Output: a fixed
// region per lily and saved size/angle. A summer drag does not change its band.
// No angle sorting or new drawing is needed: the existing renderer reads the
// size/angle parameters provided by this audio module.
function setupAudioLeaves() {
  audioLeafFFT = new p5.FFT(0.7, audioLeafBins);
  audioLeafFFT.setInput(audioSong);
  audioLeaves = [];
  for (let i = 0; i < lilies.length; i++) {
    let leaf = lilies[i];
    let region = -1;
    let central = abs(leaf.baseX - 0.5) < audioLeafCentreHalfWidth &&
      abs(leaf.baseY - 0.5) < audioLeafCentreHalfWidth;
    if (!central) {
      if (leaf.baseY < 0.5) {
        if (leaf.baseX < 0.5) region = 0;
        else region = 1;
      } else {
        if (leaf.baseX >= 0.5) region = 2;
        else region = 3;
      }
    }
    audioLeaves.push({leaf:leaf, region:region, response:0,
      baseAngle:leaf.angle, baseSize:leaf.size});
  }
}

// 8b. BAND ENERGY -> FOUR DISTINCT AREAS -> SIZE AND DIRECT TILT
// Read 256 FFT energies (0..255). Average each band's values, normalise with
// its tuning range, and give the strongest region full response. The other
// regions keep 20% of their response (45% for quieter bottom-left), so piano
// harmonics do not enlarge the entire pond equally. This is visual emphasis,
// not a beat detector. Equal targets use the first region as a stable tie.
function updateAudioLeaves(state) {
  let spectrum = [];
  if (audioSong.isPlaying()) spectrum = audioLeafFFT.analyze();
  let strongest = -1;
  let strongestTarget = 0;
  for (let i = 0; i < audioLeafRegions.length; i++) {
    let region = audioLeafRegions[i];
    let energy = 0;
    for (let bin = region.start; bin < region.end; bin++) {
      if (spectrum[bin]) energy += spectrum[bin];
    }
    energy = energy / (region.end - region.start);
    region.target = constrain(map(energy, region.quiet, region.strong, 0, 1), 0, 1);
    if (region.target > strongestTarget) {
      strongest = i;
      strongestTarget = region.target;
    }
  }
  let maxSize = audioLeafMaxSize;
  let maxTilt = audioLeafMaxTilt;
  let smoothing = 0.32;
  if (season === 1) {
    maxSize = audioLeafSummerMaxSize;
    maxTilt = audioLeafSummerMaxTilt;
    smoothing = 0.22;
  }
  for (let i = 0; i < audioLeaves.length; i++) {
    let item = audioLeaves[i];
    let target = 0;
    if (item.region >= 0) {
      target = audioLeafRegions[item.region].target;
      if (item.region !== strongest) {
        // This recording's upper bins are quieter. Bottom-left keeps 45%
        // instead of 20% when secondary, so it can still visibly respond.
        // The leading area still receives the full mapped energy response.
        if (item.region === 3) target *= 0.45;
        else target *= 0.2;
      }
    }
    let previous = item.response;
    item.response = lerp(item.response, target, smoothing);
    // No independent sine clock or accumulating scale. Quiet/paused piano
    // restores saved values, including the centre's original appearance.
    let direction = 1;
    if (item.region === 0 || item.region === 2) direction = -1;
    item.leaf.angle = item.baseAngle + direction * maxTilt * item.response;
    item.leaf.size = item.baseSize * map(item.response, 0, 1, 1, maxSize);

    // 8c. Rising strong responses sometimes emit the team's existing ripple.
    // Only spring/summer; 20% chance per newly strong pad; at most one event
    // per 45 frames. A held note cannot trigger a fresh ripple every frame.
    // The normal input cap/animation and fish response remain team-owned.
    // updateAudioEnvironment runs next and gives this new ripple the same
    // water plop as a mouse ripple. Rain/frog/cicada cannot trigger these.
    if ((season === 0 || season === 1) && item.region >= 0 &&
        previous < audioLeafRippleThreshold && item.response >= audioLeafRippleThreshold &&
        frameCount - audioLeafLastRipple >= audioLeafRippleGap &&
        random(1) < audioLeafRippleChance) {
      addInputRipple(state, item.leaf.x, item.leaf.y);
      audioLeafLastRipple = frameCount;
    }
  }
}

// Sound source credits (all CC0 Freesound public HQ previews, edited offline;
// full details in the README audio section):
// Rain, Heavy, Falling on Leaves — CHallSmith: https://freesound.org/people/CHallSmith/sounds/870824/
// Water.wav — danielpodlovics: https://freesound.org/people/danielpodlovics/sounds/530359/
// Ice Crack 1 — j_p_higgins: https://freesound.org/people/j_p_higgins/sounds/262635/
// Cicada — TannerMetro: https://freesound.org/people/TannerMetro/sounds/825960/
// Small Frog Croaks — clif_creates: https://freesound.org/people/clif_creates/sounds/802737/
// Codex assisted me with source research, file preparation and the simple
// random playback counter above. These clips never enter the piano FFT/amplitude input.
