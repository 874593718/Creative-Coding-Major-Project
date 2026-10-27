// Time-driven seasons, lily appearance and falling objects. AI-assisted implementation.
let season = 0;
let particles = [];
let autoChange = true;
let seasonFrames = 0;
let seasonSnap = false;
let seasonSeekFrames = 0;
// Seconds in the edited 100-second song. The first two changes meet its
// natural quiet gaps; winter begins in the quieter final passage.
let seasonStartTimes = [0, 28, 57, 80, 100];
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
  let buttonIds = ['spring','summer','autumn','winter'];
  for(let i=0;i<buttonIds.length;i++) {
    document.getElementById(buttonIds[i]).disabled = false;
  }
}
function updateTimeMechanic(state) {
  // SEASON/AUDIO ADAPTER (AI-assisted): restore the team's 600-frame Auto
  // cycle when music is paused. During playback, the real song time leads.
  if(state.audioPlaying) {
    let musicSeason = 0;
    if(state.audioTime >= seasonStartTimes[3]) musicSeason = 3;
    else if(state.audioTime >= seasonStartTimes[2]) musicSeason = 2;
    else if(state.audioTime >= seasonStartTimes[1]) musicSeason = 1;
    // jump() may report its previous position for a few frames.
    if(seasonSeekFrames > 0) {
      if(state.audioTime >= seasonStartTimes[season] &&
         state.audioTime < seasonStartTimes[season+1]) seasonSeekFrames = 0;
      else seasonSeekFrames--;
    } else if(autoChange && musicSeason !== season) {
      season = musicSeason;
      updateLabels();
    }
    if(state.audioTime >= seasonStartTimes[season] &&
       state.audioTime < seasonStartTimes[season+1]) {
      // Store the current point in this season for paused Auto playback.
      seasonFrames = map(state.audioTime, seasonStartTimes[season],
                         seasonStartTimes[season+1], 0, 600);
    }
  } else if(autoChange) {
    // Original team behavior: 600 frames per season without music.
    seasonFrames++;
    if(seasonFrames >= 600) {
      season = (season + 1) % 4;
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
  // A button applies its season at once; natural song changes ease across.
  if(seasonSnap) {
    leafScale=targetLeaf; flowerScale=targetFlower;
    leafR=targetR; leafG=targetG; leafB=targetB;
    seasonSnap=false;
  } else {
    // Move a little closer to the target each frame (Week 11 easing).
    leafScale=lerp(leafScale,targetLeaf,0.035);
    flowerScale=lerp(flowerScale,targetFlower,0.035);
    leafR=lerp(leafR,targetR,0.035);
    leafG=lerp(leafG,targetG,0.035);
    leafB=lerp(leafB,targetB,0.035);
  }
  // Rain falls faster than petals, leaves and snow.
  let speed=1;
  if(season===1) speed=7;
  for(let i=0;i<particles.length;i++) {
    let p=particles[i];
    p.y=p.y+speed/state.height;
    if(season===1) p.x=p.x-2/state.width;
    else p.x=p.x+0.3/state.width;
    // USER INPUT adapter: gathering/release is applied inside this writer.
    applyInputToParticle(state, p);
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
// AUDIO/TIME ADAPTER (AI-assisted): the buttons seek into the same song.
// The time mechanic still reads the song position each frame after this.
function chooseSeason(next) {
  seekAudioTo(seasonStartTimes[next]);
  season = next;
  seasonFrames = 0;
  seasonSnap = true;
  seasonSeekFrames = 12;
  updateLabels();
}

// Restore the team's independent Auto switch.
function toggleAuto() {
  autoChange = !autoChange;
  updateLabels();
}

// Show the season selected by the song playhead and mark its button.
function updateLabels() {
  document.getElementById('status').textContent=seasonNames[season];
  let buttonIds = ['spring','summer','autumn','winter'];
  for(let i=0;i<buttonIds.length;i++) {
    document.getElementById(buttonIds[i]).setAttribute('aria-pressed',i===season);
  }
  document.getElementById('auto').textContent = autoChange ? 'Auto: On' : 'Auto: Off';
}
