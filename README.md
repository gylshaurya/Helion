# Helion

Helion is a browser-based solar system simulator built using plain JavaScript.  
It visualizes how planets and other bodies move under gravity and allows users to interact with, edit, save, and load simulations.

## Features

- Real-time n-body gravitational simulation
- Stable solar system loaded by default
- Multiple preset systems (binary stars, chaotic systems, rings, etc.)
- Play / pause simulation
- Adjustable time scale
- Camera panning, zooming, and recentering
- Click-to-inspect bodies with live data
- Edit bodies while paused:
  - Change mass, size, and color
  - Modify velocity using mouse drag
  - Move bodies using keyboard
  - Delete selected bodies
- Add new bodies with custom velocity
- Collision detection and body merging
- Angular spin physics with limits
- Orbit trails, velocity arrows, and force vectors
- Save and load simulations
- Reset to last saved state
- Google authentication
- User-specific saved simulations

---

## How to Use

### Starting a Simulation
- Open the app and click **New Simulation** to start with a stable solar system
- Click **Presets** to start from a predefined system
- Click **Load Simulation** to open a previously saved simulation (login required)

---

### Play and Pause
- Click the **Play / Pause** button in the UI  
- Or press **Spacebar** to toggle play and pause
- Body editing is only allowed while the simulation is paused

---

### Camera Controls
- **Drag with mouse** to pan the camera
- **Scroll wheel** to zoom in and out
- Click **Recenter** to center and fit all bodies on screen

---

### Inspecting Bodies
- While the simulation is running:
  - **Click on a body** to inspect it
  - An info panel shows mass, position, velocity, speed, and force

---

### Editing Bodies (Paused Mode)
- **Click on a body** to select it
- Change properties using sliders:
  - Mass
  - Size
  - Color
- **Drag the mouse** from the body to change its velocity
- Use **W / A / S / D** or **Arrow keys** to move the selected body
- Press **Delete** or **Backspace** to remove the selected body

---

### Adding New Bodies
- Click **Add Body**
- Click on the canvas to place the body
- **Drag the mouse** to set the initial velocity direction and speed
- Release mouse to add the body to the simulation

---

### Time Control
- Use the **Time Slider** to speed up or slow down the simulation
- Time scale changes are applied smoothly

---

### Visual Toggles
- Toggle **Trails** to show or hide orbit paths
- Toggle **Velocity** to show velocity arrows
- Toggle **Force** to show gravitational force arrows

---

### Saving Simulations
- Click **Save**
- Enter a name for the simulation
- You must be logged in to save
- A confirmation message appears after saving

---

### Loading Simulations
- Open **Load Simulation**
- Click **Open** on any saved simulation
- The simulation restores exactly as it was saved

---

### Resetting
- Click **Reset**
- The simulation resets to the **last saved state**, not the initial preset

---

### Notes
- Bodies that escape too far from the system are automatically removed
- The Sun has limited or no spin compared to other bodies
- Angular spin of all bodies is capped to keep the simulation stable

---

## How the Simulation Works

- Each body has position, velocity, mass, size, and spin
- Gravity is calculated between all bodies every step
- Physics updates use a fixed timestep for stability
- Camera transforms world coordinates to screen coordinates
- Rendering draws bodies, trails, and vectors on a canvas
- The entire simulation can be saved as a snapshot and restored later

---

## Presets

- Solar System (Stable)
- Binary Star System
- Triplet Planet Dance
- Ring System
- Nested Orbits
- Drifting Chaos System

Selecting a preset starts the simulation with that configuration.

---

## Saving and Loading

- Users must be logged in to save simulations
- Each save stores a full snapshot of the simulation state
- Saved simulations are linked to the logged-in user
- Previously saved simulations can be loaded at any time
- Reset restores the last saved snapshot instead of restarting from scratch

---

## Authentication and Backend

- Google authentication using Supabase
- Supabase manages user sessions and database access
- Each simulation stored in the database includes:
  - Unique simulation ID
  - User ID
  - Simulation name
  - Full simulation snapshot (JSON)

---

## Running the Project

1. Open the project using a local web server (for example, VS Code Live Server)
2. Open `index.html`
3. Log in using Google (required for saving simulations)
4. Start a new simulation or choose a preset

---

## Notes

- Built using Vanilla JavaScript, HTML Canvas, and CSS
- No frameworks are used
- Physics is simplified for learning and visualization
- Main goal of the project is understanding physics, rendering, and state management
