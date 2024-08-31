'use client'

import { useRouter } from 'next/navigation';
import { useAuth } from '../../utils/authContext';
import ViolationRecordClient from './ViolationRecordClient';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getViolations } from '../../lib/violationService';

export default function ViolationRecord() {
  const { isAuthenticated, loading, requireAuth } = useAuth();
  const router = useRouter();

  requireAuth(router, isAuthenticated, loading);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  const initialViolations = getViolations();

  return <ViolationRecordClient initialViolations={initialViolations} />;
}