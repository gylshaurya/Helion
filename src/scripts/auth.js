import { supabase } from './utils/supabase.js';

document.getElementById('login-btn')?.addEventListener('click', async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google'
  });
});
