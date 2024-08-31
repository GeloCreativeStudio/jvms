import { useState, useCallback, useEffect, useMemo, useReducer } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../utils/authContext';

function settingsReducer(state, action) {
  switch (action.type) {
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_CONFIRM_PASSWORD':
      return { ...state, confirmPassword: action.payload };
    case 'TOGGLE_SHOW_PASSWORD':
      return { ...state, showPassword: !state.showPassword };
    case 'SET_MESSAGE':
      return { ...state, message: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_DISPLAY_NAME':
      return { ...state, displayName: action.payload };
    default:
      return state;
  }
}

export const useSettings = () => {
  const { user, updateUser } = useAuth();
  const memoizedUser = useMemo(() => user, [user]);
  const [state, dispatch] = useReducer(settingsReducer, {
    password: '',
    confirmPassword: '',
    showPassword: false,
    message: { text: '', severity: 'info' },
    loading: false,
    displayName: ''
  });

  const { password, confirmPassword, showPassword, message, loading, displayName } = state;

  useEffect(() => {
    if (user) {
      dispatch({ type: 'SET_DISPLAY_NAME', payload: user.user_metadata.display_name || '' });
    }
  }, [user]);

  const handlePasswordChange = useCallback((e) => {
    dispatch({ type: 'SET_PASSWORD', payload: e.target.value });
  }, []);

  const handleConfirmPasswordChange = useCallback((e) => {
    dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: e.target.value });
  }, []);

  const handleShowPasswordToggle = useCallback(() => {
    dispatch({ type: 'TOGGLE_SHOW_PASSWORD' });
  }, []);

  const handleDisplayNameChange = useCallback((e) => {
    dispatch({ type: 'SET_DISPLAY_NAME', payload: e.target.value });
  }, []);

  const handleDisplayNameSubmit = useCallback(async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      updateUser({ ...memoizedUser, user_metadata: { ...memoizedUser.user_metadata, display_name: displayName } });
      dispatch({ type: 'SET_MESSAGE', payload: { text: 'Display name updated successfully', severity: 'success' } });
    } catch (error) {
      dispatch({ type: 'SET_MESSAGE', payload: { text: `Error: ${error.message}`, severity: 'error' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [displayName, memoizedUser, updateUser]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_LOADING', payload: true });

    if (password !== confirmPassword) {
      dispatch({ type: 'SET_MESSAGE', payload: { text: 'Passwords do not match', severity: 'error' } });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      dispatch({ type: 'SET_MESSAGE', payload: { text: 'Password updated successfully', severity: 'success' } });
      dispatch({ type: 'SET_PASSWORD', payload: '' });
      dispatch({ type: 'SET_CONFIRM_PASSWORD', payload: '' });
    } catch (error) {
      dispatch({ type: 'SET_MESSAGE', payload: { text: `Error: ${error.message}`, severity: 'error' } });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [password, confirmPassword]);

  const deleteAccount = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.admin.deleteUser(memoizedUser.id);
      if (error) throw error;
      dispatch({ type: 'SET_MESSAGE', payload: { text: 'Account deleted successfully', severity: 'success' } });
      await supabase.auth.signOut();
    } catch (error) {
      dispatch({ type: 'SET_MESSAGE', payload: { text: `Error: ${error.message}`, severity: 'error' } });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [memoizedUser]);

  return {
    password,
    confirmPassword,
    showPassword,
    message,
    loading,
    handlePasswordChange,
    handleConfirmPasswordChange,
    handleShowPasswordToggle,
    handleSubmit,
    displayName,
    handleDisplayNameChange,
    handleDisplayNameSubmit,
    deleteAccount,
    dispatch
  };
};