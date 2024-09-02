'use client'

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '../../components/PageLayout';
import { 
  Box, TextField, Button, 
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Typography, IconButton, Divider, CircularProgress, Grid
} from '@mui/material';
import { Visibility, VisibilityOff, DeleteForever, AccountCircle, VpnKey } from '@mui/icons-material';
import { useAuth } from '../../utils/authContext';
import { useSettings } from '../../hooks/useSettings';

const SettingsClient = () => {
  const { user } = useAuth();
  const { 
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
  } = useSettings();

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [confirmationModal, setConfirmationModal] = useState({ open: false, message: '', onConfirm: null });

  const handleDeleteAccount = useCallback(async () => {
    try {
      if (deleteConfirmation === 'DELETE') {
        await deleteAccount();
        // Redirect to login page or show a success message
      } else {
        dispatch({ type: 'SET_MESSAGE', payload: { text: 'Invalid confirmation code', severity: 'error' } });
      }
    } catch (error) {
      dispatch({ type: 'SET_MESSAGE', payload: { text: `Error deleting account: ${error.message}`, severity: 'error' } });
    }
    setOpenDeleteDialog(false);
  }, [deleteAccount, deleteConfirmation, dispatch]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }), []);

  const formElementVariants = useMemo(() => ({
    hidden: { x: -10, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  }), []);

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <PageLayout title="Settings">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <AccountCircle sx={{ mr: 1 }} /> Change Display Name
                  </Typography>
                  <form onSubmit={handleDisplayNameSubmit}>
                    <motion.div variants={formElementVariants}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Display Name"
                        value={displayName}
                        onChange={handleDisplayNameChange}
                        required
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </motion.div>
                    <motion.div variants={formElementVariants}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Display Name'}
                      </Button>
                    </motion.div>
                  </form>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div variants={itemVariants}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <VpnKey sx={{ mr: 1 }} /> Change Password
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <motion.div variants={formElementVariants}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="New Password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        InputProps={{
                          endAdornment: (
                            <IconButton
                              onClick={handleShowPasswordToggle}
                              edge="end"
                              size="large"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          ),
                        }}
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </motion.div>
                    <motion.div variants={formElementVariants}>
                      <TextField
                        fullWidth
                        margin="normal"
                        label="Confirm New Password"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                        variant="outlined"
                        sx={{ mb: 2 }}
                      />
                    </motion.div>
                    <motion.div variants={formElementVariants}>
                      <Button 
                        type="submit" 
                        variant="contained" 
                        fullWidth 
                        disabled={loading}
                      >
                        {loading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </motion.div>
                  </form>
                </Box>
              </motion.div>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'error.main', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <DeleteForever sx={{ mr: 1 }} /> Delete Account
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                This action is irreversible. All your data will be permanently deleted.
              </Typography>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={() => setOpenDeleteDialog(true)}
              >
                Delete My Account
              </Button>
            </Box>
          </motion.div>
        </Box>
      </motion.div>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Are you sure you want to delete your account?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action cannot be undone. All of your data will be permanently deleted.
            To confirm, please type &quot;DELETE&quot; in the field below.
          </DialogContentText>
          <TextField
            fullWidth
            margin="normal"
            label="Type DELETE to confirm"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            variant="outlined"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => setConfirmationModal({
              open: true,
              message: 'Are you sure you want to delete your account?',
              onConfirm: handleDeleteAccount
            })} 
            color="error" 
            disabled={deleteConfirmation !== 'DELETE'}
          >
            Yes, Delete My Account
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={!!message.text}
        onClose={() => dispatch({ type: 'SET_MESSAGE', payload: { text: '', severity: 'info' } })}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Notification
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {message.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => dispatch({ type: 'SET_MESSAGE', payload: { text: '', severity: 'info' } })} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={confirmationModal.open}
        onClose={() => setConfirmationModal({ open: false, message: '', onConfirm: null })}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          Confirmation
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            {confirmationModal.message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationModal({ open: false, message: '', onConfirm: null })} color="primary">
            Cancel
          </Button>
          <Button onClick={() => { confirmationModal.onConfirm(); setConfirmationModal({ open: false, message: '', onConfirm: null }); }} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default React.memo(SettingsClient);