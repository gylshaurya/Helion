import { Body } from './bodies.js';
import {
    SUN_IMAGE,
    MERCURY_IMAGE,
    VENUS_IMAGE,
    EARTH_IMAGE,
    MARS_IMAGE,
    JUPITER_IMAGE,
    SATURN_IMAGE,
    URANUS_IMAGE,
    NEPTUNE_IMAGE,
    G,
    SUN_MASS
} from './constants.js';
import { makePlanet } from './utils.js';

export function createSolarSystem() {
    let bodies = [];
    
    // ---- Sun ----
    bodies.push(
        new Body({
            x: 0,
            y: 0,
            vx: 0,
            vy: 0,
            mass: SUN_MASS,
            size: 250,
            image: SUN_IMAGE
        })
    );
    
    bodies.push(
        makePlanet(200, 0.2, 20, 25, MERCURY_IMAGE),
        makePlanet(350, 1.1, 40, 62, VENUS_IMAGE),
        makePlanet(500, 2.3, 50, 65, EARTH_IMAGE),
        makePlanet(650, 3.7, 30, 35, MARS_IMAGE),
        makePlanet(900, 0.9, 300, 120, JUPITER_IMAGE),
        makePlanet(1500, 2.0, 250, 90, SATURN_IMAGE),
        makePlanet(1900, 4.1, 120, 70, URANUS_IMAGE),
        makePlanet(2200, 5.2, 120, 60, NEPTUNE_IMAGE)
    );
    
    return bodies;
}

export function createBinaryStars() {
    const bodies = [];
    
    const starMass = SUN_MASS * 0.6;
    const distance = 600;
    const speed = Math.sqrt(G * starMass / distance/1.5);
    
    bodies.push(new Body({
        x: -distance / 2,
        y: 0,
        vx: 0,
        vy: -speed,
        mass: starMass,
        size: 200,
        image: SUN_IMAGE
    }));
    
    bodies.push(new Body({
        x: distance / 2,
        y: 0,
        vx: 0,
        vy: speed,
        mass: starMass,
        size: 200,
        image: SUN_IMAGE
    }));
    
    return bodies;
}

export function createTripletDance() {
    const bodies = [];
    
    const mass = 200;
    const size = 60;
    
    bodies.push(new Body({
        x: -200, y: 0,
        vx: 0, vy: 0.2,
        mass, size,
        image: EARTH_IMAGE
    }));
    
    bodies.push(new Body({
        x: 200, y: 0,
        vx: 0, vy: -0.8,
        mass, size,
        image: MARS_IMAGE
    }));
    
    bodies.push(new Body({
        x: 0, y: 200,
        vx: 0.8, vy: 0,
        mass, size,
        image: VENUS_IMAGE
    }));
    
    return bodies;
}


export function createRingSystem() {
    const bodies = [];
    
    bodies.push(new Body({
        x: 0, y: 0,
        vx: 0, vy: 0,
        mass: SUN_MASS,
        size: 300,
        image: SUN_IMAGE
    }));
    
    const ringCount = 20;
    for (let i = 0; i < ringCount; i++) {
        const r = 500 + Math.random() * 200;
        const angle = Math.random() * Math.PI * 2;
        bodies.push(makePlanet(r, angle, 5, 20, null, '#aaa'));
    }
    
    return bodies;
}


export function createNestedOrbit() {
    const bodies = [];
    
    const sun = new Body({
        x: 0, y: 0,
        vx: 0, vy: 0,
        mass: SUN_MASS,
        size: 260,
        image: SUN_IMAGE
    });
    
    const planet = makePlanet(700, 0, 200, 120, JUPITER_IMAGE);
    const moon = new Body({
        x: planet.x + 120,
        y: planet.y,
        vx: planet.vx,
        vy: planet.vy + 1.2,
        mass: 20,
        size: 40,
        image: EARTH_IMAGE
    });
    
    bodies.push(sun, planet, moon);
    return bodies;
}

export function createChaosSystem() {
    const bodies = [];
    
    for (let i = 0; i < 8; i++) {
        bodies.push(new Body({
            x: (Math.random() - 0.5) * 2000,
            y: (Math.random() - 0.5) * 2000,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            mass: 50 + Math.random() * 150,
            size: 40 + Math.random() * 40,
            color: '#ccc'
        }));
    }
    
    return bodies;
}
