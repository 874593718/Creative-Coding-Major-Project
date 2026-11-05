// User Input controls the flowers, lily pads, leaves, snow and ice.
// It uses variables, functions, arrays, conditions, loops, mouse/key events,
// distance checks, basic shapes and drawing transforms from Weeks 1–8.
// AI assistance: ChatGPT/Codex helped draft and test this module.

// These variables keep the state between frames.
let inputHand;
let inputSeason = -1;
let inputLeaves = [];
let inputLeafQueue = [];
let inputSnow = [];
let inputSnowQueue = [];
let inputCracks = [];
let inputCrackCount = 0;

// Set the starting values for this mechanic.
function setupInputMechanic(state) {
  inputHand = {down:false, inside:false, x:0, y:0, startX:0, startY:0,
    moved:false, dragIndex:-1, lastTrailX:0, lastTrailY:0, held:[]};
  state.ripples = [];
  inputLeaves = []; inputLeafQueue = [];
  inputSnow = []; inputSnowQueue = [];
  inputCracks = []; inputCrackCount = 0;
  for (let i=0; i<lilies.length; i++) {
    let lily=lilies[i];
    lily.inputHomeX=lily.baseX; lily.inputHomeY=lily.baseY;
    lily.inputBloom=0; lily.inputTarget=0; lily.inputHover=0;
    lily.inputPushX=0; lily.inputPushY=0;
  }
  syncInputSeason();
}

// Move a value toward its target by a small amount each frame.
function inputStep(value, target, step) {
  if (value<target) {value+=step; if(value>target) value=target;}
  else if (value>target) {value-=step; if(value<target) value=target;}
  return value;
}
// Keep a value between a minimum and maximum.
function inputLimit(value, low, high) {
  if(value<low) return low;
  if(value>high) return high;
  return value;
}
// Find the distance between two positions on the canvas.
function inputDistance(x1, y1, x2, y2, state) {
  return dist(x1*state.width,y1*state.height,x2*state.width,y2*state.height);
}
// Ignore clicks on the page instructions and season buttons.
function inputCanvasPoint(x, y, state) {
  // Reserve the header and bottom HTML controls, avoiding button-click ripples.
  return x>=0 && x<=1 && y*state.height>86 && y*state.height<state.height-104;
}
// Clear temporary input effects when the season changes.
function syncInputSeason() {
  if(inputSeason!==season) {
    inputHand.down=false; inputHand.dragIndex=-1;
    for(let i=0;i<particles.length;i++) {
      particles[i].inputHeld=false; particles[i].inputRelease=0;
      particles[i].inputRecycle=false;
    }
    inputHand.held=[]; inputLeaves=[]; inputLeafQueue=[];
    inputSnow=[]; inputSnowQueue=[]; inputCracks=[]; inputCrackCount=0;
    inputSeason=season;
  }
}

// Find the nearest lily under the mouse. Flower clicks only count on flowers.
function inputFindLily(state, x, y, flowerOnly) {
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

// Update mouse actions and the visual responses for this frame.
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
    if(season===2 || (season===3 && inputHand.moved)) gatherInputParticles(state);
    if(season===3 && inputDistance(inputHand.x,inputHand.y,inputHand.lastTrailX,inputHand.lastTrailY,state)>state.unit*0.025) {
      let snowMark = {x:inputHand.x, y:inputHand.y, age:0, fadeAmount:1, fading:false};
      addInputTrail(snowMark, inputSnow, inputSnowQueue);
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

  let liveLeaves=[], fadingLeaves=0;
  for(let i=0;i<inputLeaves.length;i++) {
    let leaf=inputLeaves[i];
    if(leaf.fading) {
      fadingLeaves++;
      leaf.fadeAmount-=0.025;
      if(leaf.fadeAmount<0) leaf.fadeAmount=0;
    }
    if(leaf.fadeAmount>0) liveLeaves.push(leaf);
  }
  inputLeaves=liveLeaves;
  if(inputLeafQueue.length>0 && inputLeaves.length>=40 && fadingLeaves===0) {
    for(let i=0;i<inputLeaves.length;i++) inputLeaves[i].fading=true;
  }
  // Let a few new leaves appear while the older cluster is still fading.
  if(inputLeaves.length<80 && inputLeafQueue.length>0) {
    inputLeaves.push(inputLeafQueue[0]);
    let nextLeaves=[];
    for(let i=1;i<inputLeafQueue.length;i++) nextLeaves.push(inputLeafQueue[i]);
    inputLeafQueue=nextLeaves;
  }

  let liveSnow=[], fadingSnow=0;
  for(let i=0;i<inputSnow.length;i++) {
    let trace=inputSnow[i]; trace.age+=1;
    if(trace.fading) {
      fadingSnow++;
      trace.fadeAmount-=0.025;
      if(trace.fadeAmount<0) trace.fadeAmount=0;
    }
    if(trace.age<120 && trace.fadeAmount>0) liveSnow.push(trace);
  }
  inputSnow=liveSnow;
  if(inputSnowQueue.length>0 && inputSnow.length>=40 && fadingSnow===0) {
    for(let i=0;i<inputSnow.length;i++) inputSnow[i].fading=true;
  }
  // Snow trails overlap during the short handover instead of replacing in place.
  if(inputSnow.length<80 && inputSnowQueue.length>0) {
    inputSnow.push(inputSnowQueue[0]);
    let nextSnow=[];
    for(let i=1;i<inputSnowQueue.length;i++) nextSnow.push(inputSnowQueue[i]);
    inputSnowQueue=nextSnow;
  }

}

// Remember where the mouse press started.
// Mouse input
function handleInputPressed(state, x, y) {
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
  if(season===2) gatherInputParticles(state);
}
// Decide whether the mouse action was a click or a drag.
function handleInputReleased(state, x, y) {
  syncInputSeason();
  if(!inputHand.down) return;
  if(inputDistance(x,y,inputHand.startX,inputHand.startY,state)>6) inputHand.moved=true;
  if(!inputHand.moved && inputCanvasPoint(x,y,state)) {
    let flower=inputFindLily(state,x,y,true);
    if((season===0 || season===1) && flower>=0) {
      let lily=lilies[flower];
      if(lily.inputTarget===30) lily.inputTarget=0;
      else lily.inputTarget=30;
    } else if(season===3) {
      let iceIndex=inputFindIceFloe(state,x,y);
      if(iceIndex>=0) addInputIceCrack(state,x,y,ice[iceIndex],iceIndex);
      else addInputRipple(state,x,y);
    } else {
      addInputRipple(state,x,y);
    }
  }
  releaseInputParticles(state);
  inputHand.down=false; inputHand.dragIndex=-1;
}

// Find the ice floe under the mouse.
// Winter interaction
function inputFindIceFloe(state, x, y) {
  if(typeof ice==='undefined' || typeof iceAmount==='undefined' || iceAmount<0.1) return -1;
  let chosen=-1, nearest=state.unit;
  for(let i=0;i<ice.length;i++) {
    let floe=ice[i];
    let dx=(x-floe.x)*state.width, dy=(y-floe.y)*state.height;
    let rx=floe.size*state.unit*0.9*iceAmount;
    let ry=floe.size*state.unit*0.35*iceAmount;
    let distance=dist(0,0,dx,dy);
    if(dx*dx/(rx*rx)+dy*dy/(ry*ry)<1 && distance<nearest) {
      chosen=i; nearest=distance;
    }
  }
  return chosen;
}

// Add one lasting crack to a floe. Each floe can have one crack.
function addInputIceCrack(state, x, y, floe, floeIndex) {
  for(let i=0;i<inputCracks.length;i++) {
    if(inputCracks[i].floeIndex===floeIndex) return;
  }
  let dx=(x-floe.x)*state.width, dy=(y-floe.y)*state.height;
  let rx=floe.size*state.unit*0.9*iceAmount;
  let ry=floe.size*state.unit*0.35*iceAmount;
  let edgePosition=dx*dx/(rx*rx)+dy*dy/(ry*ry);
  let lengthFactor=inputLimit(0.18+(1-edgePosition)*0.34,0.18,0.52);
    // Move the crack toward the centre so it stays on the ice.
  let crackX=floe.x+(x-floe.x)*0.15;
  let crackY=floe.y+(y-floe.y)*0.15;
  let crack={x:crackX,y:crackY,size:floe.size*lengthFactor,
    angle:(inputCrackCount%2)*90,floeIndex:floeIndex};
  inputCrackCount++;
  inputCracks.push(crack);
}

// Add a ripple at the mouse position.
function addInputRipple(state, x, y) {
  // Team schema: relative centre, short-side radius, strength, age in frames.
  if(state.ripples.length>=12) {
    for(let i=0;i<state.ripples.length-1;i++) state.ripples[i]=state.ripples[i+1];
    state.ripples.pop();
  }
  state.ripples.push(createPerlinRipple(x,y));
}

// Gather nearby leaves or snow while the mouse is held.
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
      let leaf = {x:p.x, y:p.y, angle:i*47, fadeAmount:1, fading:false};
      addInputTrail(leaf, inputLeaves, inputLeafQueue);
      // The time module moves it back above the canvas.
      p.inputRecycle=true;
    } else if(season===3) p.inputRelease=35;
    p.inputHeld=false;
  }
  inputHand.held=[];
}

// Add a leaf or snow mark, then fade the old group if the list is full.
function addInputTrail(mark, marks, markQueue) {
  if(marks.length<40 && markQueue.length===0) marks.push(mark);
  else {
    markQueue.push(mark);
    for(let i=0;i<marks.length;i++) marks[i].fading=true;
  }
}

// Called by the time module to move gathered objects and release them.
function applyInputToParticle(state,p) {
  if(p.inputRecycle) {
    p.x=(p.inputSlot*0.137+0.09)%1;
    p.y=-0.03-p.inputSlot*0.027;
    p.inputRecycle=false;
  } else if(p.inputHeld) {
    // Place the gathered objects in a loose circle around the cursor.
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
// Give the Perlin module the small movement caused by the pointer.
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

// Mix a highlight colour with the pond colour.
function inputWaterColour(r,g,b,amount) {
  let water=pondPalette[0];
  return [water[0]+(r-water[0])*amount,
    water[1]+(g-water[1])*amount,water[2]+(b-water[2])*amount];
}

// Draw ripples, highlights, collected leaves and snow marks.
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
    for(let i=0;i<inputLeaves.length;i++) drawInputCollectedLeaf(inputLeaves[i],state);
  }
  if(season===3) {
    noStroke();
    for(let i=0;i<inputSnow.length;i++) {
      let t=inputSnow[i], x=t.x*state.width, y=t.y*state.height;
      let remaining=(1-t.age/120)*t.fadeAmount;
      let colour=inputWaterColour(239,247,255,remaining*0.8);
      fill(colour[0],colour[1],colour[2]);
      ellipse(x,y,9*remaining,5*remaining);
      ellipse(x-6*remaining,y+7*remaining,3*remaining,3*remaining);
      ellipse(x+7*remaining,y-6*remaining,3*remaining,3*remaining);
    }
  }
  pop();
}

// Draw cracks after the ice so they stay visible.
function drawInputIceCracks(state) {
  push();
  noFill();
  for(let i=0;i<inputCracks.length;i++) drawInputIceCrack(inputCracks[i],state);
  pop();
}

function drawInputCollectedLeaf(leaf,state) {
  let size=leaf.fadeAmount;
  let outer=inputWaterColour(220,105,40,size);
  let veins=inputWaterColour(126,65,32,size);
  push(); translate(leaf.x*state.width,leaf.y*state.height); rotate(leaf.angle);
  noStroke(); fill(outer[0],outer[1],outer[2]);
  ellipse(0,2*size,10*size,9*size);
  triangle(-4*size,3*size,0,-12*size,4*size,3*size);
  triangle(0,5*size,-9*size,-7*size,-5*size,6*size);
  triangle(0,5*size,9*size,-7*size,5*size,6*size);
  triangle(0,6*size,-12*size,0,-6*size,7*size);
  triangle(0,6*size,12*size,0,6*size,7*size);
  stroke(veins[0],veins[1],veins[2]); strokeWeight(1);
  line(0,-7*size,0,11*size); line(0,3*size,-7*size,0); line(0,3*size,7*size,0);
  pop();
}

function drawInputIceCrack(crack,state) {
  let size=crack.size*state.unit*iceAmount;
  let colour=inputWaterColour(18,32,42,1);
  push(); translate(crack.x*state.width,crack.y*state.height); rotate(crack.angle);
  noFill(); stroke(colour[0],colour[1],colour[2]); strokeWeight(1.8);
  // A short fracture with two branches, kept well inside the floe's oval.
  line(-size*0.46,size*0.04,-size*0.20,-size*0.03);
  line(-size*0.20,-size*0.03,size*0.03,size*0.09);
  line(size*0.03,size*0.09,size*0.22,-size*0.13);
  line(size*0.22,-size*0.13,size*0.48,-size*0.08);
  line(-size*0.20,-size*0.03,-size*0.34,-size*0.22);
  line(size*0.22,-size*0.13,size*0.36,-size*0.30);
  pop();
}

// Draw a flower between its closed and open states.
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

// Keyboard input shared by all seasons.
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
    inputHand.held=[]; state.ripples=[];
    inputLeaves=[]; inputLeafQueue=[]; inputSnow=[]; inputSnowQueue=[];
    inputCracks=[]; inputCrackCount=0;
  }
}
