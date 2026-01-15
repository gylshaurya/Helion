import { supabase } from './supabase.js';

export async function saveSimulationToDB({ name, snapshot }) {
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('simulations')
    .insert({
      user_id: user.id,
      name,
      snapshot
    });

  if (error) {
    throw error;
  }
}

export async function fetchSimulationById(id) {
  const { data, error } = await supabase
    .from('simulations')
    .select('snapshot')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data.snapshot;
}