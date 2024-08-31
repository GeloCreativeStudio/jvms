'use client'

import { useEffect } from 'react';
import DashboardClient from './DashboardClient';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function Dashboard() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    requireAuth(router, isAuthenticated, loading);
  }, [isAuthenticated, loading, router, requireAuth]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <DashboardClient />;
}