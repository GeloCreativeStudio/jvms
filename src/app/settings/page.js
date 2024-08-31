'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import SettingsClient from './SettingsClient';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Settings() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  requireAuth(router, isAuthenticated, loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <SettingsClient />;
}