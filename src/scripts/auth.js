import { supabase } from './utils/supabase.js';

document.getElementById('login-btn')?.addEventListener('click', async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://127.0.0.1:5500/src/pages/home.html'
    }
  });
});

document.getElementById('signup-btn')?.addEventListener('click', async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://127.0.0.1:5500/src/pages/home.html'
    }
  });
});
