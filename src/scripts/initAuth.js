import { supabase } from './utils/supabase.js';

const { data: { session } } = await supabase.auth.getSession();

if (session?.user) {
  const user = session.user;

  await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    name: user.user_metadata.full_name || 'User',
    avatar_url: user.user_metadata.avatar_url
  });
}
