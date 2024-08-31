import React from 'react';
import { Snackbar, Alert } from '@mui/material';

export const SnackbarAlert = React.memo(({ open, message, severity, onClose }) => (
  <Snackbar 
    open={open} 
    autoHideDuration={6000} 
    onClose={onClose}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
  >
    <Alert 
      onClose={onClose} 
      severity={severity} 
      sx={{ 
        width: '100%',
        borderRadius: 2,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      {message}
    </Alert>
  </Snackbar>
));

SnackbarAlert.displayName = 'SnackbarAlert';