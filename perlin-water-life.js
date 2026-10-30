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
  // Positive bounded expansion: noise changes speed smoothly, never reverses it.
  // The same radius is used by drawing and the existing lily response.
  return ripple.baseSpeed * map(noise(ripple.noiseSeed+ripple.age*0.04),0,1,0.65,1.35);
}

// Choose the fish's appearance and starting point once at setup.
function setupPondFish() {
  pondFish = {x:random(0.2,0.8), y:random(0.25,0.75),
    heading:random(0,360), seed:random(0,1000), time:0,
    size:random(0.045,0.065), speed:random(0.0007,0.0011),
    red:random(190,225), green:random(130,165), blue:random(85,115),
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
    // Match the displayed wave's 0.72 vertical scale, not a circular hit area.
    if (!ripple.fishReacted && ripple.strength>0 &&
        abs(dist(0,0,dx,dy/0.72)-ripple.radius*state.unit)<state.unit*0.025) {
      // Mark this wave once: standing in its band must not reroll every frame.
      ripple.fishReacted=true;
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
  const speed=fish.speed*(1+constrain(fish.audioLevel,0,1)*0.5+disturbance*fish.responseBoost);
  fish.x=constrain(fish.x+cos(fish.heading)*speed*state.unit/state.width,0.06,0.94);
  fish.y=constrain(fish.y+sin(fish.heading)*speed*state.unit/state.height,0.12,0.88);
}

// Draw the body, tail, highlight and eye around the fish's own centre.
function drawPondFish(state) {
  const fish=pondFish;
  const size=fish.size*state.unit;
  push();
  translate(fish.x*state.width,fish.y*state.height);
  rotate(fish.heading);
  noStroke();
  fill(fish.red,fish.green,fish.blue,175);
  ellipse(0,0,size,size*0.38);
  const tail=sin(state.frame*7)*size*0.10;
  triangle(-size*0.38,0,-size*0.78,-size*0.25+tail,-size*0.78,size*0.25+tail);
  fill(235,205,160,120);
  ellipse(size*0.05,-size*0.05,size*0.55,size*0.12);
  fill(35,55,60);
  circle(size*0.31,-size*0.06,size*0.045);
  pop();
}
