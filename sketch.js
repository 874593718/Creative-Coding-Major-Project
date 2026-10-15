// AI-assisted scaffold (ChatGPT/Codex). Week 3 functions/objects; Week 6 p5 lifecycle.
// This is the only file that defines p5 lifecycle and input event functions.
let pond = {
  width: 0,
  height: 0,
  unit: 0,
  frame: 0,
  ripples: []
};

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  updatePondSize();
  setupPerlinMechanic(pond);
  setupAudioMechanic(pond);
  setupTimeMechanic(pond);
  setupInputMechanic(pond);
}

function draw() {
  pond.frame = frameCount;

  // Update shared input first. Only the Perlin module writes lily positions.
  updateInputMechanic(pond);
  updateAudioMechanic(pond);
  updateTimeMechanic(pond);
  updatePerlinMechanic(pond);

  // Back to front: water, reserved fish/time layer, lilies, reserved overlays.
  drawPondWater(pond);
  drawTimeMechanic(pond);
  drawPerlinMechanic(pond);
  drawAudioMechanic(pond);
  drawInputMechanic(pond);
  drawWeekOneLabel(pond);
}

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

function mousePressed() {
  if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
    handleInputPressed(pond, mouseX / width, mouseY / height);
    handleAudioPressed(pond);
  }
}

function keyPressed() {
  handleInputKey(pond, key);
}

function drawWeekOneLabel(state) {
  push();
  noStroke();
  fill(235, 233, 209);
  textSize(constrain(state.unit * 0.025, 12, 20));
  text("WATER LILIES / WEEK 01", 20, 32);
  textSize(constrain(state.unit * 0.016, 9, 12));
  text("Noise + randomness study", 20, 52);
  text("Observe the slow drift.", 20, state.height - 36);
  text("Other mechanics: not yet implemented", 20, state.height - 18);
  pop();
}
