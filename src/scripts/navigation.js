document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-nav]');
  if (!btn) return;

  const path = btn.dataset.nav;
  window.location.href = resolvePath(path);
});

function resolvePath(path) {
  switch (path) {
    case '/':
      return '/src/pages/home.html';
    case '/presets':
      return '/src/pages/presets.html';
    case '/simulation':
      return '/src/pages/simulation.html';
    case '/load':
      return '/src/pages/load.html';
    default:
      return '/src/pages/home.html';
  }
}
