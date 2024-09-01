import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  AppBar, Toolbar, Typography, IconButton, Box, useTheme, useMediaQuery, Button,
  Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Tooltip, Zoom, Avatar,
  BottomNavigation, BottomNavigationAction, Menu, MenuItem as MuiMenuItem
} from '@mui/material';
import { 
  Dashboard, People, Login, ListAlt, Settings, Logout, ReportProblem,
  ChevronLeft, ChevronRight, Menu as MenuIcon, QrCode
} from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../utils/authContext';
import QrCodeIcon from '@mui/icons-material/QrCode2'; // Import a more prominent QR code icon
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const drawerWidth = 280;
const closedDrawerWidth = 72;

const MenuItem = React.memo(({ item, isSelected, isDesktop, desktopOpen }) => {
  const theme = useTheme();

  const isQRCode = item.text === 'Check-in/out';

  return (
    <ListItem 
      button 
      component={Link}
      href={item.path}
      selected={isSelected}
      sx={{
        my: 0.5,
        mx: 1,
        borderRadius: 1,
        transition: theme.transitions.create(['background-color', 'color'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&.Mui-selected': {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          '& .MuiListItemIcon-root': {
            color: 'primary.contrastText',
          },
        },
        '&:hover': {
          backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
        },
      }}
    >
      <ListItemIcon sx={{ 
        color: isSelected ? 'inherit' : 'text.secondary',
        minWidth: 40,
      }}>
        <item.icon />
      </ListItemIcon>
      {(isDesktop ? desktopOpen : true) && <ListItemText primary={item.text} />}
    </ListItem>
  );
});

MenuItem.displayName = 'MenuItem';

const NavigationLayout = React.memo(({ children }) => {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const menuItems = useMemo(() => [
    { text: 'Dashboard', icon: Dashboard, path: '/dashboard', ariaLabel: 'Go to Dashboard' },
    { text: isMobile ? 'Visitor' : 'Visitor Management', icon: People, path: '/visitor-management', ariaLabel: 'Manage Visitors' },
    { text: 'Check-in/out', icon: QrCodeIcon, mobileIcon: QrCode, path: '/check-in-out', ariaLabel: 'Check-in or Check-out' },
    { text: 'Visit Logs', icon: ListAlt, path: '/visit-logs', ariaLabel: 'View Visit Logs' },
    { text: isMobile ? 'Violation' : 'Violation Record', icon: ReportProblem, path: '/violation-record', ariaLabel: 'View Violation Records' },
  ], [isMobile]);

  const [desktopOpen, setDesktopOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = useCallback(() => {
    setDesktopOpen((prev) => !prev);
  }, []);

  const handleLogout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const drawer = useMemo(() => (
    <>
      <Toolbar sx={{ 
        minHeight: 64, 
        backgroundColor: 'primary.main', 
        color: 'primary.contrastText',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        px: 2,
      }}>
        <Typography variant="h6" noWrap component="div" sx={{ 
          fontWeight: 'bold',
          fontSize: desktopOpen ? '1.2rem' : '1rem',
          transition: theme.transitions.create('font-size'),
        }}>
          {desktopOpen ? 'VMS Menu' : 'VMS'}
        </Typography>
        <IconButton 
          onClick={handleDrawerToggle} 
          sx={{ 
            color: 'inherit',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}
        >
          {desktopOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>
      </Toolbar>
      <Divider />
      {desktopOpen && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <Avatar 
            src={user?.user_metadata?.avatar_url} 
            alt={user?.user_metadata?.display_name || user?.email}
            sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
          >
            {(user?.user_metadata?.display_name || user?.email)?.[0]?.toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {user?.user_metadata?.display_name || 'User Name'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      )}
      <Divider />
      <List sx={{ py: 1, flexGrow: 1 }}>
        {menuItems.map((item, index) => (
          <MenuItem 
            key={index} 
            item={item} 
            isSelected={pathname === item.path}
            isDesktop={isDesktop}
            desktopOpen={desktopOpen}
          />
        ))}
      </List>
    </>
  ), [desktopOpen, user, pathname, handleDrawerToggle, menuItems, isDesktop, theme.transitions]);

  const bottomNav = useMemo(() => (
    <BottomNavigation
      value={pathname}
      onChange={(event, newValue) => {
        // Handle navigation here if needed
      }}
      showLabels={false}
      sx={{
        width: '100%',
        position: 'fixed',
        bottom: 0,
        borderTop: 1,
        borderColor: 'divider',
        zIndex: theme.zIndex.appBar + 1, // Ensure BottomNavigation is above everything
        height: 72, // Increase height a bit more to accommodate text below the circle
        '& .MuiBottomNavigationAction-root': {
          minWidth: 'auto',
          padding: '6px 0 0',
          flex: 1,
        },
      }}
    >
      {menuItems.map((item, index) => {
        const isQRCode = item.text === 'Check-in/out';
        return (
          <BottomNavigationAction
            key={index}
            component={Link}
            href={item.path}
            icon={
              isQRCode ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    position: 'relative',
                    top: -16, // Move the entire button up
                  }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <QrCodeIcon sx={{ fontSize: 32, color: 'primary.contrastText' }} />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.primary',
                      fontSize: '0.75rem',
                      marginTop: '4px',
                      fontWeight: 'bold',
                    }}
                  >
                    QR
                  </Typography>
                </Box>
              ) : (
                <>
                  {item.mobileIcon ? <item.mobileIcon /> : <item.icon />}
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontSize: '0.7rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                  >
                    {item.text}
                  </Typography>
                </>
              )
            }
            sx={{
              color: pathname === item.path ? 'primary.main' : 'text.secondary',
              '&.Mui-selected': {
                color: 'primary.main',
              },
            }}
          />
        );
      })}
    </BottomNavigation>
  ), [pathname, menuItems, theme.zIndex.appBar]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', lg: `calc(100% - ${desktopOpen ? drawerWidth : closedDrawerWidth}px)` },
          ml: { xs: 0, lg: desktopOpen ? `${drawerWidth}px` : `${closedDrawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1, // Ensure AppBar is above the Drawer
        }}
      >
        <Toolbar sx={{ height: 64, justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div" sx={{ 
            fontWeight: 'bold',
          }}>
            {isSmUp ? 'Visitor Management System' : 'VMS'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile ? (
              <>
                <Tooltip title="Help" placement="bottom">
                  <IconButton
                    color="inherit"
                    aria-label="Help"
                    sx={{ mr: 1 }}
                  >
                    <HelpOutlineIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Settings" placement="bottom">
                  <IconButton
                    color="inherit"
                    aria-label="Settings"
                    component={Link}
                    href="/settings"
                    sx={{ mr: 1 }}
                  >
                    <SettingsIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Logout" placement="bottom">
                  <IconButton
                    color="inherit"
                    onClick={handleLogout}
                    aria-label="Logout"
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMenuOpen}
                  aria-label="User Profile"
                >
                  <AccountCircleIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  <Box sx={{ p: 2, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar 
                        src={user?.user_metadata?.avatar_url} 
                        alt={user?.user_metadata?.display_name || user?.email}
                        sx={{ width: 40, height: 40, mr: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}
                      >
                        {(user?.user_metadata?.display_name || user?.email)?.[0]?.toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {user?.user_metadata?.display_name || 'User Name'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user?.email}
                        </Typography>
                      </Box>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <MuiMenuItem component={Link} href="/settings" onClick={handleMenuClose}>
                      <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Settings</ListItemText>
                    </MuiMenuItem>
                    <MuiMenuItem onClick={() => { handleMenuClose(); handleLogout(); }}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MuiMenuItem>
                  </Box>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {isDesktop ? (
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: desktopOpen ? drawerWidth : closedDrawerWidth,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              zIndex: theme.zIndex.drawer, // Ensure Drawer is above the main content
            },
          }}
          open={desktopOpen}
        >
          {drawer}
        </Drawer>
      ) : (
        bottomNav
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { 
            xs: '100%',
            lg: `calc(100% - ${desktopOpen ? drawerWidth : closedDrawerWidth}px)`
          },
          ml: { 
            xs: 0,
            lg: desktopOpen ? `${drawerWidth}px` : `${closedDrawerWidth}px`
          },
          mt: ['48px', '56px', '64px'],
          mb: { xs: '56px', lg: 0 },
          p: 3,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          overflow: 'auto', // Add scrolling to the main content area
          height: {
            xs: 'calc(100vh - 104px)', // Adjust for mobile (AppBar + BottomNavigation)
            lg: 'calc(100vh - 64px)', // Adjust for desktop (AppBar only)
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
});

NavigationLayout.displayName = 'NavigationLayout';

export default NavigationLayout;