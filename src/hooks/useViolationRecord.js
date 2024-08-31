import { useState, useCallback, useEffect, useMemo } from 'react';
import { getViolations, createViolation, updateViolation, deleteViolation } from '../lib/violationService';

export const useViolationRecord = (initialViolations = []) => {
  const [violations, setViolations] = useState(Array.isArray(initialViolations) ? initialViolations : []);
  const [filteredViolations, setFilteredViolations] = useState(Array.isArray(initialViolations) ? initialViolations : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [formData, setFormData] = useState({
    visitor_id: '',
    visitor_name: '',
    pdl_id: '',
    contraband: '',
    level: 'minor',
    security_notes: ''
  });
  
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchViolations = useCallback(async () => {
    try {
      const data = await getViolations();
      setViolations(data);
      setFilteredViolations(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching violations', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const filteredViolationsData = useMemo(() => {
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    return Array.isArray(violations) ? violations.filter(violation => 
      violation.contraband.toLowerCase().includes(lowercaseSearchTerm) &&
      (filterLevel === 'all' || violation.level === filterLevel)
    ) : [];
  }, [violations, searchTerm, filterLevel]);

  useEffect(() => {
    setFilteredViolations(filteredViolationsData);
  }, [filteredViolationsData]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((e) => {
    setFilterLevel(e.target.value);
  }, []);

  const handleModalOpen = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const resetForm = useCallback(() => {
    setSelectedViolation(null);
    setFormData({
      visitor_id: '',
      pdl_id: '',
      contraband: '',
      level: 'minor',
      security_notes: ''
    });
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    resetForm();
  }, [resetForm]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }, []);

  const handleEdit = useCallback((violation) => {
    setSelectedViolation(violation);
    setFormData({
      visitor_id: violation.visitor_id,
      visitor_name: violation.visitors?.name || '',
      pdl_id: violation.pdl_id,
      contraband: violation.contraband,
      level: violation.level,
      security_notes: violation.security_notes
    });
    setIsModalOpen(true);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const violationData = {
        visitor_id: formData.visitor_id,
        pdl_id: formData.pdl_id,
        contraband: formData.contraband,
        level: formData.level,
        security_notes: formData.security_notes
      };
      
      if (selectedViolation) {
        await updateViolation(selectedViolation.id, violationData);
      } else {
        await createViolation(violationData);
      }
      setSnackbar({ open: true, message: `Violation ${selectedViolation ? 'updated' : 'recorded'} successfully`, severity: 'success' });
      handleModalClose();
      fetchViolations();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  }, [formData, selectedViolation, handleModalClose, fetchViolations]);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteViolation(id);
      setSnackbar({ open: true, message: 'Violation deleted successfully', severity: 'success' });
      fetchViolations();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  }, [fetchViolations]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    violations,
    filteredViolations,
    searchTerm,
    filterLevel,
    isModalOpen,
    selectedViolation,
    formData,
    snackbar,
    page,
    rowsPerPage,
    handleSearchChange,
    handleFilterChange,
    handleModalOpen,
    handleModalClose,
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handlePageChange,
    handleRowsPerPageChange,
    setSnackbar,
    setFormData
  };
};