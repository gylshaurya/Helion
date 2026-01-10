import { SIM_STORAGE_KEY } from '../utils/constants.js';

const list = document.getElementById('simulation-list');

function loadSimulations() {
    const all = JSON.parse(
        localStorage.getItem(SIM_STORAGE_KEY)
    ) || {};
    
    list.innerHTML = '';
    
    const entries = Object.values(all)
    .sort((a, b) => b.createdAt - a.createdAt);
    
    if (entries.length === 0) {
        list.innerHTML = '<p>No saved simulations</p>';
        return;
    }
    
    for (const sim of entries) {
        const item = document.createElement('div');
        item.className = 'sim-item';
        
        item.innerHTML = `
      <div class="info">
        <div class="name">${sim.name}</div>
        <div class="date">${new Date(sim.createdAt).toLocaleString()}</div>
      </div>
      <button class="open-btn">Open</button>
    `;
        
        item.querySelector('.open-btn').onclick = () => {
            localStorage.setItem(
                'LOAD_SIMULATION_ID',
                sim.id
            );
            window.location.href = '/src/pages/simulation.html';
        };
        
        list.appendChild(item);
    }
}

loadSimulations();
