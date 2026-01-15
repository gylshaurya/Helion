import { supabase } from '../utils/supabase.js';

const list = document.getElementById('simulation-list');

async function loadSimulations() {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    list.innerHTML = '<p>Please login to load simulations</p>';
    return;
  }

  const { data, error } = await supabase
    .from('simulations')
    .select('id, name, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    list.innerHTML = '<p>Failed to load simulations</p>';
    return;
  }

  list.innerHTML = '';

  if (data.length === 0) {
    list.innerHTML = '<p>No saved simulations</p>';
    return;
  }

  for (const sim of data) {
    const item = document.createElement('div');
    item.className = 'sim-item';

    item.innerHTML = `
      <div class="info">
        <div class="name">${sim.name}</div>
        <div class="date">${new Date(sim.created_at).toLocaleString()}</div>
      </div>
      <button class="primary-btn open-btn">Open</button>
    `;

    item.querySelector('.open-btn').onclick = () => {
      window.location.href = `/src/pages/simulation.html?sim=${sim.id}`;
    };

    list.appendChild(item);
  }
}

loadSimulations();
