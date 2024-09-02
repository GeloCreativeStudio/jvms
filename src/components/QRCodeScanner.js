import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Button, Typography, Modal } from '@mui/material';

const QRCodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const readerRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    let scanner = null;

    const startScanner = () => {
      if (readerRef.current) {
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
            if (!errorTimeoutRef.current) {
              console.error('Scan error:', error);
              setError('Failed to scan. Please try again.');
              errorTimeoutRef.current = setTimeout(() => {
                errorTimeoutRef.current = null;
              }, 2000); // Debounce error logging every 2 seconds
            }
          }
        ).catch((err) => {
          console.error('Start scanner error:', err);
          setError('Failed to start scanner. Please check camera permissions.');
        });
      } else {
        setTimeout(startScanner, 100); // Retry after 100ms if readerRef is not ready
      }
    };

    if (isOpen) {
      console.log('Starting scanner...');
      startScanner();
    }

    return () => {
      if (scanner) {
        console.log('Stopping scanner...');
        scanner.stop().catch(console.error);
      }
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
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
          <div id="reader" ref={readerRef} style={{ width: '100%', height: '100%' }} />
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