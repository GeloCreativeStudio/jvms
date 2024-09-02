'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  TextField, Button, Box, Grid, Modal, Fade, Backdrop, CircularProgress, Typography, IconButton, Tooltip, Autocomplete
} from '@mui/material';
import { QrCodeScanner, ArrowForward, Close, CameraAlt, CameraRear } from '@mui/icons-material';
import { useCheckInOut } from '../../hooks/useCheckInOut';
import { SnackbarAlert } from '../../components/SnackbarAlert';
import { PageLayout } from '../../components/PageLayout';
import { motion } from 'framer-motion';
import { searchVisitors, searchVisitorById } from '../../lib/violationService';
import { useAuth } from '../../utils/authContext';
import QRCodeScannerModal from '../../components/QRCodeScanner';

const CheckInOutForm = React.memo(({ type, onSubmit }) => {
  const [visitorId, setVisitorId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [visitorOptions, setVisitorOptions] = useState([]);
  const [visitorSearchTerm, setVisitorSearchTerm] = useState('');

  useEffect(() => {
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }, []);

  useEffect(() => {
    const fetchVisitors = async () => {
      if (visitorSearchTerm.length > 2) {
        try {
          const visitors = await searchVisitors(visitorSearchTerm);
          setVisitorOptions(visitors);
        } catch (error) {
          console.error('Error fetching visitors:', error);
        }
      }
    };

    fetchVisitors();
  }, [visitorSearchTerm]);

  const handleQRScan = useCallback(async (result) => {
    console.log('QR scan result:', result);
    try {
      const visitor = await searchVisitorById(result);
      if (visitor) {
        setVisitorId(visitor.id);
        setVisitorOptions([visitor]);
      } else {
        console.error('Visitor not found');
      }
    } catch (error) {
      console.error('Error fetching visitor by ID:', error);
    }
    setIsQRModalOpen(false);
  }, []);

  const openQRScanner = useCallback(() => {
    setIsQRModalOpen(true);
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(visitorId, purpose);
  }, [onSubmit, visitorId, purpose]);

  const handleVisitorChange = useCallback((event, newValue) => {
    if (newValue) {
      setVisitorId(newValue.id);
    } else {
      setVisitorId('');
    }
  }, []);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', flexGrow: 1 }}>
      <Typography 
        variant="h6" 
        component="h2" 
        gutterBottom 
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        {type === 'in' ? 'Check In' : 'Check Out'}
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
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
            value={visitorId ? visitorOptions.find(option => option.id === visitorId) : null}
          />
          <Tooltip title="Scan QR Code">
            <IconButton 
              onClick={openQRScanner}
              sx={{ 
                position: 'absolute', 
                right: 8, 
                top: '50%', 
                transform: 'translateY(-50%)',
              }}
            >
              <QrCodeScanner />
            </IconButton>
          </Tooltip>
        </Box>
        {type === 'in' && (
          <TextField
            fullWidth
            label="Visit Purpose"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            required
          />
        )}
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth 
          endIcon={<ArrowForward />}
        >
          {type === 'in' ? 'Check In' : 'Check Out'}
        </Button>
      </Box>
      {isMobile ? (
        <QRCodeScannerModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          onScanSuccess={handleQRScan}
        />
      ) : (
        <Modal
          open={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{ timeout: 500 }}
        >
          <Fade in={isQRModalOpen}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxWidth: 350,
              textAlign: 'center',
            }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
                QR Scanning Not Available
              </Typography>
              <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                <QrCodeScanner sx={{ fontSize: 60, color: 'text.secondary' }} />
              </Box>
              <Typography sx={{ mb: 2 }}>
                QR code scanning is only available on <strong>mobile devices</strong>.
              </Typography>
              <Button 
                onClick={() => setIsQRModalOpen(false)} 
                variant="contained" 
                color="primary"
              >
                Understood
              </Button>
            </Box>
          </Fade>
        </Modal>
      )}
    </Box>
  );
});
CheckInOutForm.displayName = 'CheckInOutForm';

const CheckInOutClient = () => {
  const { user } = useAuth();
  const {
    message,
    isLoading,
    handleCheckInOut,
    setMessage
  } = useCheckInOut();

  const [localMessage, setLocalMessage] = useState({ text: '', severity: 'info' });

  const handleSetMessage = useCallback((newMessage) => {
    if (setMessage) {
      setMessage(newMessage);
    } else {
      setLocalMessage(newMessage);
    }
  }, [setMessage]);

  const handleCloseSnackbar = useCallback(() => {
    handleSetMessage({ text: '', severity: 'info' });
  }, [handleSetMessage]);

  const messageToShow = message || localMessage;

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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

  const handleCheckIn = useCallback((visitorId, purpose) => {
    if (!user) {
      handleSetMessage({ text: 'User not authenticated', severity: 'error' });
      return;
    }
    handleCheckInOut(visitorId, purpose, true);
  }, [handleCheckInOut, user, handleSetMessage]);

  const handleCheckOut = useCallback((visitorId) => {
    if (!user) {
      handleSetMessage({ text: 'User not authenticated', severity: 'error' });
      return;
    }
    handleCheckInOut(visitorId, null, false);
  }, [handleCheckInOut, user, handleSetMessage]);

  return (
    <PageLayout title="Check-in / Check-out">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box sx={{ p: 2, maxWidth: 1000, margin: '0 auto' }}>
          <Grid container spacing={4} alignItems="stretch">
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <motion.div variants={itemVariants} style={{ width: '100%' }}>
                <CheckInOutForm type="in" onSubmit={handleCheckIn} />
              </motion.div>
            </Grid>
            <Grid item xs={12} sx={{ display: { xs: 'block', md: 'none' } }}>
              <Box
                sx={{
                  height: '1px',
                  bgcolor: 'divider',
                  my: 2,
                  width: '100%',
                }}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex' }}>
              <Box
                sx={{
                  width: '1px',
                  bgcolor: 'divider',
                  mx: { xs: 'auto', md: 0 },
                  my: { xs: 4, md: 0 },
                  display: { xs: 'none', md: 'block' },
                }}
              />
              <motion.div variants={itemVariants} style={{ width: '100%' }}>
                <CheckInOutForm type="out" onSubmit={handleCheckOut} />
              </motion.div>
            </Grid>
          </Grid>
        </Box>
      </motion.div>
      <SnackbarAlert
        open={!!(message.text || localMessage.text)}
        message={message.text || localMessage.text}
        severity={message.severity || localMessage.severity}
        onClose={handleCloseSnackbar}
      />
      <Modal
        open={isLoading}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{ timeout: 500 }}
      >
        <Fade in={isLoading}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Processing...</Typography>
          </Box>
        </Fade>
      </Modal>
    </PageLayout>
  );
};
CheckInOutClient.displayName = 'CheckInOutClient';

export default React.memo(CheckInOutClient);