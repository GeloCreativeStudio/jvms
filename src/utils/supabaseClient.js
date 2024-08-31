import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

export const getUserData = async (table) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  let query = supabase
    .from(table)
    .select('*')
    .eq('tenant_id', user.id);

  // If the table is 'visits', include the visitor data
  if (table === 'visits') {
    query = query.select('*, visitor:visitors(*)');
  }

  const { data, error } = await query;

  if (error) {
    console.error(`Error fetching ${table} data:`, error);
    throw error;
  }

  console.log(`Fetched ${table} data:`, data); // Debug log
  return data;
};

export const addData = async (table, data) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data: result, error } = await supabase
    .from(table)
    .insert({ ...data, user_id: user.id, tenant_id: user.id })
    .select();

  if (error) throw error;
  return result;
};

export const updateData = async (table, id, data) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { data: result, error } = await supabase
    .from(table)
    .update(data)
    .eq('id', id)
    .eq('user_id', user.id)
    .select();

  if (error) throw error;
  return result;
};

export const deleteData = async (table, id) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No user logged in');

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
  return true;
};
