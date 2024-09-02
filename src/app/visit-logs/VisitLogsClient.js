'use client'

import React, { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import { Box, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useVisitLogs } from '../../hooks/useVisitLogs';
import { formatTime } from '../../utils/dateUtils';
import { PageLayout } from '../../components/PageLayout';
import { useAuth } from '../../utils/authContext';

const VisitLogsClient = ({ initialVisitLogs }) => {
  const { user } = useAuth();
  const {
    filteredVisits,
    page,
    rowsPerPage,
    snackbar,
    setSnackbar,
    handlePageChange,
    handleRowsPerPageChange,
  } = useVisitLogs(initialVisitLogs);

  const columns = useMemo(() => [
    { 
      id: 'name', 
      label: 'Name', 
      render: (row) => row.visitor?.name || 'N/A'
    },
    { 
      id: 'visitor_type', 
      label: 'Type', 
      chip: (value, row) => ({
        label: row.visitor?.visitor_type || 'N/A',
        color: row.visitor?.visitor_type === 'PDL Visitor' ? 'primary' : 
               (row.visitor?.visitor_type === 'Service Provider' ? 'secondary' : 'warning'),
        size: 'small'
      })
    },
    { 
      id: 'pdl_visited', 
      label: 'PDL Visited', 
      render: (row) => row.visitor?.visitor_type === 'PDL Visitor' ? (row.visitor?.pdl_visited || 'N/A') : 'N/A'
    },
    { 
      id: 'check_in_time', 
      label: 'Check-In Time', 
      chip: (value) => ({
        label: value ? formatTime(value) : 'N/A',
        color: 'default',
        size: 'small'
      })
    },
    { 
      id: 'check_out_time', 
      label: 'Check-Out Time', 
      chip: (value) => ({
        label: value ? formatTime(value) : 'Not checked out',
        color: value ? 'default' : 'error',
        size: 'small'
      })
    },
    { id: 'purpose', label: 'Purpose' },
  ], []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  }), []);

  const tableVariants = useMemo(() => ({
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        delay: 0.2,
      },
    },
  }), []);

  const [confirmationModal, setConfirmationModal] = useState({ open: false, message: '', onConfirm: null });

  const handleSnackbarClose = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar, setSnackbar]);

  if (!user) {
    return (
      <PageLayout title="Visit Logs">
        <Typography variant="h6" align="center">
          Please log in to view visit logs.
        </Typography>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Visit Logs">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <motion.div variants={tableVariants}>
            <DataTable
              columns={columns}
              data={filteredVisits}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </motion.div>

          <Dialog
            open={snackbar.open}
            onClose={handleSnackbarClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              Notification
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {snackbar.message}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSnackbarClose} color="primary">
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
        </Box>
      </motion.div>
    </PageLayout>
  );
};

VisitLogsClient.displayName = 'VisitLogsClient';

export default React.memo(VisitLogsClient);