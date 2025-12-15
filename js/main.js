import { Camera } from './camera.js';
import { drawScene } from './render.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const G = 0.5;
const TIME_SCALE = 1; 

const MAX_TRAIL_LENGTH = 300; 
const TRAIL_STEP = 2; 
let trailCounter = 0;


canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const sunImg = new Image();
sunImg.src = 'src/assets/sun.svg';

const earthImg = new Image();
earthImg.src = 'src/assets/earth.svg';

const marsImg = new Image();
marsImg.src = 'src/assets/mars.svg';

const sunMass = 10000;

const bodies = [
  {
    x: 0, y: 0,
    vx: 0, vy: 0,
    mass: sunMass,
    size: 80,
    image: sunImg,
    trail: []
  },
  {
    x: 200, y: 0,
    vx: 0, vy: Math.sqrt(G * sunMass / 200),
    mass: 10,
    size: 30,
    image: earthImg,
    trail: []
  },
  {
    x: -300, y: 0,
    vx: 0, vy: -Math.sqrt(G * sunMass / 300),
    mass: 8,
    size: 40,
    image: marsImg,
    trail: []
  }
];



const cam = new Camera();
const cx = window.innerWidth / 2;
const cy = window.innerHeight / 2;
cam.x = cx / cam.scale;
cam.y = cy / cam.scale;

let dragging = false;
let last = null;

function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX + rect.left,
        y: e.clientY + rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    last = getMousePos(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const pos = getMousePos(e);
    const dx = (pos.x - last.x) / cam.scale;
    const dy = (pos.y - last.y) / cam.scale;
    cam.x += dx;
    cam.y += dy;
    last = pos;
});


window.addEventListener('mouseup', () => dragging = false);


canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0070);
    const pos = getMousePos(e);
    cam.zoomAt(factor, pos.x, pos.y);
}, { passive: false });

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

      const force = G * bodies[j].mass / distSq;

      ax += force * (dx / dist);
      ay += force * (dy / dist);
    }

    
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

let lastTime = performance.now();

function loop(now) {
  const dt = (now - lastTime) * 0.001 * TIME_SCALE;
  lastTime = now;

  updatePhysics(dt);
  drawScene(context, cam, bodies);

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);


