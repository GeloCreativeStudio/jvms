'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import DataTable from '../../components/DataTable';
import { SnackbarAlert } from '../../components/SnackbarAlert';
import { Button, Box, Modal, Fade, Backdrop, TextField, Autocomplete, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useViolationRecord } from '../../hooks/useViolationRecord';
import { formatDate } from '../../utils/dateUtils';
import { searchVisitors } from '../../lib/violationService';
import { PageLayout } from '../../components/PageLayout';
import debounce from 'lodash/debounce';
import { useAuth } from '../../utils/authContext';

const ViolationModal = ({
  isOpen,
  onClose,
  selectedViolation,
  formData,
  handleFormChange,
  handleSubmit,
  visitorOptions,
  handleVisitorChange,
  setVisitorSearchTerm
}) => {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{ timeout: 500 }}
    >
      <Fade in={isOpen}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
        }}>
          <h2>{selectedViolation ? 'Edit Violation' : 'Record New Violation'}</h2>
          <form onSubmit={handleSubmit}>
            <Autocomplete
              fullWidth
              options={visitorOptions}
              getOptionLabel={(option) => `${option.name}`}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Visitor"
                  margin="normal"
                  onChange={(e) => setVisitorSearchTerm(e.target.value)}
                />
              )}
              onChange={handleVisitorChange}
              value={formData.visitor_id ? { id: formData.visitor_id, name: formData.visitor_name } : null}
            />
            <TextField
              fullWidth margin="normal" label="PDL ID" name="pdl_id"
              value={formData.pdl_id} onChange={handleFormChange}
            />
            <TextField
              fullWidth margin="normal" label="Contraband" name="contraband"
              value={formData.contraband} onChange={handleFormChange} required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="violation-level-label">Violation Level</InputLabel>
              <Select
                labelId="violation-level-label"
                name="level"
                value={formData.level}
                onChange={handleFormChange}
                required
                label="violation level"
              >
                <MenuItem value="minor">Minor</MenuItem>
                <MenuItem value="major">Major</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth margin="normal" label="Security Notes" name="security_notes"
              value={formData.security_notes} onChange={handleFormChange}
              multiline rows={4} required
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" sx={{ flex: 1, mr: 1 }}>
                {selectedViolation ? 'Update' : 'Submit'} Violation
              </Button>
              <Button variant="outlined" color="primary" onClick={onClose} sx={{ flex: 1, ml: 1 }}>
                Close
              </Button>
            </Box>
          </form>
        </Box>
      </Fade>
    </Modal>
  );
};

const ViolationRecordClient = ({ initialViolations }) => {
  const { user } = useAuth();
  const tenantId = user?.tenantId;

  const {
    filteredViolations,
    isModalOpen,
    selectedViolation,
    formData,
    snackbar,
    page,
    rowsPerPage,
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
  } = useViolationRecord(initialViolations, tenantId);

  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');
  const [visitorOptions, setVisitorOptions] = useState([]);

  const debouncedSearchVisitors = useCallback(
    debounce(async (term) => {
      if (term.length > 2) {
        const visitors = await searchVisitors(term);
        setVisitorOptions(visitors);
      } else {
        setVisitorOptions([]);
      }
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearchVisitors(visitorSearchTerm);
  }, [visitorSearchTerm, debouncedSearchVisitors]);

  const columns = useMemo(() => [
    { 
      id: 'visitor_name', 
      label: 'Visitor Name', 
      render: (row) => row.visitor?.name || 'N/A'
    },
    { id: 'pdl_id', label: 'PDL ID', render: (row) => row.pdl_id || 'N/A' },
    { id: 'contraband', label: 'Contraband', render: (row) => row.contraband || 'N/A' },
    { 
      id: 'level', 
      label: 'Violation Level', 
      chip: (value) => ({
        label: value ? value.charAt(0).toUpperCase() + value.slice(1) : 'N/A',
        color: value === 'minor' ? 'success' : (value === 'major' ? 'warning' : 'error'),
        size: 'small'
      })
    },
    { id: 'security_notes', label: 'Security Notes', render: (row) => row.security_notes || 'N/A' },
    { 
      id: 'created_at', 
      label: 'Created At', 
      render: (row) => formatDate(row.created_at) || 'N/A',
      chip: (value) => ({
        label: formatDate(value) || 'N/A',
        color: 'default',
        size: 'small'
      })
    },
    { 
      id: 'actions', 
      label: 'Actions', 
      render: (row) => (
        <>
          <Button onClick={() => handleEdit(row)} size="small" color="primary">
            Edit
          </Button>
          <Button onClick={() => handleDelete(row.id)} size="small" color="error">
            Delete
          </Button>
        </>
      ),
    },
  ], [handleEdit, handleDelete]);

  const handleVisitorChange = useCallback((event, newValue) => {
    if (newValue) {
      setFormData(prevData => ({
        ...prevData,
        visitor_id: newValue.id,
        visitor_name: newValue.name
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        visitor_id: '',
        visitor_name: ''
      }));
    }
  }, [setFormData]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <PageLayout title="Violation Records">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleModalOpen}
            >
              Record Violation
            </Button>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DataTable
            columns={columns}
            data={filteredViolations}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </motion.div>

        <ViolationModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          selectedViolation={selectedViolation}
          formData={formData}
          handleFormChange={handleFormChange}
          handleSubmit={handleSubmit}
          visitorOptions={visitorOptions}
          handleVisitorChange={handleVisitorChange}
          setVisitorSearchTerm={setVisitorSearchTerm}
        />

        <motion.div variants={itemVariants}>
          <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          />
        </motion.div>
      </motion.div>
    </PageLayout>
  );
};

export default ViolationRecordClient;