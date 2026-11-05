// AI-assisted scaffold (ChatGPT/Codex). Week 3 functions/objects; Week 6 p5 lifecycle.
// This is the only file that defines p5 lifecycle and input event functions.
let pond = {
  width: 0,
  height: 0,
  unit: 0,
  frame: 0,
  ripples: []
};

// p5 runs this before setup(). Modules that load files add a call here.
function preload() {
  preloadAudioMechanic();
}

// Create the canvas and initialise each module once.
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  updatePondSize();
  setupPerlinMechanic(pond);
  setupAudioMechanic(pond);
  setupTimeMechanic(pond);
  setupInputMechanic(pond);
  setupPondFish();
  updateLabels();
}

// Update the modules, then draw from the water to the falling objects.
function draw() {
  pond.frame = frameCount;

  // Update shared input first. Only the Perlin module writes lily positions.
  updateInputMechanic(pond);
  updateAudioMechanic(pond);
  updateTimeMechanic(pond);
  updatePerlinMechanic(pond);
  updatePondFish(pond);

  // Back to front: water, reserved fish/time layer, lilies, reserved overlays.
  drawPondWater(pond);
  drawPondFish(pond);
  drawPerlinMechanic(pond);
  drawAudioMechanic(pond);
  drawInputMechanic(pond);
  drawTimeMechanic(pond);
  // The HTML page displays the title and current season.
}

// Keep the shared dimensions in sync with the canvas.
function updatePondSize() {
  pond.width = width;
  pond.height = height;
  pond.unit = min(width, height);
}

function windowResized() {
  // Week 8: keep normalized positions; do not generate a new random layout.
  resizeCanvas(windowWidth, windowHeight);
  updatePondSize();
}

// Forward canvas clicks to the input module. Music has its own HTML button.
function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    handleInputPressed(pond, mouseX / width, mouseY / height);
  }
}

function keyPressed() {
  handleInputKey(pond, key);
}

// USER INPUT adapter: mouseReleased() is introduced in Week 6 Lecture.
function mouseReleased() {
  handleInputReleased(pond, mouseX / width, mouseY / height);
}

