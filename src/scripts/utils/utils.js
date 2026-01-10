import { G, SUN_MASS } from "./constants.js";
import { Body } from '../utils/bodies.js';

export function getMousePos(canvas, event) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

export function makePlanet(r, angle, mass, size, image, color) {
    const speed = Math.sqrt(G * SUN_MASS / r);
    
    return new Body({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: -Math.sin(angle) * speed,
        vy:  Math.cos(angle) * speed,
        mass,
        size,
        angularVelocity: speed*5 / r,
        angle:0,
        image,
        color
    });
}
