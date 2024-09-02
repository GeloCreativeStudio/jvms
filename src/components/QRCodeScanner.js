import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Box, Button, Typography, Modal, IconButton } from '@mui/material';
import { CameraAlt, CameraRear } from '@mui/icons-material';

const QRCodeScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [error, setError] = useState(null);
  const [cameraFacing, setCameraFacing] = useState('environment');
  const readerRef = useRef(null);
  const errorTimeoutRef = useRef(null);

  useEffect(() => {
    let scanner = null;

    const startScanner = () => {
      if (readerRef.current) {
        scanner = new Html5Qrcode("reader");
        scanner.start(
          { facingMode: cameraFacing },
          { fps: 10, qrbox: { width: 250, height: 350 } }, // Adjusted qrbox size for portrait view
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
              }, 2000);
            }
          }
        ).catch((err) => {
          console.error('Start scanner error:', err);
          setError('Failed to start scanner. Please check camera permissions.');
        });
      } else {
        setTimeout(startScanner, 100);
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
  }, [isOpen, onClose, onScanSuccess, cameraFacing]);

  const toggleCamera = () => {
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

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
        <Box sx={{ width: '100%', height: 350, mb: 2 }}> {/* Adjusted height for portrait view */}
          <div id="reader" ref={readerRef} style={{ width: '100%', height: '100%' }} />
        </Box>
        {error && (
          <Typography color="error" align="center" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <IconButton onClick={toggleCamera}>
            {cameraFacing === 'environment' ? <CameraRear /> : <CameraAlt />}
          </IconButton>
          <Button onClick={onClose} variant="contained">
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default React.memo(QRCodeScannerModal);