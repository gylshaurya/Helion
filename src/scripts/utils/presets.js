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

document.addEventListener('click', e => {
      const card = e.target.closest('.preset-card');
      if (!card) return;

      const preset = card.dataset.preset;
      window.location.href = `/src/pages/simulation.html?preset=${preset}`;
    });