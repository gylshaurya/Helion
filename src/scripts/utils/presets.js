import { createSolarSystem, createBinaryStars, createTripletDance, 
    createRingSystem, createNestedOrbit, createChaosSystem
} from './presetFactories.js';

export const PRESET_FACTORIES = {
    solar: createSolarSystem,
    binary: createBinaryStars,
    triplet: createTripletDance,
    rings: createRingSystem,
    nested: createNestedOrbit,
    chaos: createChaosSystem
};

