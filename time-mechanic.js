// Time-driven seasons, lily appearance and falling objects. AI-assisted implementation.
let season = 0;
let particles = [];
let autoChange = true;
let seasonFrames = 0;
// Current leaf size, flower size and leaf colour.
let leafScale = 0.45;
let flowerScale = 0;
let leafR = 145;
let leafG = 174;
let leafB = 100;
let seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];

function setupTimeMechanic(state) {
  particles = [];
  for(let i=0;i<90;i++) {
    particles.push({x:random(1),y:random(1)});
  }
}
function updateTimeMechanic(state) {
  // Count 600 frames per season, then return to spring after winter.
  if(autoChange) {
    seasonFrames++;
    if(seasonFrames>=600) {
      season = season + 1;
      if(season > 3) season = 0;
      seasonFrames = 0;
      updateLabels();
    }
  }
  // Spring starts with small flowers and light green leaves.
  let targetLeaf = 0.65;
  let targetFlower = 0.3;
  let targetR = 145, targetG = 174, targetB = 100;
  if(season===1) {
    // Summer: larger leaves and fully open flowers.
    targetLeaf=1.15; targetFlower=1.25;
    targetR=85; targetG=140; targetB=72;
  } else if(season===2) {
    // Autumn: brown-yellow leaves and shrinking flowers.
    targetLeaf=0.85; targetFlower=0;
    targetR=166; targetG=128; targetB=55;
  } else if(season===3) {
    // Winter: leaves and flowers shrink away.
    targetLeaf=0; targetFlower=0;
    targetR=100; targetG=89; targetB=65;
  }
  // Move a little closer to the target each frame (Week 11 easing).
  leafScale=lerp(leafScale,targetLeaf,0.015);
  flowerScale=lerp(flowerScale,targetFlower,0.015);
  leafR=lerp(leafR,targetR,0.015);
  leafG=lerp(leafG,targetG,0.015);
  leafB=lerp(leafB,targetB,0.015);
  // Rain falls faster than petals, leaves and snow.
  let speed=1;
  if(season===1) speed=7;
  for(let i=0;i<particles.length;i++) {
    let p=particles[i];
    p.y=p.y+speed/state.height;
    if(season===1) p.x=p.x-2/state.width;
    else p.x=p.x+0.3/state.width;
    // Reuse each object when it leaves the canvas.
    if(p.y>1.02) {p.y=-0.02;p.x=random(1);}
    if(p.x>1.02) p.x=-0.02;
    if(p.x< -0.02) p.x=1.02;
  }
}
function drawTimeMechanic(state) {
  push();
  noStroke();
  // Draw a light colour filter over the pond.
  if(season===0) fill(220,200,145,18);
  else if(season===1) fill(30,65,105,35);
  else if(season===2) fill(215,125,45,42);
  else fill(150,175,210,48);
  rect(0,0,state.width,state.height);
  // Draw the same objects as petals, rain, leaves or snow.
  for(let i=0;i<particles.length;i++) {
    let p=particles[i];
    let x=p.x*state.width;
    let y=p.y*state.height;
    noStroke();
    if(season===0) {
      drawSakuraPetal(x,y,i*37);
    } else if(season===1) {
      stroke(190,220,245,175);
      strokeWeight(1.2);
      line(x,y,x-5,y+16);
    } else if(season===2) {
      drawMapleLeaf(x,y,i*47);
    } else {
      fill(255,255,255,225);
      circle(x,y,4);
    }
  }
  pop();
}
// Two tilted ovals and a triangle make a notched, heart-like petal.
function drawSakuraPetal(x,y,angle) {
  push();
  translate(x,y);
  rotate(angle);
  fill(255,164,194,235);
  triangle(-6,-1,6,-1,0,8);
  push();
  translate(-3,-1);
  rotate(-25);
  ellipse(0,0,7,10);
  pop();
  push();
  translate(3,-1);
  rotate(25);
  ellipse(0,0,7,10);
  pop();
  // A short pale line adds a small highlight.
  stroke(255,220,232,180);
  strokeWeight(1);
  line(0,5,-3,0);
  pop();
}
// Five triangles form the pointed lobes of a maple leaf.
function drawMapleLeaf(x,y,angle) {
  push();
  translate(x,y);
  rotate(angle);
  noStroke();
  fill(220,105,40,240);
  ellipse(0,2,10,9);
  triangle(-4,3,0,-12,4,3);
  triangle(0,5,-9,-7,-5,6);
  triangle(0,5,9,-7,5,6);
  triangle(0,6,-12,0,-6,7);
  triangle(0,6,12,0,6,7);
  // The centre vein extends below the leaf to make a stem.
  stroke(126,65,32,220);
  strokeWeight(1);
  line(0,-7,0,11);
  line(0,3,-7,0);
  line(0,3,7,0);
  pop();
}
// Preview a season and restart its frame counter.
function chooseSeason(next) {
  season=next;
  seasonFrames=0;
  updateLabels();
}
// Pause or resume the automatic season cycle.
function toggleAuto() {
  autoChange=!autoChange;
  seasonFrames=0;
  updateLabels();
}
// Update the season name and the preview buttons using their HTML IDs.
function updateLabels() {
  document.getElementById('status').textContent=seasonNames[season];
  let buttonIds = ['spring','summer','autumn','winter'];
  for(let i=0;i<4;i++) {
    document.getElementById(buttonIds[i]).setAttribute('aria-pressed',i===season);
  }
  if(autoChange) document.getElementById('auto').textContent='Auto: On';
  else document.getElementById('auto').textContent='Auto: Off';
}
