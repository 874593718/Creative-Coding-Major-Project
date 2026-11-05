// Time mechanic. AI-assisted implementation.
// 0 spring, 1 summer, 2 autumn, 3 winter.
let season = 0;
let autoChange = true;
let seasonFrames = 0;
let seasonSnap = false;
let seasonSeekFrames = 0;
let seasonStartTimes = [0, 28, 57, 80, 100];
let seasonNames = ['Spring', 'Summer', 'Autumn', 'Winter'];
let seasonButtons = ['spring', 'summer', 'autumn', 'winter'];
let particles = [], ice = [], mist = [], lights = [], visitors = [];
let leafScale = 0.45, flowerScale = 0;
let leafR = 145, leafG = 174, leafB = 100;
let iceAmount = 0, snowAmount = 0, snowCount = 18, mistAmount = 0;
let winterFrames = 0, lastSeason = -1, timeFrame = 0;
// Leaf size, flower size and RGB colour for each season.
let seasonLooks = [
  [0.65, 0.3, 145, 174, 100],
  [1.15, 1.25, 85, 140, 72],
  [0.85, 0, 166, 128, 55],
  [0.22, 0, 100, 89, 65]
];

function setupTimeMechanic(state) {
  particles = []; ice = []; mist = []; lights = []; visitors = [];
  iceAmount = 0; snowAmount = 0; mistAmount = 0;
  winterFrames = 0; lastSeason = -1; timeFrame = 0;
  for (let i = 0; i < 90; i++) particles.push({x:random(1), y:random(1)});
  for (let i = 0; i < 17; i++) {
    let x = random(0.02, 0.20), size = random(0.11, 0.20);
    if (i >= 6) x = random(0.80, 0.98);
    if (i >= 12) { x = 0.30 + (i - 12) * 0.10; size = random(0.06, 0.10); }
    ice.push({x:x, y:random(0.25, 0.80), size:size});
  }
  for (let i = 0; i < 5; i++) mist.push({x:random(1), y:0.25+i*0.12, w:random(0.20,0.35)});
  for (let i = 0; i < 18; i++) lights.push({x:random(0.08,0.92), y:random(0.22,0.85), phase:random(120)});
  // Two butterflies visit flowers; four fireflies visit leaves.
  for (let i = 0; i < lilies.length && visitors.length < 2; i++) {
    if (lilies[i].flower) visitors.push({season:0, leaf:i, timer:0, x:lilies[i].x, y:lilies[i].y});
  }
  for (let i = 0; i < 4 && lilies.length > 0; i++) {
    let leaf = i % lilies.length;
    visitors.push({season:1, leaf:leaf, timer:i*45, x:lilies[leaf].x, y:lilies[leaf].y});
  }
  for (let i = 0; i < 4; i++) document.getElementById(seasonButtons[i]).disabled = false;
}

function updateTimeMechanic(state) {
  // Keep the existing music/season synchronisation.
  if(state.audioPlaying) {
    let musicSeason = 0;
    if(state.audioTime >= seasonStartTimes[3]) musicSeason = 3;
    else if(state.audioTime >= seasonStartTimes[2]) musicSeason = 2;
    else if(state.audioTime >= seasonStartTimes[1]) musicSeason = 1;

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

      seasonFrames = map(state.audioTime, seasonStartTimes[season],
                         seasonStartTimes[season+1], 0, 600);
    }
  } else if(autoChange) {

    seasonFrames++;
    if(seasonFrames >= 600) {
      season = (season + 1) % 4;
      seasonFrames = 0;
      updateLabels();
    }
  }

  // Button changes are immediate; automatic changes ease gradually.
  let look = seasonLooks[season], easing = 0.035;
  if (seasonSnap) easing = 1;
  leafScale = lerp(leafScale, look[0], easing);
  flowerScale = lerp(flowerScale, look[1], easing);
  leafR = lerp(leafR, look[2], easing);
  leafG = lerp(leafG, look[3], easing);
  leafB = lerp(leafB, look[4], easing);
  seasonSnap = false;

  // Winter starts with visible ice and snow.
  if (season !== lastSeason) {
    winterFrames = 0;
    if (season === 3) { iceAmount = 0.55; snowAmount = 0.18; snowCount = 35; }
  }
  lastSeason = season;
  let targetIce = 0, targetSnow = 0, flakes = 18;
  if (season === 3) {
    winterFrames++;
    let progress = constrain(winterFrames / 600, 0, 1);
    if (autoChange) progress = constrain(seasonFrames / 600, 0, 1);
    targetIce = constrain(0.55 + winterFrames / 90, 0.55, 1);
    targetSnow = constrain(0.18 + progress / 0.65, 0.18, 1);
    flakes = 90;
    if (progress < 0.4) flakes = map(progress, 0, 0.4, 18, 90);
    if (progress > 0.7) flakes = map(progress, 0.7, 1, 90, 0);
  }
  iceAmount = lerp(iceAmount, targetIce, 0.035);
  snowAmount = lerp(snowAmount, targetSnow, 0.035);
  snowCount = lerp(snowCount, flakes, 0.06);
  let targetMist = 0;
  if (season === 2) targetMist = 1;
  mistAmount = lerp(mistAmount, targetMist, 0.02);
  for (let i = 0; i < mist.length; i++) {
    mist[i].x += 0.16 / state.width;
    if (mist[i].x > 1 + mist[i].w) mist[i].x = -mist[i].w;
  }

  // Falling objects keep the teammate's gathering and release response.
  let speed = 1;
  if (season === 1) speed = 7;
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.y += speed / state.height;
    if (season === 1) p.x -= 2 / state.width;
    else p.x += 0.3 / state.width;
    applyInputToParticle(state, p);
    if (p.y > 1.02) { p.y = -0.02; p.x = random(1); }
    if (p.x > 1.02) p.x = -0.02;
    if (p.x < -0.02) p.x = 1.02;
  }

  // Both insects share a visit timer. Only their flight paths differ.
  timeFrame++;
  for (let i = 0; i < visitors.length; i++) {
    let bug = visitors[i];
    if (bug.season === season) {
      bug.timer++;
      let leaf = lilies[bug.leaf], x = leaf.x, y = leaf.y;
      if (season === 0) {
        y -= 0.012 * state.unit / state.height;
        if (bug.timer < 180) {
          x += cos(bug.timer * 2) * 0.035 * state.unit / state.width;
          y += sin(bug.timer * 2) * 0.025 * state.unit / state.height;
        }
        bug.x = lerp(bug.x, x, 0.045); bug.y = lerp(bug.y, y, 0.045);
      } else if (bug.timer > 180) {
        let progress = constrain((bug.timer - 180) / 90, 0, 1);
        bug.x = lerp(bug.startX, x, progress);
        bug.y = lerp(bug.startY, y, progress) - sin(progress * 180) * 0.04 * state.unit / state.height;
      } else { bug.x = x; bug.y = y; }
      if (season === 1 && bug.timer === 180) {
        bug.startX = bug.x; bug.startY = bug.y;
        if (lilies.length > 1) bug.leaf = (bug.leaf + Math.floor(random(1, lilies.length))) % lilies.length;
      }
      if (season === 1 && bug.timer >= 270) bug.timer = 0;
      if (season === 0 && bug.timer >= 300) {
        // Search forwards for the next flowering leaf.
        for (let step = 1; step <= lilies.length; step++) {
          let next = (bug.leaf + step) % lilies.length;
          if (lilies[next].flower) { bug.leaf = next; break; }
        }
        bug.timer = 0;
      }
    }
  }
}

function chooseSeason(next) {
  seekAudioTo(seasonStartTimes[next]);
  season = next; seasonFrames = 0; seasonSnap = true; seasonSeekFrames = 12;
  updateLabels();
}
function toggleAuto() { autoChange = !autoChange; updateLabels(); }
function updateLabels() {
  document.getElementById('status').textContent = seasonNames[season];
  for (let i = 0; i < 4; i++) document.getElementById(seasonButtons[i]).setAttribute('aria-pressed', i === season);
  let label = 'Auto: Off';
  if (autoChange) label = 'Auto: On';
  document.getElementById('auto').textContent = label;
}

function drawTimeMechanic(state) {
  push();
  noStroke();
  let filters = [[220,200,145,18], [30,65,105,35], [215,125,45,42], [150,175,210,48]];
  let colour = filters[season];
  fill(colour[0], colour[1], colour[2], colour[3]);
  rect(0, 0, state.width, state.height);

  // Ice and snow remain briefly while melting after winter.
  for (let i = 0; i < ice.length && iceAmount > 0.01; i++) {
    let p = ice[i], x = p.x * state.width, y = p.y * state.height;
    let size = p.size * state.unit * iceAmount;
    noStroke();
    fill(191,218,230,155 * iceAmount);
    ellipse(x,y,size*1.8,size*0.7);
    ellipse(x+size*0.35,y-size*0.14,size*1.2,size*0.5);
    fill(237,247,250,95 * iceAmount);
    ellipse(x-size*0.12,y-size*0.1,size*1.25,size*0.3);
    stroke(245,252,255,180 * iceAmount); strokeWeight(1);
    line(x-size*0.5,y,x+size*0.35,y+size*0.06);
    line(x,y+size*0.03,x+size*0.15,y-size*0.19);
    noStroke(); fill(250,252,255,225 * snowAmount);
    ellipse(x-size*0.22,y-size*0.12,size*0.9*snowAmount,size*0.24*snowAmount);
    ellipse(x+size*0.18,y-size*0.18,size*0.85*snowAmount,size*0.28*snowAmount);
  }
  for (let i = 0; i < mist.length && mistAmount > 0.01; i++) {
    let p = mist[i], x = p.x * state.width, y = p.y * state.height;
    let w = p.w * state.width, h = state.unit * 0.045;
    fill(237,233,222,16 * mistAmount);
    ellipse(x,y,w,h); ellipse(x-w*0.22,y+h*0.1,w*0.75,h*0.7);
  }

  // Spring reflections and summer rain rings.
  for (let i = 0; i < lights.length && season < 2; i++) {
    let p = lights[i], x = p.x * state.width, y = p.y * state.height;
    let progress = ((timeFrame + p.phase) % 120) / 120;
    if (season === 0) {
      let brightness = 1 - abs(progress * 2 - 1);
      noStroke(); fill(255,238,173,35 * brightness); ellipse(x,y,22,10);
      fill(255,248,207,180 * brightness); ellipse(x,y,7,2);
      stroke(255,248,207,160 * brightness); strokeWeight(1); line(x,y-3,x,y+3);
    } else {
      let size = (0.008 + progress * 0.045) * state.unit;
      noFill(); stroke(215,236,247,140 * (1-progress)); strokeWeight(1);
      ellipse(x,y,size,size*0.45);
      if (progress < 0.18) { line(x-2,y-2,x-4,y-6); line(x+2,y-2,x+4,y-6); }
    }
  }

  // Read-only visitors: their movement never writes to the lilies.
  for (let i = 0; i < visitors.length; i++) {
    let bug = visitors[i];
    if (bug.season === season) {
      let x = bug.x * state.width, y = bug.y * state.height - 3;
      noStroke();
      if (season === 0) {
        let wing = map(sin(timeFrame*14+i*90),-1,1,2,9);
        fill(248,194,105,235);
        if (i === 1) fill(199,167,232,235);
        ellipse(x-wing*0.45,y-3,wing,11); ellipse(x+wing*0.45,y-3,wing,11);
        ellipse(x-wing*0.35,y+4,wing*0.75,8); ellipse(x+wing*0.35,y+4,wing*0.75,8);
        stroke(88,65,66); strokeWeight(2); line(x,y-5,x,y+6);
        strokeWeight(1); line(x,y-5,x-3,y-8); line(x,y-5,x+3,y-8);
      } else {
        let glow = map(sin(timeFrame*4+i*70),-1,1,35,100);
        fill(255,239,114,glow*0.35); circle(x,y,23);
        fill(255,243,150,glow); circle(x,y,12);
        if (bug.timer > 180) {
          fill(241,251,231,185); ellipse(x-4,y-3,7,3); ellipse(x+4,y-3,7,3);
        }
        fill(250,246,139); ellipse(x,y,4,6);
        fill(76,87,46); circle(x,y-3,3);
      }
    }
  }

  // Falling petals, rain, leaves and snow stay above the pond details.
  for (let i = 0; i < particles.length; i++) {
    let p = particles[i], x = p.x * state.width, y = p.y * state.height;
    noStroke();
    if (season === 0) drawSakuraPetal(x,y,i*37);
    else if (season === 1) { stroke(190,220,245,175); strokeWeight(1.2); line(x,y,x-5,y+16); }
    else if (season === 2) drawMapleLeaf(x,y,i*47);
    else if (i < snowCount) { fill(255,255,255,225); circle(x,y,4); }
  }
  pop();
}

// Petal and maple leaf shapes.
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

  stroke(255,220,232,180);
  strokeWeight(1);
  line(0,5,-3,0);
  pop();
}

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

  stroke(126,65,32,220);
  strokeWeight(1);
  line(0,-7,0,11);
  line(0,3,-7,0);
  line(0,3,7,0);
  pop();
}
