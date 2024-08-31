import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Button, Typography, Modal } from '@mui/material';

const QRCodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    let scanner = null;

    if (isOpen) {
      scanner = new Html5Qrcode("reader");
      scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 250 },
        (decodedText) => {
          console.log('QR Code scanned:', decodedText);
          onScanSuccess(decodedText);
          onClose();
        },
        (error) => {
          console.error('Scan error:', error);
          setError('Failed to scan. Please try again.');
        }
      ).catch((err) => {
        console.error('Start scanner error:', err);
        setError('Failed to start scanner. Please check camera permissions.');
      });
    }

    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  return (
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 300,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Scan QR Code
        </Typography>
        <Box sx={{ width: '100%', height: 250, mb: 2 }}>
          <div id="reader" style={{ width: '100%', height: '100%' }} />
        </Box>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Button onClick={onClose} variant="contained" fullWidth>
          Close
        </Button>
      </Box>
    </Modal>
  );
};

export default React.memo(QRCodeScannerModal);