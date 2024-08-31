'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import VisitorManagementClient from './VisitorManagementClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getVisitors } from '../../lib/visitorService';

export default function VisitorManagement() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  requireAuth(router, isAuthenticated, loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const initialVisitors = getVisitors();

  return <VisitorManagementClient initialVisitors={initialVisitors} />;
}