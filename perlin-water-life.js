// Zheming's Week 2 noise/random extension; AI-assisted with ChatGPT/Codex.
// Weeks 3/4 objects/functions/loops, 6 drawing, 8 random/noise/transforms,
// 11 lerp/abs. Input module still owns ripple creation events and cleanup.
let pondFish;

// Save a random starting size, speed and noise position for each ripple.
// Keeping these values means the ripple will not jump around every frame.
function createPerlinRipple(x, y) {
  return {x:x, y:y, radius:random(0.008,0.024), strength:1, age:0,
    baseSpeed:random(0.0025,0.0055), noiseSeed:random(0,1000)};
}

function getPerlinRippleSpeed(ripple) {
  // Map noise from 0–1 to a speed multiplier of 0.65–1.35.
  // The multiplier stays positive, so the ripple continues expanding.
  // The same radius is used by drawing and the existing lily response.
  return ripple.baseSpeed * map(noise(ripple.noiseSeed+ripple.age*0.04),0,1,0.65,1.35);
}

// Choose the fish's appearance and starting point once at setup.
function setupPondFish() {
  pondFish = {x:random(0.2,0.8), y:random(0.25,0.75),
    heading:random(0,360), seed:random(0,1000), time:0,
    size:random(0.045,0.065), speed:random(0.0007,0.0011),
    // Pick a new body colour once; drawing reuses it instead of flickering.
    red:random(100,235), green:random(95,210), blue:random(90,210),
    audioLevel:0, disturbance:0, responseFrames:0, responseDuration:1,
    responseTurn:0, responseBoost:0, responseSeed:0};
}

// Check the edge of every ripple against the fish. Each ripple triggers
// one response, and the response gradually fades as the fish settles.
function respondFishToRipples(state) {
  const fish=pondFish;
  for (let i=0;i<state.ripples.length;i++) {
    const ripple=state.ripples[i];
    const dx=(fish.x-ripple.x)*state.width;
    const dy=(fish.y-ripple.y)*state.height;
    // The displayed ripple is flattened vertically by 0.72. Undo that scale
    // when measuring distance, then compare the fish with the moving wave edge.
    if (!ripple.fishReacted && ripple.strength>0 &&
        abs(dist(0,0,dx,dy/0.72)-ripple.radius*state.unit)<state.unit*0.025) {
      // Mark this wave once: standing in its band must not reroll every frame.
      ripple.fishReacted=true;
      // Compare the fish's heading with the direction from the ripple.
      // The sign of side chooses which way the fish turns.
      const side=cos(fish.heading)*dy-sin(fish.heading)*dx;
      let direction=1;
      if (side<0) direction=-1;
      // An exactly aligned disturbance has no preferred escape side.
      if (abs(side)<1 && random(0,1)<0.5) direction=-direction;
      fish.responseDuration=random(35,60);
      fish.responseFrames=fish.responseDuration;
      fish.responseTurn=direction*random(65,115)*ripple.strength;
      fish.responseBoost=random(0.5,1.0)*ripple.strength;
      fish.responseSeed=random(0,1000);
    }
  }
}

function updatePondFish(state) {
  const fish=pondFish;
  fish.time+=0.009;
  respondFishToRipples(state);
  // Music remains a future 0..1 connector; disturbance is owned here.
  fish.disturbance=fish.responseFrames/fish.responseDuration;
  const disturbance=constrain(fish.disturbance,0,1);
  // Nearby noise values change gradually, so the fish does not jerk around.
  fish.heading+=map(noise(fish.seed+fish.time),0,1,-2,2);
  if (fish.responseFrames>0) {
    const bend=map(noise(fish.responseSeed+(fish.responseDuration-fish.responseFrames)*0.07),0,1,0.7,1.3);
    // Decaying turn rate: random picks the response; noise shapes it smoothly.
    fish.heading+=fish.responseTurn/fish.responseDuration*2*disturbance*bend;
    fish.responseFrames=max(0,fish.responseFrames-1);
  }
  // Soft steering toward the centre near each edge, using only sin/cos.
  let turn=0;
  if(fish.x<0.12) turn-=sin(fish.heading)*4;
  if(fish.x>0.88) turn+=sin(fish.heading)*4;
  if(fish.y<0.18) turn+=cos(fish.heading)*4;
  if(fish.y>0.82) turn-=cos(fish.heading)*4;
  fish.heading+=turn;
  // Convert the heading into horizontal and vertical movement below.
  // The ripple boost fades with disturbance; constrain keeps the fish in view.
  const speed=fish.speed*(1+constrain(fish.audioLevel,0,1)*0.5+disturbance*fish.responseBoost);
  fish.x=constrain(fish.x+cos(fish.heading)*speed*state.unit/state.width,0.06,0.94);
  fish.y=constrain(fish.y+sin(fish.heading)*speed*state.unit/state.height,0.12,0.88);
}

// Build the fish from simple shapes around its centre. The saved colour and
// noise seed stay the same, while the tail moves as the fish swims.
function drawPondFish(state) {
  const fish=pondFish;
  const size=fish.size*state.unit;
  const tail=sin(state.frame*7)*size*0.10;
  push();
  translate(fish.x*state.width,fish.y*state.height);
  rotate(fish.heading);
  noStroke();

  // Two rounded lobes form the tail. Both follow the same gentle swing.
  fill(fish.red,fish.green,fish.blue,135);
  ellipse(-size*0.62,-size*0.11+tail,size*0.42,size*0.20);
  ellipse(-size*0.62,size*0.11+tail,size*0.42,size*0.20);
  triangle(-size*0.25,0,-size*0.60,-size*0.17+tail,-size*0.60,size*0.17+tail);

  // Fins sit behind the body; lighter edges help them stand out in the water.
  fill(fish.red,fish.green,fish.blue,145);
  ellipse(-size*0.08,-size*0.21,size*0.32,size*0.16);
  ellipse(-size*0.08,size*0.21,size*0.32,size*0.16);
  fill(245,230,200,90);
  ellipse(-size*0.08,-size*0.23,size*0.22,size*0.05);
  ellipse(-size*0.08,size*0.23,size*0.22,size*0.05);

  // Layer a belly and a softer highlight over the main body.
  fill(fish.red,fish.green,fish.blue,190);
  ellipse(0,0,size,size*0.38);
  fill(245,225,195,80);
  ellipse(size*0.05,size*0.07,size*0.70,size*0.17);
  fill(255,245,225,75);
  ellipse(size*0.02,-size*0.09,size*0.62,size*0.09);

  // Fixed noise samples give each fish a slightly different scale pattern.
  // No random values are chosen here, so the markings do not flash each frame.
  for (let i=0;i<5;i++) {
    fill(255,240,210,65+noise(fish.seed+i*0.7)*85);
    ellipse(-size*0.29+i*size*0.12,-size*0.03,size*0.055,size*0.07);
    ellipse(-size*0.24+i*size*0.12,size*0.05,size*0.045,size*0.055);
  }

  // A small gill, eye and mouth make the head easier to recognise.
  fill(fish.red*0.65,fish.green*0.65,fish.blue*0.65,150);
  ellipse(size*0.19,0,size*0.025,size*0.18);
  fill(30,45,45,220);
  circle(size*0.33,-size*0.055,size*0.055);
  fill(255,245,220,220);
  circle(size*0.34,-size*0.065,size*0.018);
  fill(fish.red*0.55,fish.green*0.55,fish.blue*0.55,180);
  ellipse(size*0.48,size*0.01,size*0.035,size*0.025);
  pop();
}
