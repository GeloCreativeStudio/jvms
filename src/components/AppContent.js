import React from 'react';
import { useAuth } from '../utils/authContext';
import NavigationLayout from './NavigationLayout';
import LoadingSpinner from './LoadingSpinner';

const AppContent = React.memo(({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return children;
  }

  return <NavigationLayout>{children}</NavigationLayout>;
});

AppContent.displayName = 'AppContent';

export default AppContent;