import { Camera } from './camera.js';
import { Body } from './bodies.js';
import { getMousePos } from './utils.js';
import { drawScene } from './render.js';

// ================== CONSTANTS ==================
const G = 0.5;
const TIME_SCALE = 10;

const SUN_MASS = 10000;

const MAX_TRAIL_LENGTH = 3000 / TIME_SCALE;
const TRAIL_STEP = 1;

const STORAGE_KEY = 'animation_state';

let SHOW_TRAILS = true;
let SHOW_VELOCITY = true;
let SHOW_FORCE = true;

let IS_RESETTING = false;
let IS_PAUSED = false;

// ================== CANVAS ==================
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ================== TOOLBAR ==================
const toggleTrails = document.getElementById('toggleTrails');
const toggleVelocity = document.getElementById('toggleVelocity');
const toggleForce = document.getElementById('toggleForce');
const resetBtn = document.getElementById('resetBtn');

toggleTrails.addEventListener('change', e => {
    SHOW_TRAILS = e.target.checked;
    saveState();
});

toggleVelocity.addEventListener('change', e => {
    SHOW_VELOCITY = e.target.checked;
    saveState();
});

toggleForce.addEventListener('change', e => {
    SHOW_FORCE = e.target.checked;
    saveState();
});

resetBtn.addEventListener('click', () => {
    IS_RESETTING = true;

    localStorage.removeItem(STORAGE_KEY);

    SHOW_TRAILS = true;
    SHOW_VELOCITY = true;
    SHOW_FORCE = true;

    toggleTrails.checked = true;
    toggleVelocity.checked = true;
    toggleForce.checked = true;

    location.reload();
});

// ================== IMAGES ==================
const SUN_IMAGE = new Image();
SUN_IMAGE.src = '../assets/sun.svg';

const EARTH_IMAGE = new Image();
EARTH_IMAGE.src = '../assets/earth.svg';

const MARS_IMAGE = new Image();
MARS_IMAGE.src = '../assets/mars.svg';

// ================== BODIES ==================
const bodies = [
    new Body({
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        mass: SUN_MASS,
        size: 80,
        image: SUN_IMAGE
    }),
    new Body({
        x: 200,
        y: 0,
        vx: 0,
        vy: Math.sqrt(G * SUN_MASS / 200),
        mass: 10,
        size: 30,
        image: EARTH_IMAGE
    }),
    new Body({
        x: -300,
        y: 0,
        vx: 0,
        vy: -Math.sqrt(G * SUN_MASS / 300),
        mass: 8,
        size: 40,
        image: MARS_IMAGE
    })
];

// ================== CAMERA ==================
const cam = new Camera();
cam.x = (window.innerWidth / 2) / cam.scale;
cam.y = (window.innerHeight / 2) / cam.scale;

// ================== INPUT ==================
let dragging = false;
let lastMousePos = null;

canvas.addEventListener('mousedown', e => {
    dragging = true;
    lastMousePos = getMousePos(canvas, e);
});

canvas.addEventListener('mousemove', e => {
    if (!dragging) return;

    const pos = getMousePos(canvas, e);
    cam.x += (pos.x - lastMousePos.x) / cam.scale;
    cam.y += (pos.y - lastMousePos.y) / cam.scale;

    lastMousePos = pos;
});

window.addEventListener('mouseup', () => {
    dragging = false;
});

canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.007);
    const pos = getMousePos(canvas, e);
    cam.zoomAt(factor, pos.x, pos.y);
}, { passive: false });

// ================== PHYSICS ==================
let trailCounter = 0;
let lastTime = performance.now();

function updatePhysics(dt) {
    for (let i = 0; i < bodies.length; i++) {
        let ax = 0;
        let ay = 0;

        for (let j = 0; j < bodies.length; j++) {
            if (i === j) continue;

            const dx = bodies[j].x - bodies[i].x;
            const dy = bodies[j].y - bodies[i].y;

            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq) + 0.001;

            const accel = G * bodies[j].mass / distSq;

            ax += accel * (dx / dist);
            ay += accel * (dy / dist);
        }

        bodies[i].force.x = ax * bodies[i].mass;
        bodies[i].force.y = ay * bodies[i].mass;

        bodies[i].vx += ax * dt;
        bodies[i].vy += ay * dt;
    }

    for (const b of bodies) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
    }

    trailCounter++;
    if (trailCounter % TRAIL_STEP === 0) {
        for (const b of bodies) {
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > MAX_TRAIL_LENGTH) {
                b.trail.shift();
            }
        }
    }
}

// ================== STATE ==================
function saveState() {
    if (IS_RESETTING) return;

    const state = {
        camera: {
            x: cam.x,
            y: cam.y,
            scale: cam.scale
        },
        bodies: bodies.map(b => ({
            x: b.x,
            y: b.y,
            vx: b.vx,
            vy: b.vy
        })),
    
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

        if (state.bodies && state.bodies.length === bodies.length) {
            for (let i = 0; i < bodies.length; i++) {
                bodies[i].x = state.bodies[i].x;
                bodies[i].y = state.bodies[i].y;
                bodies[i].vx = state.bodies[i].vx;
                bodies[i].vy = state.bodies[i].vy;
                bodies[i].trail.length = 0;
            }
        }

    } catch (e) {
        console.warn('Failed to load saved state', e);
    }
}

loadState();
window.addEventListener('beforeunload', saveState);

// ================== LOOP ==================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        IS_PAUSED = true;
    } else {
        IS_PAUSED = false;
        lastTime = performance.now();
    }
});

function loop(now) {
    if (IS_PAUSED) {
        lastTime = now;
        requestAnimationFrame(loop);
        return;
    }

    const dt = (now - lastTime) * 0.001 * TIME_SCALE;
    lastTime = now;

    updatePhysics(dt);
    drawScene(context, cam, bodies, {
        showTrails: SHOW_TRAILS,
        showVelocity: SHOW_VELOCITY,
        showForce: SHOW_FORCE
    });

    requestAnimationFrame(loop);
}


requestAnimationFrame(loop);
