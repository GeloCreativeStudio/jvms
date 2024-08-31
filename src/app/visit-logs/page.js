'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import VisitLogsClient from './VisitLogsClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getVisitLogs } from '../../lib/visitService';

export default function VisitLogs() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  requireAuth(router, isAuthenticated, loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const initialVisitLogs = getVisitLogs();

  return <VisitLogsClient initialVisitLogs={initialVisitLogs} />;
}