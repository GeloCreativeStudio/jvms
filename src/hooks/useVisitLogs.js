import { useState, useCallback, useEffect } from 'react';
import { getVisitLogs } from '../lib/visitService';
import { useAuth } from '../utils/authContext';

export const useVisitLogs = (initialVisitLogs) => {
  const [visits, setVisits] = useState(Array.isArray(initialVisitLogs) ? initialVisitLogs : []);
  const [filteredVisits, setFilteredVisits] = useState(Array.isArray(initialVisitLogs) ? initialVisitLogs : []);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const { user } = useAuth();

  const fetchVisitLogs = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getVisitLogs();
      setVisits(data);
      setFilteredVisits(data);
    } catch (error) {
      console.error('Error fetching visit logs:', error);
      setSnackbar({ open: true, message: 'Error fetching visit logs', severity: 'error' });
    }
  }, [user]);

  useEffect(() => {
    fetchVisitLogs();
  }, [fetchVisitLogs]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    filteredVisits,
    page,
    rowsPerPage,
    snackbar,
    setSnackbar,
    handlePageChange,
    handleRowsPerPageChange,
  };
};