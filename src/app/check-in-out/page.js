'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import dynamic from 'next/dynamic';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckInOutClient = dynamic(() => import('./CheckInOutClient'), { 
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function CheckInOut() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  requireAuth(router, isAuthenticated, loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <CheckInOutClient />;
}