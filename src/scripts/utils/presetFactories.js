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
