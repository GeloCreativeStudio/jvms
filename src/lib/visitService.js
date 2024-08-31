import { supabase } from '../utils/supabaseClient';

export const getVisitLogs = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('visits')
      .select(`
        *,
        visitor:visitors (*)
      `)
      .eq('tenant_id', user.id)
      .order('check_in_time', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching visit logs:', error);
    throw error;
  }
};

export const createVisit = async (visitData) => {
  try {
    return await addData('visits', visitData);
  } catch (error) {
    console.error('Error creating visit:', error);
    throw error;
  }
};

export const updateVisit = async (id, visitData) => {
  try {
    return await updateData('visits', id, visitData);
  } catch (error) {
    console.error('Error updating visit:', error);
    throw error;
  }
};

export const deleteVisit = async (id) => {
  try {
    return await deleteData('visits', id);
  } catch (error) {
    console.error('Error deleting visit:', error);
    throw error;
  }
};