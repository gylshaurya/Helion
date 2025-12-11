import { Camera } from './camera.js';
import { drawScene } from './render.js';

const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const bodies = [ { x: 0,   y: 0,   radius: 40, color: 'yellow' }, { x: 200, y: 0,   radius: 10, color: 'lightblue' }, { x: -200, y: 200, radius: 20, color: 'orange' } ];


const cam = new Camera();
function centerCamera() {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    cam.x = cx / cam.scale;
    cam.y = cy / cam.scale;
}
centerCamera();

let dragging = false;
let last = null;

canvas.addEventListener('mousedown', (e) => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => dragging = false);


canvas.addEventListener('mousemove', (e) => {
    if (!dragging){
      return;
    }
    const dx = (e.clientX - last.x) / cam.scale;
    const dy = (e.clientY - last.y) / cam.scale;
    cam.x += dx;
    cam.y += dy;
    last = { x: e.clientX, y: e.clientY };
});


canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0015);
    cam.zoomAt(factor, e.clientX, e.clientY);
}, { passive: false });


function loop() {
    drawScene(context, cam, bodies);
    requestAnimationFrame(loop);
}
loop();
