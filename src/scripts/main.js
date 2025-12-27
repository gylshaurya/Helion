import { Camera } from './camera.js';
import { Body } from './bodies.js';
import { getMousePos} from './utils.js';
import { drawScene } from './render.js';

// ================== CONSTANTS ==================
const G = 0.5;
const SUN_MASS = 10000;

const FIXED_DT = 1 / 120;
const MAX_STEPS_PER_FRAME = 10;
const TRAIL_DT = 1 / 30;

const TRAIL_STEP = 1;
const STORAGE_KEY = 'animation_state';

const EDIT_MOVE_SPEED = 10;
const keys = new Set();

const MERGE_PENETRATION_RATIO = 0.35; 

const MIN_TIME = 0.1;
const MAX_TIME = 100;

// ================== UI STATE ==================
let SHOW_TRAILS = true;
let SHOW_VELOCITY = true;
let SHOW_FORCE = true;
let SHOW_ORBITS = true;

let IS_PAUSED = false;
let IS_RESETTING = false;

let MODE = 'VIEW';

let lastTime = performance.now();
let trailCounter = 0;

let selectedBody = null;
let inspectedBody = null;
let shouldShow = false;

let ghostBody = null;
let velocityStart = null;

let isPanning = false;
let lastMouse = null;

let isEditingVelocity = false;
let velocityEditStart = null;

let accumulator = 0;
let trailTimer = 0;

let TIME_SCALE = 10;
let MAX_TRAIL_LENGTH = 150000;

let cameraLoadedFromState = false;

let newBodyConfig = {
  mass: 100,
  size: 20,
  color: '#ffffff',
};

// ================== CANVAS ==================
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================== CAMERA ==================
const cam = new Camera();
cam.x = canvas.width / 2;
cam.y = canvas.height / 2;

// ================== IMAGES ==================
const SUN_IMAGE = new Image();
SUN_IMAGE.src = '../assets/sun.svg';

const MERCURY_IMAGE = new Image();
MERCURY_IMAGE.src = '../assets/mercury.png';

const VENUS_IMAGE = new Image();
VENUS_IMAGE.src = '../assets/venus.png';

const EARTH_IMAGE = new Image();
EARTH_IMAGE.src = '../assets/earth.svg';

const MARS_IMAGE = new Image();
MARS_IMAGE.src = '../assets/mars.svg';

const JUPITER_IMAGE = new Image();
JUPITER_IMAGE.src = '../assets/jupiter.png';

const SATURN_IMAGE = new Image();
SATURN_IMAGE.src = '../assets/saturn.png';

const URANUS_IMAGE = new Image();
URANUS_IMAGE.src = '../assets/uranus.png';

const NEPTUNE_IMAGE = new Image();
NEPTUNE_IMAGE.src = '../assets/neptune.png';

// ================== BODIES ==================
const bodies = [
  new Body({
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    mass: SUN_MASS,
    size: 120,
    image: SUN_IMAGE
  }),

  makePlanet(150, 0.2, 20, 18, MERCURY_IMAGE),
  makePlanet(300, 1.1, 40, 26, VENUS_IMAGE),
  makePlanet(450, 2.3, 50, 30, EARTH_IMAGE),
  makePlanet(600, 3.7, 30, 24, MARS_IMAGE),
  makePlanet(900, 0.9, 300, 70, JUPITER_IMAGE),
  makePlanet(1200, 2.0, 250, 65, SATURN_IMAGE),
  makePlanet(1500, 4.1, 120, 50, URANUS_IMAGE),
  makePlanet(1800, 5.2, 120, 50, NEPTUNE_IMAGE)
];


// ================== TOOLBAR ==================
const pauseBtn = document.getElementById('pauseBtn');
const pauseIcon = document.getElementById('pauseIcon');
const addBodyBtn = document.getElementById('addBodyBtn');
const resetBtn = document.getElementById('resetBtn');
const recenterBtn = document.getElementById('recenterBtn');

const toggleTrails = document.getElementById('toggleTrails');
const toggleVelocity = document.getElementById('toggleVelocity');
const toggleForce = document.getElementById('toggleForce');

const massSlider = document.getElementById('massSlider');
const radiusSlider = document.getElementById('radiusSlider');
const colorPicker = document.getElementById('colorPicker');

const infoPanel = document.getElementById('body-info');
const bodyControlsPanel = document.getElementById('body-controls');

const timeSlider = document.getElementById('timeScaleSlider');
const timeLabel = document.getElementById('timeScaleValue');

// ================== LOAD / SAVE ==================
loadState();
window.addEventListener('beforeunload', saveState);

// ================== UI EVENTS ==================
toggleTrails.onchange = e => SHOW_TRAILS = e.target.checked;
toggleVelocity.onchange = e => SHOW_VELOCITY = e.target.checked;
toggleForce.onchange = e => SHOW_FORCE = e.target.checked;

function makePlanet(r, angle, mass, size, image, color) {
  const speed = Math.sqrt(G * SUN_MASS / r);

  return new Body({
    x: Math.cos(angle) * r,
    y: Math.sin(angle) * r,
    vx: -Math.sin(angle) * speed,
    vy:  Math.cos(angle) * speed,
    mass,
    size,
    image,
    color
  });
}

function updateBodyControlsVisibility() {
  shouldShow = MODE === 'ADD' || (MODE === 'VIEW' && selectedBody !== null);

  bodyControlsPanel.classList.toggle('hidden', !shouldShow);
}

function showInfoPanel() {
  infoPanel.classList.remove('hidden');
}

function updateInfoPanel(body) {
  const panel = document.getElementById('body-info');

  if (!body) {
    panel.classList.add('hidden');
    panel.innerHTML = '';
    return;
  }

  const speed = Math.hypot(body.vx, body.vy);
  const forceMag = Math.hypot(body.force.x, body.force.y);

  panel.classList.remove('hidden');
  panel.innerHTML = `
    <h3>Body Info</h3>
    <div><b>Mass</b><span>${body.mass.toFixed(1)}</span></div>
    <div><b>Radius</b><span>${(body.size / 2).toFixed(1)}</span></div>
    <div><b>X</b><span>${body.x.toFixed(1)}</span></div>
    <div><b>Y</b><span>${body.y.toFixed(1)}</span></div>
    <div><b>Vx</b><span>${body.vx.toFixed(1)}</span></div>
    <div><b>Vy</b><span>${body.vy.toFixed(1)}</span></div>
    <div><b>Speed</b><span>${speed.toFixed(1)}</span></div>
    <div><b>Force</b><span>${forceMag.toFixed(1)}</span></div>
  `;
}

function hideInfoPanel() {
  infoPanel.classList.add('hidden');
  inspectedBody = null;
}

function recenterAndFit() {
  
  let totalMass = 0;
  let cx = 0, cy = 0;

  for (const b of bodies) {
    totalMass += b.mass;
    cx += b.x * b.mass;
    cy += b.y * b.mass;
  }

  cx /= totalMass;
  cy /= totalMass;

  let maxR = 0;
  for (const b of bodies) {
    const r = Math.hypot(b.x - cx, b.y - cy) + b.size / 2;
    if (r > maxR) maxR = r;
  }

  const padding = -100;
  const viewSize = Math.min(canvas.width, canvas.height);
  cam.scale = viewSize / (2 * (maxR + padding));

  cam.x = canvas.width / (2 * cam.scale) - cx;
  cam.y = canvas.height / (2 * cam.scale) - cy;
}


function updateEditorMovement(dt) {
  if (!IS_PAUSED || !selectedBody) return;

  let dx = 0;
  let dy = 0;

  if (keys.has('w') || keys.has('arrowup')) dy -= 1;
  if (keys.has('s') || keys.has('arrowdown')) dy += 1;
  if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
  if (keys.has('d') || keys.has('arrowright')) dx += 1;

  if (dx == 0 && dy == 0) return;

  const len = Math.hypot(dx, dy);
  dx /= len;
  dy /= len;

  selectedBody.x += dx * EDIT_MOVE_SPEED * dt;
  selectedBody.y += dy * EDIT_MOVE_SPEED * dt;

  selectedBody.trail.length = 0;
}

function sliderToTime(v) {
  const t = v / 100; // normalized 0 → 1
  return MIN_TIME * Math.pow(MAX_TIME / MIN_TIME, t);
}


timeSlider.addEventListener('input', e => {
  TIME_SCALE = sliderToTime(+e.target.value);
  timeLabel.textContent = TIME_SCALE.toFixed(2) + '×';
});


function pickBodyAt(x, y) {
  for (let i = bodies.length - 1; i >= 0; i--) {
    const b = bodies[i];
    const r = b.size / 2;
    const dx = x - b.x;
    const dy = y - b.y;
    if (dx * dx + dy * dy <= r * r) {
      return b;
    }
  }
  return null;
}


pauseBtn.onclick = () => {
  IS_PAUSED = !IS_PAUSED;
  pauseIcon.src = IS_PAUSED ? '../assets/play.png' : '../assets/pause.png';

  inspectedBody = null;
  
  if (!IS_PAUSED) {
    selectedBody = null;
    updateBodyControlsVisibility();
  }
};

addBodyBtn.onclick = () => {
  IS_PAUSED = true;
  pauseIcon.src = IS_PAUSED ? '../assets/play.png' : '../assets/pause.png';
  MODE = 'ADD';
  ghostBody = null;

  hideInfoPanel();
  updateBodyControlsVisibility();

  massSlider.value = newBodyConfig.mass;
  radiusSlider.value = newBodyConfig.size;
  colorPicker.value = newBodyConfig.color;
};

recenterBtn.onclick = () => {
    recenterAndFit();
};

resetBtn.onclick = () => {
  IS_RESETTING = true;
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

// ================== ADD BODY CONTROLS ==================
massSlider.oninput = e => {
  const v = +e.target.value;
  if (selectedBody) {
    selectedBody.mass = v;
  } else {
    newBodyConfig.mass = v;
  }
};

radiusSlider.oninput = e => {
  const v = +e.target.value;
  if (selectedBody) {
    selectedBody.size = v;
  } else {
    newBodyConfig.size = v;
  }
};

colorPicker.oninput = e => {
  const v = e.target.value;
  if (selectedBody) {
    selectedBody.color = v;
    selectedBody.image = null;
  } else {
    newBodyConfig.color = v;
  }
};

// ================== INPUT ==================

window.addEventListener('keydown', e => {

  if (e.code === 'Space') {
    e.preventDefault();

    IS_PAUSED = !IS_PAUSED;
    pauseIcon.src = IS_PAUSED ? '../assets/play.png' : '../assets/pause.png';

    if (!IS_PAUSED) {
      selectedBody = null;
      isEditingVelocity = false;
      updateBodyControlsVisibility();
    }
    return;
  }

  if(IS_PAUSED && selectedBody){
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const index = bodies.indexOf(selectedBody);
        if (index !== -1) {
            bodies.splice(index, 1);
            selectedBody = null;
        }
    }
  }

  const key = e.key.toLowerCase();
  if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {
    keys.add(key);
  }
});


window.addEventListener('keyup', e => {
  keys.delete(e.key.toLowerCase());
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) lastTime = performance.now();
});

// ============= MOUSE INPUTS =================
canvas.addEventListener('mousedown', e => {
  const mouse = getMousePos(canvas, e);
  const world = cam.screenToWorld(mouse.x, mouse.y);

  // ---------- ADD MODE ----------
  if (MODE === 'ADD') {
    ghostBody = { x: world.x, y: world.y, vx: 0, vy: 0 };
    velocityStart = world;
    return;
  }

  // ---------- RUNNING: INSPECT ----------
  if (MODE === 'VIEW' && !IS_PAUSED) {
    const hit = pickBodyAt(world.x, world.y);

    if (hit) {
      inspectedBody = hit;
      showInfoPanel(hit);
      
      return;
    } else {
      inspectedBody = null;
      hideInfoPanel();
    
    }
  }

  // ---------- PAUSED: EDIT ----------
  if (MODE === 'VIEW' && IS_PAUSED) {
    const hit = pickBodyAt(world.x, world.y);

    if (hit) {
      selectedBody = hit;
      massSlider.value = hit.mass;
      radiusSlider.value = hit.size;
      colorPicker.value = hit.color || '#ffffff';

      isEditingVelocity = true;
      velocityEditStart = { x: hit.x, y: hit.y };
      return;
    } else {
      selectedBody = null;
    }
  }

  // ---------- PANNING ----------
  isPanning = true;
  lastMouse = mouse;
});


canvas.addEventListener('mousemove', e => {
  const mouse = getMousePos(canvas, e);

  if (MODE === 'ADD' && ghostBody) {
    const world = cam.screenToWorld(mouse.x, mouse.y);
    ghostBody.vx = (world.x - velocityStart.x) * 0.05;
    ghostBody.vy = (world.y - velocityStart.y) * 0.05;
    return;
  }

  if (IS_PAUSED && isEditingVelocity && selectedBody) {
    const world = cam.screenToWorld(mouse.x, mouse.y);

    selectedBody.vx = (world.x - velocityEditStart.x) * 0.05;
    selectedBody.vy = (world.y - velocityEditStart.y) * 0.05;

    return;
  }

  if (MODE === 'VIEW' && isPanning) {
    cam.x += (mouse.x - lastMouse.x) / cam.scale;
    cam.y += (mouse.y - lastMouse.y) / cam.scale;
    lastMouse = mouse;
  }
});

canvas.addEventListener('mouseup', () => {

  if (isEditingVelocity) {
  isEditingVelocity = false;
  velocityEditStart = null;
}

  if (MODE === 'ADD' && ghostBody) {
    bodies.push( new Body({
    x: ghostBody.x,
    y: ghostBody.y,
    vx: ghostBody.vx,
    vy: ghostBody.vy,
    mass: newBodyConfig.mass,
    size: newBodyConfig.size,
    color: newBodyConfig.color,
    image: null
    }));

    ghostBody = null;
    MODE = 'VIEW';
  }

  isPanning = false;
});

canvas.addEventListener('wheel', e => {
  if (MODE !== 'VIEW') return;
  e.preventDefault();
  const mouse = getMousePos(canvas, e);
  cam.zoomAt(Math.exp(-e.deltaY * 0.007), mouse.x, mouse.y);
}, { passive: false });

// ================== PHYSICS ==================

function resolveCollisions() {
  for (let i = bodies.length - 1; i >= 0; i--) {
    for (let j = i - 1; j >= 0; j--) {
      const a = bodies[i];
      const b = bodies[j];

      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const dist = Math.hypot(dx, dy);

      const ra = a.size / 2;
      const rb = b.size / 2;
      const minDist = ra + rb;

      if (dist >= minDist) continue;

      const penetration = minDist - dist;
      const penetrationRatio = penetration / minDist;

      if (penetrationRatio < MERGE_PENETRATION_RATIO) {
        continue;
      }

      const totalMass = a.mass + b.mass;

      const vx =
        (a.vx * a.mass + b.vx * b.mass) / totalMass;
      const vy =
        (a.vy * a.mass + b.vy * b.mass) / totalMass;

      const x =
        (a.x * a.mass + b.x * b.mass) / totalMass;
      const y =
        (a.y * a.mass + b.y * b.mass) / totalMass;

      const size = Math.cbrt(
        Math.pow(a.size, 3) + Math.pow(b.size, 3)
      );
    

      const isASun = a.image === SUN_IMAGE;
      const isBSun = b.image === SUN_IMAGE;

    let dominant;
    let secondary;

    if (isASun) {
    dominant = a;
    secondary = b;
    } else if (isBSun) {
    dominant = b;
    secondary = a;
    } else {
    dominant = (a.size >= b.size) ? a : b;
    secondary = (dominant === a) ? b : a;
    }

      const merged = new Body({
  x,
  y,
  vx,
  vy,
  mass: totalMass,
  size,
  image: dominant.image || null,
  color: dominant.image ? null : dominant.color
});

if (dominant.image === SUN_IMAGE) {
  merged.size = dominant.size;
  merged.image = SUN_IMAGE;
}

      merged.trail = [];
      bodies.splice(i, 1);
      bodies.splice(j, 1);
      bodies.push(merged);

      if (selectedBody === a || selectedBody === b) {
        selectedBody = merged;
      }

      return;
    }
  }
}


function updatePhysics(dt) {
  for (let i = 0; i < bodies.length; i++) {
    let ax = 0, ay = 0;

    for (let j = 0; j < bodies.length; j++) {
      if (i === j) continue;

      const dx = bodies[j].x - bodies[i].x;
      const dy = bodies[j].y - bodies[i].y;
      const distSq = dx * dx + dy * dy + 0.001;
      const dist = Math.sqrt(distSq);

      const accel = G * bodies[j].mass / distSq;
      ax += accel * (dx / dist);
      ay += accel * (dy / dist);
    }

    bodies[i].vx += ax * dt;
    bodies[i].vy += ay * dt;
    bodies[i].force.x = ax * bodies[i].mass;
    bodies[i].force.y = ay * bodies[i].mass;
  }

  for (const b of bodies) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
  }

  resolveCollisions();

  if (++trailCounter % TRAIL_STEP === 0) {
    for (const b of bodies) {
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > MAX_TRAIL_LENGTH) b.trail.shift();
    }
  }
}

// ================== STATE ==================
function saveState() {
  if (IS_RESETTING) return;

  const state = {
    camera: { x: cam.x, y: cam.y, scale: cam.scale },
    bodies: bodies.map(b => ({
    x: b.x,
    y: b.y,
    vx: b.vx,
    vy: b.vy,
    mass: b.mass,
    size: b.size,
    trail: b.trail.slice(-MAX_TRAIL_LENGTH),
    renderType: b.image ? 'image' : 'color',
    imageKey: b.image === SUN_IMAGE ? 'sun'
            : b.image === MERCURY_IMAGE ? 'mercury'
            : b.image === VENUS_IMAGE ? 'venus'
            : b.image === EARTH_IMAGE ? 'earth'
            : b.image === MARS_IMAGE ? 'mars'
            : b.image === JUPITER_IMAGE ? 'jupiter'
            : b.image === SATURN_IMAGE ? 'saturn'
            : b.image === URANUS_IMAGE ? 'uranus'
            : b.image === NEPTUNE_IMAGE ? 'neptune'
            : null,
    color: b.color || null
    })),
    ui: { SHOW_TRAILS, SHOW_VELOCITY, SHOW_FORCE }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const state = JSON.parse(raw);

    if (state.camera) {
      cam.x = state.camera.x;
      cam.y = state.camera.y;
      cam.scale = state.camera.scale;
    }

    if (state.bodies) {

    bodies.length = 0;

    for (const saved of state.bodies) {
    let image = null;
    let color = null;

    if (saved.renderType === 'image') {
    if (saved.imageKey === 'sun') image = SUN_IMAGE;
    if (saved.imageKey === 'mercury') image = MERCURY_IMAGE;
    if (saved.imageKey === 'venus') image = VENUS_IMAGE;
    if (saved.imageKey === 'earth') image = EARTH_IMAGE;
    if (saved.imageKey === 'mars') image = MARS_IMAGE;
    if (saved.imageKey === 'jupiter') image = JUPITER_IMAGE;
    if (saved.imageKey === 'saturn') image = SATURN_IMAGE;
    if (saved.imageKey === 'uranus') image = URANUS_IMAGE;
    if (saved.imageKey === 'neptune') image = NEPTUNE_IMAGE;

    }

    if (saved.renderType === 'color') {
        color = saved.color || '#ffffff';
    }

    const body = new Body({
        x: saved.x,
        y: saved.y,
        vx: saved.vx,
        vy: saved.vy,
        mass: saved.mass,
        size: saved.size,
        image,
        color
    });

    body.trail = saved.trail?.map(p => ({ x: p.x, y: p.y })) || [];
    bodies.push(body);
    }

    }

    if (state.ui) {
    SHOW_TRAILS = state.ui.SHOW_TRAILS ?? true;
    SHOW_VELOCITY = state.ui.SHOW_VELOCITY ?? true;
    SHOW_FORCE = state.ui.SHOW_FORCE ?? true;

    toggleTrails.checked = SHOW_TRAILS;
    toggleVelocity.checked = SHOW_VELOCITY;
    toggleForce.checked = SHOW_FORCE;
    }

  } catch (e) {
    console.warn('Failed to load state', e);
  }
}

// ================== LOOP ==================
function loop(now) {
  let frameDt = (now - lastTime) / 1000;
  lastTime = now;

  frameDt = Math.min(frameDt, 0.05);

  if (!IS_PAUSED) {
    accumulator += frameDt;

    let steps = 0;

    while (accumulator >= FIXED_DT && steps < MAX_STEPS_PER_FRAME) {
      updatePhysics(FIXED_DT * TIME_SCALE);
      accumulator -= FIXED_DT;
      steps++;
    }

    resolveCollisions();

    trailTimer += frameDt;
    if (trailTimer >= TRAIL_DT) {
      for (const b of bodies) {
        b.trail.push({ x: b.x, y: b.y });
        if (b.trail.length > MAX_TRAIL_LENGTH) b.trail.shift();
      }
      trailTimer = 0;
    }

  } else {
    updateEditorMovement(frameDt);
    accumulator = 0;
  }

  updateInfoPanel(inspectedBody);

  drawScene(ctx, cam, bodies, {
    showTrails: SHOW_TRAILS,
    showVelocity: SHOW_VELOCITY,
    showForce: SHOW_FORCE,
    showOrbits: SHOW_ORBITS,
    ghostBody: ghostBody && {
      ...ghostBody,
      size: newBodyConfig.size,
      color: newBodyConfig.color
    },
    selectedBody,
    isEditingVelocity
  });

  requestAnimationFrame(loop);
}



requestAnimationFrame(loop);
