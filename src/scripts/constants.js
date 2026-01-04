// physics
export const G = 0.5;
export const SUN_MASS = 10000;

export const FIXED_DT = 1 / 120;
export const MAX_STEPS_PER_FRAME = 10;
export const TRAIL_DT = 1 / 30;

export const TRAIL_STEP = 1;
export const MAX_TRAIL_LENGTH = 150000;

export const MERGE_PENETRATION_RATIO = 0.35;
export const MAX_SYSTEM_RADIUS = 8000;

export const keys = new Set();

// editor
export const EDIT_MOVE_SPEED = 100;

// time
export const MIN_TIME = 0.1;
export const MAX_TIME = 200;

export const ESCAPE_EPS = 0.02;

// storage
export const STORAGE_KEY = 'animation_state';

export const SUN_IMAGE = new Image();
SUN_IMAGE.src = '../assets/sun.svg';

export const MERCURY_IMAGE = new Image();
MERCURY_IMAGE.src = '../assets/mercury.svg';

export const VENUS_IMAGE = new Image();
VENUS_IMAGE.src = '../assets/venus.svg';

export const EARTH_IMAGE = new Image();
EARTH_IMAGE.src = '../assets/earth.svg';

export const MARS_IMAGE = new Image();
MARS_IMAGE.src = '../assets/mars.svg';

export const JUPITER_IMAGE = new Image();
JUPITER_IMAGE.src = '../assets/jupiter.png';

export const SATURN_IMAGE = new Image();
SATURN_IMAGE.src = '../assets/saturn.png';

export const URANUS_IMAGE = new Image();
URANUS_IMAGE.src = '../assets/uranus.svg';

export const NEPTUNE_IMAGE = new Image();
NEPTUNE_IMAGE.src = '../assets/neptune.png';

export const pauseBtn = document.getElementById('pauseBtn');
export const pauseIcon = document.getElementById('pauseIcon');
export const addBodyBtn = document.getElementById('addBodyBtn');
export const resetBtn = document.getElementById('resetBtn');
export const recenterBtn = document.getElementById('recenterBtn');

export const toggleTrails = document.getElementById('toggleTrails');
export const toggleVelocity = document.getElementById('toggleVelocity');
export const toggleForce = document.getElementById('toggleForce');

export const massSlider = document.getElementById('massSlider');
export const sizeSlider = document.getElementById('sizeSlider');
export const massLabel = document.getElementById('massValue');
export const sizeLabel = document.getElementById('sizeValue');
export const colorPicker = document.getElementById('colorPicker');

export const infoPanel = document.getElementById('body-info');
export const bodyControlsPanel = document.getElementById('body-controls');

export const timeSlider = document.getElementById('timeScaleSlider');
export const timeLabel = document.getElementById('timeScaleValue');