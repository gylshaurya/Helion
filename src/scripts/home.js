const screens = {
  menu: document.getElementById('screen-menu'),
  newSim: document.getElementById('screen-new'),
  loadSim: document.getElementById('screen-load'),
  presets: document.getElementById('screen-presets'),
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove('active'));
  screens[name].classList.add('active');
}

// Buttons
document.getElementById('new-sim-btn').onclick = () => showScreen('newSim');
document.getElementById('load-sim-btn').onclick = () => showScreen('loadSim');
document.getElementById('preset-btn').onclick = () => showScreen('presets');

// Back buttons
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.onclick = () => showScreen('menu');
});

const presets = [
  {
    id: 'solar',
    name: 'Classic Solar System',
    desc: 'Stable sun-centered planetary system.'
  },
  {
    id: 'binary',
    name: 'Binary Stars',
    desc: 'Two stars locked in orbit, planets navigating their gravity.'
  },
  {
    id: 'triplet',
    name: 'Triplet Planet Dance',
    desc: 'Three massive planets exchanging chaotic orbits.'
  },
  {
    id: 'ring',
    name: 'Planetary Ring System',
    desc: 'A central body surrounded by dense orbital rings.'
  },
  {
    id: 'moon-moon',
    name: 'Moon of a Moon',
    desc: 'A planet orbiting a planet orbiting the sun.'
  },
  {
    id: 'rogue',
    name: 'Rogue Planet Cluster',
    desc: 'No central star. Temporary bonds, frequent ejections.'
  }
];

const presetGrid = document.getElementById('preset-grid');

presets.forEach(preset => {
  const card = document.createElement('div');
  card.className = 'preset-card';

  card.innerHTML = `
    <div class="preset-title">${preset.name}</div>
    <div class="preset-desc">${preset.desc}</div>
  `;

  card.onclick = () => {
    console.log('Preset selected:', preset.id);
  };

  presetGrid.appendChild(card);
});
