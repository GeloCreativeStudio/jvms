import { getUserData, addData, updateData, deleteData } from '../utils/supabaseClient';

export const getVisitors = async () => {
  try {
    return await getUserData('visitors');
  } catch (error) {
    console.error('Error fetching visitors:', error);
    throw error;
  }
};

export const createVisitor = async (visitorData) => {
  try {
    return await addData('visitors', visitorData);
  } catch (error) {
    console.error('Error creating visitor:', error);
    throw error;
  }
};

export const updateVisitor = async (id, visitorData) => {
  try {
    return await updateData('visitors', id, visitorData);
  } catch (error) {
    console.error('Error updating visitor:', error);
    throw error;
  }
};

export const deleteVisitor = async (id) => {
  try {
    return await deleteData('visitors', id);
  } catch (error) {
    console.error('Error deleting visitor:', error);
    throw error;
  }
};