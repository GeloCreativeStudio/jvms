'use client'

import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Divider, Paper } from '@mui/material';
import { styled } from '@mui/system';

const StyledPaper = styled(Paper)(({ theme }) => ({
  maxWidth: 1200,
  margin: '0 auto',
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    padding: theme.spacing(4),
  },
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[3],
}));

const PageTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(2),
  fontSize: '1.5rem',
  [theme.breakpoints.up('md')]: {
    marginBottom: theme.spacing(3),
    fontSize: '2rem',
  },
  position: 'relative',
  paddingBottom: theme.spacing(1),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '40px',
    height: '3px',
    [theme.breakpoints.up('md')]: {
      width: '60px',
      height: '4px',
    },
    backgroundColor: theme.palette.primary.main,
    borderRadius: theme.shape.borderRadius,
  },
}));

export const PageLayout = React.memo(({ title, children }) => {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <StyledPaper elevation={3}>
      <PageTitle variant={isMdUp ? "h4" : "h5"}>
        {title}
      </PageTitle>
      <Divider sx={{ mb: isMdUp ? 4 : 2 }} />
      <Box sx={{ '& > *:not(:last-child)': { mb: isMdUp ? 4 : 2 } }}>
        {children}
      </Box>
    </StyledPaper>
  );
});

PageLayout.displayName = 'PageLayout';