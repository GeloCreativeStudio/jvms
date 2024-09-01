'use client'

import React, { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import { SnackbarAlert } from '../../components/SnackbarAlert';
import { Box, Typography } from '@mui/material';
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

          <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleSnackbarClose}
          />
        </Box>
      </motion.div>
    </PageLayout>
  );
};

VisitLogsClient.displayName = 'VisitLogsClient';

export default React.memo(VisitLogsClient);