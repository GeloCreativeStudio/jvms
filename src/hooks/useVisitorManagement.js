import { useState, useCallback, useEffect, useMemo } from 'react';
import { getVisitors, createVisitor, updateVisitor, deleteVisitor } from '../lib/visitorService';

export const useVisitorManagement = (initialVisitors) => {
  const [visitors, setVisitors] = useState(Array.isArray(initialVisitors) ? initialVisitors : []);
  const [searchTerm, setSearchTerm] = useState('');
  const [visitorTypeFilter, setVisitorTypeFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    visitor_type: 'PDL Visitor',
    relationship: '',
    address: '',
    pdl_visited: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchVisitors = useCallback(async () => {
    try {
      const data = await getVisitors();
      setVisitors(data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error fetching visitors', severity: 'error' });
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const filteredVisitors = useMemo(() => {
    return (visitors || []).filter(visitor => {
      const matchesSearch = visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        visitor.pdl_visited?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = visitorTypeFilter === 'All' || visitor.visitor_type === visitorTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [visitors, searchTerm, visitorTypeFilter]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleFilterChange = useCallback((event, newValue) => {
    setVisitorTypeFilter(newValue);
  }, []);

  const handleModalOpen = useCallback(() => {
    setSelectedVisitor(null);
    setFormData({
      name: '',
      contact: '',
      visitor_type: 'PDL Visitor',
      relationship: '',
      address: '',
      pdl_visited: ''
    });
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      if (selectedVisitor) {
        await updateVisitor(selectedVisitor.id, formData);
        setSnackbar({ open: true, message: 'Visitor updated successfully', severity: 'success' });
      } else {
        await createVisitor(formData);
        setSnackbar({ open: true, message: 'Visitor created successfully', severity: 'success' });
      }
      fetchVisitors();
      handleModalClose();
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    }
  }, [formData, selectedVisitor, fetchVisitors, handleModalClose]);

  const handleEdit = useCallback((visitor) => {
    setSelectedVisitor(visitor);
    setFormData(visitor);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id) => {
    try {
      await deleteVisitor(id);
      setSnackbar({ open: true, message: 'Visitor deleted successfully', severity: 'success' });
      setVisitors(prevVisitors => prevVisitors.filter(visitor => visitor.id !== id));
    } catch (error) {
      console.error('Error deleting visitor:', error);
      setSnackbar({ open: true, message: `Error deleting visitor: ${error.message}`, severity: 'error' });
      fetchVisitors();
    }
  }, [fetchVisitors]);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  return {
    visitors,
    filteredVisitors,
    searchTerm,
    visitorTypeFilter,
    isModalOpen,
    selectedVisitor,
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
    setSnackbar
  };
};