// AUDIO ITERATION 2 — keep fish response and add moving water light.
// Student audio design; ChatGPT/Codex assisted with code and comments.
// Week 10 Tutorial Part 1: preload/loadSound, p5.Amplitude, setInput,
// getLevel, isPlaying and loop. p5.js map/constrain/lerp map the level to art.
// True pause and seasonal seeking use official p5.sound supplements below.

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
let audioMaxSize = 2.2;
let audioFishBaseSpeed;
let audioFishBaseSize;
let audioSeekFrames = 0;
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

// 2. LOAD — called from the single preload() in sketch.js, so p5 finishes
// loading the sound file before setup(). Output: the sound file audioSong.
function preloadAudioMechanic() {
  audioSong = loadSound('assets/pond-loop.wav');
}

// 3. SETUP — input: the team's pond state (unused here). Connect the song,
// bind the existing HTML button, and save original marks for later updates.
function setupAudioMechanic(state) {
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
  for (let i = 550; i < waterMarks.length; i++) {
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
    let progress = constrain(seasonFrames / 600, 0, 0.99);
    seekAudioTo(start + (end - start) * progress);
    seasonSeekFrames = 12;
  }
}

// 5. SEASON SEEK — input: seconds in the 100-second song. Start playback if
// needed, move the playhead, and output a short guard plus button label.
// Official p5.sound jump(): https://p5js.org/reference/p5.SoundFile/jump/
function seekAudioTo(seconds) {
  if (!audioSong.isPlaying()) audioSong.loop();
  audioSong.jump(seconds);
  audioSeekFrames = 12;
  audioButton.innerHTML = 'Pause music';
}

// 6. ANALYSE AND MAP — input: team state and current song level. Output song
// time/playing state, fish speed/size, and properties of existing water marks.
// Capture its random base values once; never multiply last frame's values.
// Perlin direction, drawing and ripple response remain in the teammate file.
// Official p5.sound currentTime():
// https://v1.p5js.org/reference/p5.SoundFile/currentTime/
function updateAudioMechanic(state) {
  state.audioTime = audioSong.currentTime();
  state.audioPlaying = audioSong.isPlaying();
  // Auto Off freezes the season; repeat its passage of the same song.
  if (audioSeekFrames > 0) audioSeekFrames--;
  else if (state.audioPlaying && !autoChange) {
    let start = seasonStartTimes[season];
    let end = seasonStartTimes[season + 1];
    if (state.audioTime < start || state.audioTime >= end) {
      seekAudioTo(start);
      state.audioTime = start;
    }
  }
  if (audioFishBaseSpeed === undefined && pondFish) {
    audioFishBaseSpeed = pondFish.speed;
    audioFishBaseSize = pondFish.size;
  }
  audioLevel = 0;
  if (audioSong.isPlaying()) audioLevel = audioAnalyser.getLevel();
  let target = map(audioLevel, audioQuietLevel, audioStrongLevel, 0, 1);
  target = constrain(target, 0, 1);
  // Winter fish keeps its Perlin movement but has no music-driven boost.
  if (season === 3) target = 0;
  audioResponse = lerp(audioResponse, target, audioSmoothing);
  if (audioFishBaseSpeed !== undefined) {
    // The teammate's audioLevel adds a separate 0–50% speed boost.
    // Set it to zero so this AI-assisted amplitude mapping alone gives
    // a clear 1–6x range; the student chose the fish and response limits.
    // In winter, restore the original speed and size immediately.
    pondFish.audioLevel = 0;
    if (season === 3) {
      pondFish.speed = audioFishBaseSpeed;
      pondFish.size = audioFishBaseSize;
    } else {
      pondFish.speed = audioFishBaseSpeed * map(audioResponse, 0, 1, 1, audioMaxSpeed);
      pondFish.size = audioFishBaseSize * map(audioResponse, 0, 1, 1, audioMaxSize);
    }
  }
  // Most 0.1-second RMS windows of the WAV are near 0.02..0.09.
  // This is a local tuning guide, not a measured p5 getLevel() range.
  // The reflected light moves only while the music plays, and pauses with it.
  // It changes existing marks; it does not draw a new light or input ripple.
  // AI assistance: ChatGPT/Codex helped tune this amplitude-to-brush mapping.
  let waterTarget = constrain(map(audioLevel, 0.02, 0.09, 0, 1), 0, 1);
  audioWaterResponse = lerp(audioWaterResponse, waterTarget, 0.42);
  // A second, slower lerp filters quick level spikes from vertical motion.
  // Marks still update every frame; they move more gradually and farther.
  audioWaterMotion = lerp(audioWaterMotion, waterTarget, 0.05);
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
    let distance = mark.x - audioLightX;
    if (distance < 0) distance = -distance;
    let nearLight = constrain(map(distance, 0, audioLightRadius, 1, 0), 0, 1);
    let light = audioWaterResponse * nearLight;
    // Neighbouring horizontal marks move farther but more slowly in opposite directions.
    // They pulse around stored y positions as the level rises and falls.
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
