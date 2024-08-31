import { getUserData, addData, updateData, deleteData } from '../utils/supabaseClient';
import { supabase } from '../utils/supabaseClient';

export const getViolations = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('violations')
      .select(`
        *,
        visitor:visitors (*)
      `)
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching violations:', error);
    throw error;
  }
};

export const createViolation = async (violationData) => {
  try {
    return await addData('violations', violationData);
  } catch (error) {
    console.error('Error creating violation:', error);
    throw error;
  }
};

export const updateViolation = async (id, violationData) => {
  try {
    return await updateData('violations', id, violationData);
  } catch (error) {
    console.error('Error updating violation:', error);
    throw error;
  }
};

export const deleteViolation = async (id) => {
  try {
    return await deleteData('violations', id);
  } catch (error) {
    console.error('Error deleting violation:', error);
    throw error;
  }
};

export const searchVisitors = async (searchTerm) => {
  try {
    const visitors = await getUserData('visitors');
    return visitors.filter(visitor => 
      visitor.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching visitors:', error);
    throw error;
  }
};