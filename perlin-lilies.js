// Zheming Yu's planned mechanic: Perlin noise AND randomness.
// Generated with ChatGPT/Codex assistance; author must review and understand it.
// Course scope: Weeks 3/4 arrays, objects, functions, loops; Week 6 drawing;
// Week 8 noise, random, normalized positions, transforms. No copied course blocks.
let lilies = [];
let lilyCount = 0;
let noiseTime = 0;
const noiseSpeed = 0.003;
const driftAmount = 0.008;
let waterMarks = [];
let pondPalette;
let paletteIndex = 0;
// RGB triplets: water, reflected sky, foliage, pad, flower.
// AI-assisted original palette choices, inspired by the group's Monet concept.
const pondPalettes = [
  [[66, 89, 126], [177, 183, 205], [65, 101, 84], [103, 141, 91], [244, 204, 218]],
  [[63, 112, 115], [191, 206, 181], [48, 83, 87], [139, 158, 84], [246, 223, 190]],
  [[109, 100, 143], [211, 190, 211], [67, 100, 108], [96, 137, 117], [245, 193, 204]],
  [[111, 128, 114], [224, 212, 169], [56, 91, 97], [129, 145, 78], [247, 218, 220]]
];

function setupPerlinMechanic(state) {
  lilies = [];
  noiseTime = 0;
  paletteIndex = Math.floor(random(0, pondPalettes.length));
  // Pick one base palette, then vary each RGB channel slightly.
  // Save the result once so the colours stay steady while the pond animates.
  pondPalette = [];
  for (let colour = 0; colour < pondPalettes[paletteIndex].length; colour++) {
    pondPalette.push([]);
    for (let channel = 0; channel < 3; channel++) {
      pondPalette[colour].push(constrain(
        pondPalettes[paletteIndex][colour][channel] + random(-10, 10), 0, 255
      ));
    }
  }
  const layoutSeed = random(0, 1000);
  const targetCount = Math.floor(random(58, 69));
  setupWaterMarks();
  // Free positions across the whole pond: no rows, cells or cluster centers.
  // Noise changes acceptance probability, creating soft variations in density.
  for (let attempt = 0; attempt < 6000; attempt++) {
    if (lilies.length >= targetCount - 12) { break; }
    const x = random(0.05, 0.95);
    const y = random(0.12, 0.88);
    const size = random(0.032, 0.084);
    const density = constrain(map(noise(x * 3 + layoutSeed, y * 3),
      0.25, 0.75, 0.15, 0.95), 0.15, 0.95);
    if (random(0, 1) < density && lilyPositionIsClear(x, y, size)) {
      addLily(x, y, size);
    }
  }
  // Add the remaining pads to spacious random locations, not a fixed grid.
  // This softens large gaps without forcing every pad to have equal spacing.
  for (let extra = lilies.length; extra < targetCount; extra++) {
    let bestGap = 0;
    let bestX = 0;
    let bestY = 0;
    const size = random(0.035, 0.065);
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = random(0.05, 0.95);
      const y = random(0.12, 0.88);
      const gap = nearestLilyDistance(x, y);
      if (gap > bestGap && lilyPositionIsClear(x, y, size)) {
        bestGap = gap;
        bestX = x;
        bestY = y;
      }
    }
    // Never force an overlapping pad if no valid sample was found.
    if (bestGap > 0) { addLily(bestX, bestY, size); }
  }
  lilyCount = lilies.length;
}

function addLily(x, y, size) {
  lilies.push({
    baseX: x, baseY: y, x: x, y: y, size: size,
    seedX: random(0, 1000), seedY: random(1000, 2000),
    angle: random(-65, 65), tint: random(-22, 22),
    flower: random(0, 1) > 0.56
  });
}

function nearestLilyDistance(x, y) {
  let nearest = 2;
  for (let i = 0; i < lilies.length; i++) {
    nearest = min(nearest, dist(x, y, lilies[i].baseX, lilies[i].baseY));
  }
  return nearest;
}

function lilyPositionIsClear(x, y, size) {
  for (let i = 0; i < lilies.length; i++) {
    const other = lilies[i];
    // Week 7 dist; normalized distance is a conservative bound at any aspect ratio.
    // 0.026 reserves space for both pads' later noise drift (0.008 per axis).
    const requiredDistance = (size + other.size) * 0.5 + 0.026;
    if (dist(x, y, other.baseX, other.baseY) < requiredDistance) { return false; }
  }
  return true;
}

function setupWaterMarks() {
  waterMarks = [];
  const noiseOffset = random(0, 1000);
  const reflectionX = random(0.15, 0.85);
  const reflectionWidth = random(0.15, 0.35);
  // The first layer has large colour patches; the other two have fine strokes.
  // Store every mark once so the water stays still instead of flashing.
  for (let layer = 0; layer < 3; layer++) {
    for (let i = 0; i < (layer === 0 ? 550 : 1600); i++) {
      let mark = { x: random(0, 1), y: random(0, 1) };

      // Nearby marks get related colours from noise. The reflection band adds
      // lighter sky colours around a randomly chosen horizontal position.
      let shade = noise(mark.x * 4 + noiseOffset, mark.y * 3 + noiseOffset);
      let sky = constrain(1 - abs(mark.x - reflectionX) / reflectionWidth, 0, 1);
      let mix = constrain(shade * 0.8 + sky * 0.35 + random(-0.2, 0.2), 0, 1);

      // Start with a small horizontal stroke, then adjust it for each layer.
      mark.w = random(0.018, 0.065);
      mark.h = random(0.002, 0.007);
      mark.alpha = random(35, 95);
      if (layer === 0) {
        mark.w = random(0.06, 0.18);
        mark.h = random(0.02, 0.07);
        mark.alpha = 42;
      }
      // Narrow vertical strokes suggest plants reflected in darker water.
      if (layer === 1 && shade < 0.48 && sky < 0.5) {
        mark.w = random(0.002, 0.008);
        mark.h = random(0.015, 0.06);
      }

      // Mix the dark water and light sky colours, with a little variation.
      mark.r = lerp(pondPalette[2][0], pondPalette[1][0], mix) + random(-12, 12);
      mark.g = lerp(pondPalette[2][1], pondPalette[1][1], mix) + random(-10, 10);
      mark.b = lerp(pondPalette[2][2], pondPalette[1][2], mix) + random(-12, 12);
      waterMarks.push(mark);
    }
  }

}

function updatePerlinMechanic(state) {
  noiseTime += noiseSpeed;
  for (let i = 0; i < lilies.length; i++) {
    let lily = lilies[i];
    // noise is 0..1; map centers it around zero for a bounded local drift.
    // Use the shorter canvas dimension so movement keeps the same proportions.
    // USER INPUT adapter: combine offsets in this single position writer.
    let inputOffset = getInputLilyOffset(lily, state);
    lily.x = lily.baseX + (map(noise(lily.seedX + noiseTime), 0, 1, -driftAmount, driftAmount) + inputOffset.x) * state.unit / state.width;
    lily.y = lily.baseY + (map(noise(lily.seedY + noiseTime), 0, 1, -driftAmount, driftAmount) + inputOffset.y) * state.unit / state.height;
    if (inputLilyIsDragged(lily)) {
      lily.x = lily.baseX;
      lily.y = lily.baseY;
    }
  }
}

function drawPondWater(state) {
  push();
  background(pondPalette[0][0], pondPalette[0][1], pondPalette[0][2]);
  noStroke();
  for (let i = 0; i < waterMarks.length; i++) {
    let mark = waterMarks[i];
    fill(mark.r, mark.g, mark.b, mark.alpha);
    ellipse(mark.x * state.width, mark.y * state.height,
      mark.w * state.width, mark.h * state.height);
  }
  pop();
}

function drawPerlinMechanic(state) {
  // Draw each pad in order: shadow, leaf, notch, veins and flower.
  for (let i = 0; i < lilies.length; i++) {
    let lily = lilies[i];
    let size = lily.size * state.unit * leafScale;
    push();
    translate(lily.x * state.width, lily.y * state.height);
    rotate(lily.angle);
    noStroke();
    fill(17, 40, 43, 85);
    ellipse(size * 0.06, size * 0.12, size * 1.13, size * 0.79);
    // Read the leaf colour from the time module; keep each leaf's colour variation.
    fill(leafR + lily.tint, leafG + lily.tint, leafB + lily.tint);
    ellipse(0, 0, size, size * 0.72);
    fill(leafR + 30, leafG + 20, leafB + 20, 90);
    ellipse(-size * 0.08, -size * 0.08, size * 0.75, size * 0.48);
    // A simple dark triangle suggests the notch of a lily pad.
    fill(pondPalette[0][0], pondPalette[0][1], pondPalette[0][2]);
    triangle(0, 0, size * 0.44, size * 0.18, size * 0.25, size * 0.34);
    stroke(176, 189, 126, 90);
    strokeWeight(1);
    line(-size * 0.35, -size * 0.05, 0, 0);
    noStroke();
    // The time module controls flower size. Skip flowers when they become tiny.
    if (lily.flower && flowerScale > 0.02) {
      // USER INPUT adapter: seasonal size plus an independent bloom state.
      drawInputLilyFlower(lily, lily.size * state.unit * flowerScale);
    }
    pop();
  }
}

function drawLilyFlower(size) {
  // Each petal uses basic ellipses with Week 8 translate/rotate/push/pop.
  push();
  translate(-size * 0.12, -size * 0.10);
  for (let petal = 0; petal < 7; petal++) {
    push();
    rotate(petal * 360 / 7);
    fill(pondPalette[4][0], pondPalette[4][1], pondPalette[4][2]);
    ellipse(0, -size * 0.14, size * 0.15, size * 0.34);
    fill(248, 226, 222);
    ellipse(0, -size * 0.10, size * 0.08, size * 0.20);
    pop();
  }
  fill(224, 184, 90);
  circle(0, 0, size * 0.15);
  pop();
}
