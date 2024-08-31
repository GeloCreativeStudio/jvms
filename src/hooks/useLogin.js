import { useReducer, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const initialState = {
  email: '',
  password: '',
  error: '',
  isLoading: false,
};

function loginReducer(state, action) {
  switch (action.type) {
    case 'SET_EMAIL':
      return { ...state, email: action.payload };
    case 'SET_PASSWORD':
      return { ...state, password: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

export const useLogin = (signIn) => {
  const [state, dispatch] = useReducer(loginReducer, initialState);
  const router = useRouter();

  const handleEmailChange = useCallback((e) => {
    dispatch({ type: 'SET_EMAIL', payload: e.target.value });
  }, []);

  const handlePasswordChange = useCallback((e) => {
    dispatch({ type: 'SET_PASSWORD', payload: e.target.value });
  }, []);

  const validateInput = useCallback(() => {
    if (!state.email || !state.password) {
      dispatch({ type: 'SET_ERROR', payload: 'Please fill in all fields' });
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(state.email)) {
      dispatch({ type: 'SET_ERROR', payload: 'Please enter a valid email' });
      return false;
    }
    return true;
  }, [state.email, state.password]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateInput()) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });

    try {
      const { error } = await signIn({ email: state.email, password: state.password });
      if (error) throw error;
      router.push('/dashboard');
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid email or password' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.email, state.password, signIn, router, validateInput]);

  return {
    ...state,
    handleEmailChange,
    handlePasswordChange,
    handleSubmit
  };
};