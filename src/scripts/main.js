import { Camera } from './camera.js';
import { Body } from './bodies.js';
import { getMousePos } from './utils.js';
import { drawScene } from './render.js';

// ================== CONSTANTS ==================
const G = 0.5;
const SUN_MASS = 10000;


const TRAIL_STEP = 1;
const STORAGE_KEY = 'animation_state';

const EDIT_MOVE_SPEED = 20;
const keys = new Set();


// ================== UI STATE ==================
let SHOW_TRAILS = true;
let SHOW_VELOCITY = true;
let SHOW_FORCE = true;
let SHOW_ORBITS = true;

let IS_PAUSED = false;
let IS_RESETTING = false;

let MODE = 'VIEW';

let selectedBody = null;
let inspectedBody = null;

let ghostBody = null;
let velocityStart = null;

let isPanning = false;
let lastMouse = null;

let isEditingVelocity = false;
let velocityEditStart = null;

let TIME_SCALE = 10;
let MAX_TRAIL_LENGTH = 3000 / TIME_SCALE;

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

const EARTH_IMAGE = new Image();
EARTH_IMAGE.src = '../assets/earth.svg';

const MARS_IMAGE = new Image();
MARS_IMAGE.src = '../assets/mars.svg';

// ================== BODIES ==================
const bodies = [
  new Body({ x: 0, y: 0, vx: 0, vy: 0, mass: SUN_MASS, size: 100, image: SUN_IMAGE }),
  new Body({ x: 200, y: 0, vx: 0, vy: Math.sqrt(G * SUN_MASS / 200), mass: 100, size: 40, image: EARTH_IMAGE }),
  new Body({ x: -300, y: 0, vx: 0, vy: -Math.sqrt(G * SUN_MASS / 300), mass: 80, size: 30, image: MARS_IMAGE })
];


// ================== TOOLBAR ==================
const pauseBtn = document.getElementById('pauseBtn');
const pauseIcon = document.getElementById('pauseIcon');
const addBodyBtn = document.getElementById('addBodyBtn');
const resetBtn = document.getElementById('resetBtn');

const toggleTrails = document.getElementById('toggleTrails');
const toggleVelocity = document.getElementById('toggleVelocity');
const toggleForce = document.getElementById('toggleForce');

const massSlider = document.getElementById('massSlider');
const radiusSlider = document.getElementById('radiusSlider');
const colorPicker = document.getElementById('colorPicker');

const infoPanel = document.getElementById('body-info');

const timeScaleSlider = document.getElementById('timeScaleSlider');
const timeScaleValue = document.getElementById('timeScaleValue');


// ================== LOAD / SAVE ==================
loadState();
window.addEventListener('beforeunload', saveState);

// ================== UI EVENTS ==================
toggleTrails.onchange = e => SHOW_TRAILS = e.target.checked;
toggleVelocity.onchange = e => SHOW_VELOCITY = e.target.checked;
toggleForce.onchange = e => SHOW_FORCE = e.target.checked;

function showInfoPanel(body) {
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

function updateTimeScaleUI(value) {
  TIME_SCALE = value;
  timeScaleValue.textContent = `${value.toFixed(1)}×`;
}

timeScaleSlider.addEventListener('input', e => {
  updateTimeScaleUI(parseFloat(e.target.value));
});



pauseBtn.onclick = () => {
  IS_PAUSED = !IS_PAUSED;
  pauseIcon.src = IS_PAUSED ? '../assets/play.png' : '../assets/pause.png';

  inspectedBody = null;

  if (!IS_PAUSED) {
    selectedBody = null;
  }
};

addBodyBtn.onclick = () => {
  IS_PAUSED = true;
  MODE = 'ADD';
  ghostBody = null;

  hideInfoPanel();

  massSlider.value = newBodyConfig.mass;
  radiusSlider.value = newBodyConfig.size;
  colorPicker.value = newBodyConfig.color;
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
  // Space = pause / play
  if (e.code === 'Space') {
    e.preventDefault();

    IS_PAUSED = !IS_PAUSED;
    pauseIcon.src = IS_PAUSED ? '../assets/play.png' : '../assets/pause.png';

    if (!IS_PAUSED) {
      selectedBody = null;
      isEditingVelocity = false;
    }
    return;
  }

  // Movement keys
  const key = e.key.toLowerCase();
  if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key)) {
    keys.add(key);
  }
});


window.addEventListener('keyup', e => {
  keys.delete(e.key.toLowerCase());
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
      return; // only block panning if body was hit
    } else {
      inspectedBody = null;
      hideInfoPanel();
      // DO NOT return → allow panning
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
let lastTime = performance.now();
let trailCounter = 0;

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
            : b.image === EARTH_IMAGE ? 'earth'
            : b.image === MARS_IMAGE ? 'mars'
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
        if (saved.imageKey === 'earth') image = EARTH_IMAGE;
        if (saved.imageKey === 'mars') image = MARS_IMAGE;
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
  let dt = (now - lastTime) * 0.001 * TIME_SCALE;
  lastTime = now;

  if (!IS_PAUSED) {
    updatePhysics(dt);
  } else {
    updateEditorMovement(dt);
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
