'use client'

import React, { useMemo, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { PageLayout } from '../../components/PageLayout';
import DataTable from '../../components/DataTable';
import {
  Button, Select, MenuItem, FormControl, InputLabel, Box, Modal, Fade, Backdrop,
  TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useVisitorManagement } from '../../hooks/useVisitorManagement';
import { formatDate } from '../../utils/dateUtils';

const VisitorManagementClient = ({ initialVisitors }) => {
  const {
    filteredVisitors,
    isModalOpen,
    selectedVisitor,
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
    setSnackbar
  } = useVisitorManagement(initialVisitors);

  const columns = useMemo(() => [
    { id: 'name', label: 'Name', render: (row) => row.name || 'N/A' },
    { id: 'contact', label: 'Contact', render: (row) => row.contact || 'N/A' },
    { 
      id: 'visitor_type', 
      label: 'Visitor Type', 
      chip: (value) => ({
        label: value || 'N/A',
        color: value === 'PDL Visitor' ? 'primary' : (value === 'Service Provider' ? 'secondary' : 'warning'),
        size: 'small'
      })
    },
    { id: 'relationship', label: 'Relationship', render: (row) => row.relationship || 'N/A' },
    { id: 'address', label: 'Address', render: (row) => row.address || 'N/A' },
    { id: 'pdl_visited', label: 'PDL Visited', render: (row) => row.pdl_visited || 'N/A' },
    { 
      id: 'created_at', 
      label: 'Created At', 
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
          <Button onClick={() => setConfirmationModal({
            open: true,
            message: `Are you sure you want to delete the visitor "${row.name}"? This action cannot be undone.`,
            onConfirm: () => handleDelete(row.id)
          })} size="small" color="error">
            Delete
          </Button>
        </>
      ),
    },
  ], [handleEdit, handleDelete]);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
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

  const [confirmationModal, setConfirmationModal] = useState({ open: false, message: '', onConfirm: null });

  const handleSnackbarClose = useCallback(() => {
    setSnackbar({ ...snackbar, open: false });
  }, [snackbar, setSnackbar]);

  return (
    <PageLayout title="Visitor Management">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleModalOpen}
            >
              Register New Visitor
            </Button>
          </Box>
        </motion.div>

        <motion.div variants={itemVariants}>
          <DataTable
            columns={columns}
            data={filteredVisitors}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </motion.div>

        <Modal
          open={isModalOpen}
          onClose={handleModalClose}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={isModalOpen}>
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
              <h2>{selectedVisitor ? 'Edit Visitor' : 'Register New Visitor'}</h2>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth margin="normal" label="Name" name="name"
                  value={formData.name} onChange={handleFormChange} required
                />
                <TextField
                  fullWidth margin="normal" label="Contact Number" name="contact"
                  value={formData.contact} onChange={handleFormChange} required
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="visitor-type-label">Visitor Type</InputLabel>
                  <Select
                    labelId="visitor-type-label"
                    name="visitor_type"
                    value={formData.visitor_type}
                    onChange={handleFormChange}
                    required
                    label="Visitor Type"
                  >
                    <MenuItem value="PDL Visitor">PDL Visitor</MenuItem>
                    <MenuItem value="Service Provider">Service Provider</MenuItem>
                    <MenuItem value="Personnel">Personnel</MenuItem>
                  </Select>
                </FormControl>
                {formData.visitor_type === 'PDL Visitor' && (
                  <>
                    <TextField
                      fullWidth margin="normal" label="Relationship" name="relationship"
                      value={formData.relationship} onChange={handleFormChange} required
                    />
                    <TextField
                      fullWidth margin="normal" label="PDL Visited" name="pdl_visited"
                      value={formData.pdl_visited} onChange={handleFormChange} required
                    />
                  </>
                )}
                <TextField
                  fullWidth margin="normal" label="Address" name="address"
                  value={formData.address} onChange={handleFormChange} required multiline rows={3}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button type="submit" variant="contained" color="primary" sx={{ flex: 1, mr: 1 }}>
                    {selectedVisitor ? 'Update' : 'Register'} Visitor
                  </Button>
                  <Button variant="outlined" color="primary" onClick={handleModalClose} sx={{ flex: 1, ml: 1 }}>
                    Close
                  </Button>
                </Box>
              </form>
            </Box>
          </Fade>
        </Modal>

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
      </motion.div>
    </PageLayout>
  );
};

VisitorManagementClient.displayName = 'VisitorManagementClient';

export default React.memo(VisitorManagementClient);