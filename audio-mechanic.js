// AUDIO ITERATION 1 — music level changes the existing 2D fish.
// Student audio design; ChatGPT/Codex assisted with code and comments.
// Week 10 Tutorial Part 1: loadSound, p5.Amplitude, getLevel and playback.
// p5.sound pause() and loop() are official library supplements.

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

// 2. LOAD — p5 calls this once before setup(). Keep audio loading here.
function preload() {
  audioSong = loadSound('assets/pond-loop.wav');
}

// 3. SETUP — analyse the song, never the microphone.
function setupAudioMechanic(state) {
  audioAnalyser = new p5.Amplitude();
  audioAnalyser.setInput(audioSong);
  audioButton = document.getElementById('audio-play');
  audioButton.addEventListener('click', function() { handleAudioPressed(); });
  audioButton.disabled = false;
}

// 4. PLAY / PAUSE — the original sketch also calls this on pond clicks.
// That existing call passes state; ignore it so only the button plays music.
function handleAudioPressed(state) {
  if (state) return;
  if (audioSong.isPlaying()) {
    audioSong.pause();
    audioButton.innerHTML = 'Play music';
  } else {
    audioSong.loop();
    audioButton.innerHTML = 'Pause music';
  }
}

// 5. ANALYSE AND MAP — output new speed/size values for the existing fish.
// Capture its random base values once; never multiply last frame's values.
// Perlin direction, drawing and ripple response remain in the teammate file.
function updateAudioMechanic(state) {
  if (audioFishBaseSpeed === undefined && pondFish) {
    audioFishBaseSpeed = pondFish.speed;
    audioFishBaseSize = pondFish.size;
  }
  audioLevel = 0;
  if (audioSong.isPlaying()) audioLevel = audioAnalyser.getLevel();
  let target = map(audioLevel, audioQuietLevel, audioStrongLevel, 0, 1);
  target = constrain(target, 0, 1);
  audioResponse = lerp(audioResponse, target, audioSmoothing);
  if (audioFishBaseSpeed !== undefined) {
    // The teammate's audioLevel adds a separate 0–50% speed boost.
    // Set it to zero so this mapping alone gives a clear 1–6x range.
    pondFish.audioLevel = 0;
    pondFish.speed = audioFishBaseSpeed * map(audioResponse, 0, 1, 1, audioMaxSpeed);
    pondFish.size = audioFishBaseSize * map(audioResponse, 0, 1, 1, audioMaxSize);
  }
}

// The fish itself is the visual highlight; no second graphic is drawn.
function drawAudioMechanic(state) {}
