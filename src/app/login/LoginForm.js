'use client'

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { styled } from '@mui/material/styles'; // Add this import
import { Typography, TextField, Button, Box, InputAdornment, IconButton, Paper, Link } from '@mui/material';
import { Visibility, VisibilityOff, AccountCircle, Lock } from '@mui/icons-material';
import { useAuth } from '../../utils/authContext';
import { useLogin } from '../../hooks/useLogin';
import Image from 'next/image';
import { useMediaQuery, useTheme } from '@mui/material';

const CustomTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'transparent',
    '& fieldset': {
      borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
    },
    '&:hover fieldset': {
      borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.87)' : 'rgba(255, 255, 255, 0.87)',
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const LoginForm = () => {
  const { signIn } = useAuth();
  const { email, password, error, isLoading, handleEmailChange, handlePasswordChange, handleSubmit } = useLogin(signIn);
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClickShowPassword = useCallback(() => setShowPassword(prev => !prev), []);

  const isSubmitDisabled = !email || !password || isLoading;

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Box sx={{ 
        maxWidth: isMobile ? '100%' : 400, 
        width: '100%', 
        margin: 'auto', 
        mt: isMobile ? 2 : 4,
        px: isMobile ? 2 : 0
      }}>
        <Paper elevation={3} sx={{ p: isMobile ? 3 : 4, borderRadius: 4 }}>
          <motion.div variants={itemVariants}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Image
                src="/BJMP-icon.png"
                alt="BJMP MIMAROPA Logo"
                width={isMobile ? 100 : 150}
                height={isMobile ? 100 : 150}
                priority
                style={{ marginBottom: '16px' }}
              />
              <Typography variant={isMobile ? "h5" : "h4"} component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
                BJMP VMS
              </Typography>
              <Typography variant={isMobile ? "body2" : "subtitle1"} align="center" color="text.secondary">
                Visitor Management System
              </Typography>
            </Box>
          </motion.div>
          <form onSubmit={handleSubmit} noValidate>
            <motion.div variants={itemVariants}>
              <CustomTextField
                label="Personnel ID"
                fullWidth
                margin="normal"
                value={email}
                onChange={handleEmailChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountCircle />
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                autoComplete="username"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CustomTextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                margin="normal"
                value={password}
                onChange={handlePasswordChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                autoComplete="current-password"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth 
                sx={{ mt: 2, borderRadius: 2 }}
                disabled={isSubmitDisabled}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </motion.div>
            {error && (
              <motion.div variants={itemVariants}>
                <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
                  {error}
                </Typography>
              </motion.div>
            )}
          </form>
          <motion.div variants={itemVariants}>
            <Typography variant="caption" sx={{ mt: 3, display: 'block', textAlign: 'center', fontSize: isMobile ? '0.7rem' : '0.8rem', fontWeight: 'medium', color: theme.palette.text.secondary, bgcolor: theme.palette.background.paper, p: 1, borderRadius: 1 }}>
              This is an official BJMP Visitor Management System. Unauthorized access is strictly prohibited and punishable by law.
            </Typography>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Typography variant="caption" sx={{ mt: 2, display: 'block', textAlign: 'center', color: theme.palette.text.secondary }}>
              © {new Date().getFullYear()} Bureau of Jail Management and Penology. All rights reserved.
            </Typography>
          </motion.div>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default LoginForm;