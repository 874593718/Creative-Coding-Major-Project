// USER INPUT: spring bloom, summer dragging, autumn gathering, winter snow.
// AI assistance: ChatGPT/Codex helped draft and test this module.
// W2 arithmetic; W3 functions/objects/arrays; W4 conditions/loops;
// W6 mouse/key events and drawing; W7 dist/array operations; W8 transforms.
// No noise/random, lerp, vectors, physics engine, timers or pixel processing.
let inputHand;
let inputSeason = -1;
let inputLeaves = [];
let inputLeafSlot = 0;
let inputSnow = [];
let inputSnowSlot = 0;

function setupInputMechanic(state) {
  inputHand = {down:false, inside:false, x:0, y:0, startX:0, startY:0,
    moved:false, dragIndex:-1, lastTrailX:0, lastTrailY:0, held:[]};
  state.ripples = [];
  for (let i=0; i<lilies.length; i++) {
    let lily=lilies[i];
    lily.inputHomeX=lily.baseX; lily.inputHomeY=lily.baseY;
    lily.inputBloom=0; lily.inputTarget=0; lily.inputHover=0;
    lily.inputPushX=0; lily.inputPushY=0;
  }
  syncInputSeason();
}

// Fixed steps use ordinary comparisons and addition, not lerp().
function inputStep(value, target, step) {
  if (value<target) {value+=step; if(value>target) value=target;}
  else if(value>target) {value-=step; if(value<target) value=target;}
  return value;
}
function inputLimit(value, low, high) {
  if(value<low) return low;
  if(value>high) return high;
  return value;
}
function inputDistance(x1,y1,x2,y2,state) {
  return dist(x1*state.width,y1*state.height,x2*state.width,y2*state.height);
}
function inputCanvasPoint(x,y,state) {
  // Reserve the header and bottom HTML controls, avoiding button-click ripples.
  return x>=0 && x<=1 && y*state.height>86 && y*state.height<state.height-104;
}
function syncInputSeason() {
  if(inputSeason!==season) {
    inputHand.down=false; inputHand.dragIndex=-1;
    for(let i=0;i<particles.length;i++) {
      particles[i].inputHeld=false; particles[i].inputRelease=0;
      particles[i].inputRecycle=false;
    }
    inputHand.held=[]; inputLeaves=[]; inputSnow=[];
    inputLeafSlot=0; inputSnowSlot=0; inputSeason=season;
  }
}

function inputFindLily(state,x,y,flowerOnly) {
  let chosen=-1;
  let nearest=state.unit;
  if(leafScale<0.12) return chosen;
  for(let i=0;i<lilies.length;i++) {
    let lily=lilies[i];
    let dx=(x-lily.x)*state.width, dy=(y-lily.y)*state.height;
    let rx=lily.size*state.unit*leafScale*0.58, ry=rx*0.78;
    let d=dist(0,0,dx,dy);
    if((!flowerOnly || lily.flower) && dx*dx/(rx*rx)+dy*dy/(ry*ry)<1 && d<nearest) {
      chosen=i; nearest=d;
    }
  }
  return chosen;
}

function updateInputMechanic(state) {
  syncInputSeason();
  inputHand.x=mouseX/state.width; inputHand.y=mouseY/state.height;
  inputHand.inside=inputCanvasPoint(inputHand.x,inputHand.y,state);
  if(inputHand.down && inputHand.inside) {
    if(inputDistance(inputHand.x,inputHand.y,inputHand.startX,inputHand.startY,state)>6)
      inputHand.moved=true;
    if(season===1 && inputHand.dragIndex>=0) {
      let lily=lilies[inputHand.dragIndex];
      // Preserve the grab offset, avoiding a jump to the pad's centre.
      lily.baseX=inputLimit(inputHand.x+inputHand.grabX,0.04,0.96);
      lily.baseY=inputLimit(inputHand.y+inputHand.grabY,0.13,0.82);
      if(inputDistance(inputHand.x,inputHand.y,inputHand.lastTrailX,inputHand.lastTrailY,state)>state.unit*0.035) {
        addInputRipple(state,lily.baseX,lily.baseY);
        inputHand.lastTrailX=inputHand.x; inputHand.lastTrailY=inputHand.y;
      }
    }
    if(season===2 || season===3) gatherInputParticles(state);
    if(season===3 && inputDistance(inputHand.x,inputHand.y,inputHand.lastTrailX,inputHand.lastTrailY,state)>state.unit*0.025) {
      addInputSnow(inputHand.x,inputHand.y);
      inputHand.lastTrailX=inputHand.x; inputHand.lastTrailY=inputHand.y;
    }
  }
  let hover=-1;
  if(inputHand.inside) hover=inputFindLily(state,inputHand.x,inputHand.y,false);
  for(let i=0;i<lilies.length;i++) {
    let lily=lilies[i];
    let hoverTarget=0;
    if(i===hover || i===inputHand.dragIndex) hoverTarget=12;
    lily.inputHover=inputStep(lily.inputHover,hoverTarget,1);
    lily.inputBloom=inputStep(lily.inputBloom,lily.inputTarget,0.5);
    let pushX=0, pushY=0;
    let dx=(lily.x-inputHand.x)*state.width, dy=(lily.y-inputHand.y)*state.height;
    let d=dist(0,0,dx,dy), reach=state.unit*0.13;
    if(inputHand.inside && d>1 && d<reach && i!==inputHand.dragIndex) {
      // Small pads must remain clickable while they respond to the pointer.
      let amount=(1-d/reach)*lily.size*leafScale*0.16;
      pushX=dx/d*amount; pushY=dy/d*amount;
    }
    lily.inputPushX=inputStep(lily.inputPushX,pushX,0.0007);
    lily.inputPushY=inputStep(lily.inputPushY,pushY,0.0007);
  }
  let liveRipples=[];
  for(let i=0;i<state.ripples.length;i++) {
    let r=state.ripples[i]; r.age+=1; r.radius+=getPerlinRippleSpeed(r); r.strength=1-r.age/90;
    if(r.age<90) liveRipples.push(r);
  }
  state.ripples=liveRipples;
  let liveSnow=[];
  for(let i=0;i<inputSnow.length;i++) {
    inputSnow[i].age+=1;
    if(inputSnow[i].age<75) liveSnow.push(inputSnow[i]);
  }
  inputSnow=liveSnow;
}

function handleInputPressed(state,x,y) {
  syncInputSeason();
  if(!inputCanvasPoint(x,y,state)) return;
  inputHand.down=true; inputHand.x=x; inputHand.y=y;
  inputHand.startX=x; inputHand.startY=y;
  inputHand.lastTrailX=x; inputHand.lastTrailY=y;
  inputHand.moved=false; inputHand.dragIndex=-1;
  if(season===1) {
    inputHand.dragIndex=inputFindLily(state,x,y,false);
    if(inputHand.dragIndex>=0) {
      let lily=lilies[inputHand.dragIndex];
      inputHand.grabX=lily.x-x; inputHand.grabY=lily.y-y;
    }
  }
  if(season===2 || season===3) gatherInputParticles(state);
}
function handleInputReleased(state,x,y) {
  syncInputSeason();
  if(!inputHand.down) return;
  if(inputDistance(x,y,inputHand.startX,inputHand.startY,state)>6) inputHand.moved=true;
  if(!inputHand.moved && inputCanvasPoint(x,y,state)) {
    let flower=inputFindLily(state,x,y,true);
    if((season===0 || season===1) && flower>=0) {
      let lily=lilies[flower];
      if(lily.inputTarget===30) lily.inputTarget=0;
      else lily.inputTarget=30;
    } else addInputRipple(state,x,y);
  }
  releaseInputParticles(state);
  inputHand.down=false; inputHand.dragIndex=-1;
}
function addInputRipple(state,x,y) {
  // Team schema: relative centre, short-side radius, strength, age in frames.
  if(state.ripples.length>=12) {
    for(let i=0;i<state.ripples.length-1;i++) state.ripples[i]=state.ripples[i+1];
    state.ripples.pop();
  }
  state.ripples.push(createPerlinRipple(x,y));
}

function gatherInputParticles(state) {
  for(let i=0;i<particles.length;i++) {
    let p=particles[i];
    if(!p.inputHeld && inputHand.held.length<25 &&
       inputDistance(p.x,p.y,inputHand.x,inputHand.y,state)<state.unit*0.19) {
      p.inputHeld=true; p.inputSlot=inputHand.held.length; p.inputRelease=0;
      inputHand.held.push(p);
    }
  }
}
function releaseInputParticles(state) {
  for(let i=0;i<inputHand.held.length;i++) {
    let p=inputHand.held[i];
    if(season===2) {
      let leaf={x:p.x,y:p.y,angle:i*47};
      if(inputLeaves.length<40) inputLeaves.push(leaf);
      else {inputLeaves[inputLeafSlot]=leaf; inputLeafSlot=(inputLeafSlot+1)%40;}
      // Ask the time module to recycle it next update, spread across the sky.
      p.inputRecycle=true;
    } else if(season===3) p.inputRelease=35;
    p.inputHeld=false;
  }
  inputHand.held=[];
}
// Called inside the time module's update: a single writer changes positions.
function applyInputToParticle(state,p) {
  if(p.inputRecycle) {
    p.x=(p.inputSlot*0.137+0.09)%1;
    p.y=-0.03-p.inputSlot*0.027;
    p.inputRecycle=false;
  } else if(p.inputHeld) {
    // W8 sin/cos: a small, uneven spiral avoids a rigid rectangular bundle.
    let angle=p.inputSlot*137;
    let radius=state.unit*(0.012+p.inputSlot*0.002);
    let tx=inputLimit(inputHand.x,0.04,0.96)+cos(angle)*radius/state.width;
    let ty=inputLimit(inputHand.y,0.14,0.81)+sin(angle)*radius*0.7/state.height;
    p.x=inputStep(p.x,tx,10/state.width); p.y=inputStep(p.y,ty,10/state.height);
  } else if(p.inputRelease>0) {
    p.x+=(p.inputSlot%5-2)*0.0009*p.inputRelease/35;
    p.inputRelease-=1;
  }
}
function addInputSnow(x,y) {
  let trace={x:x,y:y,age:0};
  if(inputSnow.length<40) inputSnow.push(trace);
  else {inputSnow[inputSnowSlot]=trace; inputSnowSlot=(inputSnowSlot+1)%40;}
}

// Called only by the Perlin module. Offset values are short-side fractions.
function getInputLilyOffset(lily,state) {
  let x=lily.inputPushX, y=lily.inputPushY;
  for(let i=0;i<state.ripples.length;i++) {
    let r=state.ripples[i];
    let dx=(lily.baseX-r.x)*state.width, dy=(lily.baseY-r.y)*state.height/0.72;
    let d=dist(0,0,dx,dy), band=state.unit*0.035;
    let gap=d-r.radius*state.unit;
    if(gap<0) gap=-gap;
    if(d>1 && gap<band) {
      let amount=(1-gap/band)*r.strength*0.012;
      x+=dx/d*amount; y+=dy/d*amount*0.72;
    }
  }
  return {x:inputLimit(x,-0.035,0.035),y:inputLimit(y,-0.035,0.035)};
}
function inputLilyIsDragged(lily) {
  return inputHand.down && inputHand.dragIndex>=0 && lilies[inputHand.dragIndex]===lily;
}

// Three RGB channels only. Contrast changes use ordinary arithmetic.
// This avoids relying on an unverified fourth alpha argument in our module.
function inputWaterColour(r,g,b,amount) {
  let water=pondPalette[0];
  return [water[0]+(r-water[0])*amount,
    water[1]+(g-water[1])*amount,water[2]+(b-water[2])*amount];
}

function drawInputMechanic(state) {
  push(); noFill(); strokeWeight(1.2);
  for(let i=0;i<state.ripples.length;i++) {
    let r=state.ripples[i], size=r.radius*state.unit*2;
    let colour=inputWaterColour(214,235,219,r.strength*0.65);
    stroke(colour[0],colour[1],colour[2]);
    strokeWeight(0.3+r.strength);
    ellipse(r.x*state.width,r.y*state.height,size,size*0.72);
    colour=inputWaterColour(145,195,195,r.strength*0.35);
    stroke(colour[0],colour[1],colour[2]);
    ellipse(r.x*state.width,r.y*state.height,size*0.82,size*0.59);
  }
  for(let i=0;i<lilies.length;i++) {
    let l=lilies[i];
    if(l.inputHover>0 && leafScale>0.12) {
      let size=l.size*state.unit*leafScale*1.18;
      let colour=inputWaterColour(255,243,190,l.inputHover/12);
      stroke(colour[0],colour[1],colour[2]);
      strokeWeight(1.1);
      ellipse(l.x*state.width,l.y*state.height,size,size*0.78);
    }
  }
  if(season===2) {
    for(let i=0;i<inputLeaves.length;i++) {
      let l=inputLeaves[i]; drawMapleLeaf(l.x*state.width,l.y*state.height,l.angle);
    }
  }
  if(season===3) {
    noStroke();
    for(let i=0;i<inputSnow.length;i++) {
      let t=inputSnow[i], x=t.x*state.width, y=t.y*state.height;
      let remaining=1-t.age/75;
      let colour=inputWaterColour(239,247,255,remaining*0.8);
      fill(colour[0],colour[1],colour[2]);
      ellipse(x,y,9*remaining,5*remaining);
      ellipse(x-6,y+7,3*remaining,3*remaining);
      ellipse(x+7,y-6,3*remaining,3*remaining);
    }
  }
  pop();
}

// Keep the team's seasonal size; use a separate opening state for each flower.
function drawInputLilyFlower(lily,size) {
  let opening=lily.inputBloom/30;
  if(opening>=1) {drawLilyFlower(size); return;}
  push(); translate(-size*0.12,-size*0.10);
  for(let petal=0;petal<7;petal++) {
    push(); rotate(petal*360/7*opening);
    fill(pondPalette[4][0],pondPalette[4][1],pondPalette[4][2]);
    ellipse(0,-size*0.14,size*(0.11+opening*0.04),size*0.34);
    fill(248,226,222); ellipse(0,-size*0.10,size*0.07,size*0.20); pop();
  }
  fill(224,184,90); circle(0,0,size*(0.04+opening*0.11)); pop();
}

function handleInputKey(state,pressedKey) {
  if(pressedKey==='b' || pressedKey==='B') {
    for(let i=0;i<lilies.length;i++) lilies[i].inputTarget=30;
  } else if(pressedKey==='r' || pressedKey==='R') {
    for(let i=0;i<lilies.length;i++) {
      lilies[i].inputTarget=0;
      lilies[i].baseX=lilies[i].inputHomeX; lilies[i].baseY=lilies[i].inputHomeY;
    }
    inputHand.down=false; inputHand.dragIndex=-1;
    for(let i=0;i<particles.length;i++) {
      particles[i].inputHeld=false; particles[i].inputRelease=0;
      particles[i].inputRecycle=false;
    }
    inputHand.held=[]; state.ripples=[]; inputLeaves=[]; inputSnow=[];
  }
}
