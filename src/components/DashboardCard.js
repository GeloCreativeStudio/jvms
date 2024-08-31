import React from 'react';
import { Card, CardContent, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import CountUp from 'react-countup';
import PropTypes from 'prop-types';

const DashboardCard = ({ title, value, icon: Icon }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card 
      elevation={3} 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: theme.shadows[6],
        },
      }}
    >
      <CardContent 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: theme.spacing(3),
        }}
      >
        <Icon 
          color="primary" 
          sx={{ 
            fontSize: isMobile ? 36 : 48, 
            mb: 2,
            transition: 'transform 0.3s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }} 
        />
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          gutterBottom 
          align="center"
          sx={{ fontWeight: 'medium' }}
        >
          {title}
        </Typography>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          color="primary"
          sx={{ fontWeight: 'bold' }}
        >
          <CountUp end={value} duration={2} />
        </Typography>
      </CardContent>
    </Card>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.elementType.isRequired,
};

export default DashboardCard;