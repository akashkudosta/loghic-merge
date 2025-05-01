import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Card,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Button,
  Collapse
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ContactsIcon from '@mui/icons-material/Contacts';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ArticleIcon from '@mui/icons-material/Article';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import SubscriptionsIcon from '@mui/icons-material/Subscriptions';
import LockIcon from '@mui/icons-material/Lock';
import FlagIcon from '@mui/icons-material/Flag';
import SecurityIcon from '@mui/icons-material/Security';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import profileBackground from '../../assets/images/profile-background.png';
import defaultAvatar from '../../assets/images/user-placehoder.png';

// Define menu items for different roles
const ROLE_BASED_MENU_ITEMS = {
  'general': [
    { icon: <DashboardIcon />, text: 'Dashboard', route: '/dashboard' },
    { icon: <AssignmentIcon />, text: 'Overview', route: '/dashboard/overview' },
    { icon: <ContactsIcon />, text: 'Contacts', route: '/dashboard/contacts' },
    { icon: <FavoriteIcon />, text: 'Followers', route: '/dashboard/followers' },
    { icon: <CreditCardIcon />, text: 'My Cards', route: '/dashboard/my-cards' }, 
  ],
  'financial-advisor': [
    { icon: <DashboardIcon />, text: 'Dashboard', route: '/dashboard' },
    { icon: <AssignmentIcon />, text: 'Overview', route: '/dashboard/overview' },
    { icon: <ContactsIcon />, text: 'Contacts', route: '/dashboard/contacts' },
    { icon: <FavoriteIcon />, text: 'Followers', route: '/dashboard/followers' },
    { icon: <ArticleIcon />, text: 'My Posts', route: '/dashboard/my-posts' },
    { icon: <CreditCardIcon />, text: 'My Cards', route: '/dashboard/my-cards' }, 
  ],
  'admin': [
    { icon: <DashboardIcon />, text: 'Dashboard', route: '/dashboard' },
    { icon: <AssignmentIcon />, text: 'Overview', route: '/dashboard/overview' },
    { icon: <ContactsIcon />, text: 'Contacts', route: '/dashboard/contacts' },
    { icon: <FavoriteIcon />, text: 'Followers', route: '/dashboard/followers' },
    { icon: <ArticleIcon />, text: 'My Posts', route: '/dashboard/my-posts' },
    { icon: <CreditCardIcon />, text: 'My Cards', route: '/dashboard/my-cards' },
  ]
};

// Define settings menu items for different roles
const ROLE_BASED_SETTINGS_ITEMS = {
  'general': [
    { path: '/dashboard/password', icon: <LockIcon />, text: 'Password' },
    { path: '/dashboard/security', icon: <SecurityIcon />, text: 'Security' },
    { path: '/dashboard/privacy-policy', icon: <PrivacyTipIcon />, text: 'Privacy Policy' },
    { path: '/dashboard/notifications', icon: <NotificationsIcon />, text: 'Notifications' },
    { path: '/dashboard/help-support', icon: <HelpIcon />, text: 'Help and Support' },
    { path: '/dashboard/delete-account', icon: <DeleteIcon />, text: 'Delete Account' },
  ],
  'financial-advisor': [
    { path: '/dashboard/subscriptions', icon: <SubscriptionsIcon />, text: 'Subscriptions' },
    { path: '/dashboard/password', icon: <LockIcon />, text: 'Password' },
    { path: '/dashboard/flagged-comments', icon: <FlagIcon />, text: 'Flagged Comments' },
    { path: '/dashboard/security', icon: <SecurityIcon />, text: 'Security' },
    { path: '/dashboard/privacy-policy', icon: <PrivacyTipIcon />, text: 'Privacy Policy' },
    { path: '/dashboard/notifications', icon: <NotificationsIcon />, text: 'Notifications' },
    { path: '/dashboard/help-support', icon: <HelpIcon />, text: 'Help and Support' },
    { path: '/dashboard/delete-account', icon: <DeleteIcon />, text: 'Delete Account' },
  ],
  'admin': [
    { path: '/dashboard/subscriptions', icon: <SubscriptionsIcon />, text: 'Subscriptions' },
    { path: '/dashboard/password', icon: <LockIcon />, text: 'Password' },
    { path: '/dashboard/flagged-comments', icon: <FlagIcon />, text: 'Flagged Comments' },
    { path: '/dashboard/security', icon: <SecurityIcon />, text: 'Security' },
    { path: '/dashboard/privacy-policy', icon: <PrivacyTipIcon />, text: 'Privacy Policy' },
    { path: '/dashboard/notifications', icon: <NotificationsIcon />, text: 'Notifications' },
    { path: '/dashboard/help-support', icon: <HelpIcon />, text: 'Help and Support' },
    { path: '/dashboard/delete-account', icon: <DeleteIcon />, text: 'Delete Account' },
  ]
};

const DashboardSidebar = ({ userInfo }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get user role from userInfo, default to 'general' if not specified
  const userRole = (userInfo?.User_Role || 'general').toLowerCase();

  useEffect(() => {
    // Get settings items safely with fallback to general
    const roleSettings = ROLE_BASED_SETTINGS_ITEMS[userRole] || ROLE_BASED_SETTINGS_ITEMS['general'];
    const settingsPages = roleSettings.map(item => item.path);
    
    if (settingsPages.some(path => location.pathname === path)) {
      setSettingsOpen(true);
    }
  }, [location.pathname, userRole]);

  const handleSettingsClick = () => {
    setSettingsOpen(!settingsOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // First clear all auth-related data
    localStorage.clear(); // Clear all localStorage data
    sessionStorage.clear(); // Clear all sessionStorage data
    // Redirect to home page
    window.location.href = '/';
  };

  // Get the appropriate menu items based on user role
  const menuItems = ROLE_BASED_MENU_ITEMS[userRole] || ROLE_BASED_MENU_ITEMS['general'];
  const settingsMenuItems = [
    ...(ROLE_BASED_SETTINGS_ITEMS[userRole] || ROLE_BASED_SETTINGS_ITEMS['general']),
    { path: null, icon: <LogoutIcon />, text: 'Logout', onClick: handleLogout }
  ];

  return (
    <Card sx={{ backgroundColor: 'transparent', boxShadow: 'none' }}>
      {/* Profile Section */}
      <Box
        sx={{
          position: 'relative',
          height: '200px',
          borderRadius: '15px 15px 0 0',
          overflow: 'hidden',
          mb: 2
        }}
      >
        <img
          src={userInfo?.User_ImageURL || profileBackground}
          alt="Profile Background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Avatar
            src={userInfo?.User_ImageURL || defaultAvatar}
            sx={{
              width: 80,
              height: 80,
              margin: '0 auto',
              border: '3px solid white'
            }}
          />
          <Typography variant="h6" sx={{ mt: 1, color: '#ffffff' }}>
            {userInfo?.User_Name || 'Loading...'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#ffffff', fontWeight: 'bold' }}>
            ({userInfo?.User_Role || ''})
          </Typography>
        </Box>
      </Box>

      <Button
        variant="outlined"
        component={Link}
        to="/dashboard/edit-profile"
        sx={{
          mb: 3,
          marginX: 3,
          color: '#ffffff',
          borderColor: '#213a93',
          backgroundColor: '#213a93',
          '&:hover': {
            color: '#213a93',
            borderColor: '#213a93',
            backgroundColor: '#FFFFFF'
          }
        }}
      >
        Edit Profile
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, paddingX:3, paddingBottom: 2, borderBottom: '1px solid #FFD700' }}>
        <Typography variant="body2" sx={{ mr: 2 }}>
          <strong>6</strong> Following
        </Typography>
        <Typography variant="body2">
          <strong>4</strong> Followers
        </Typography>
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: 2 }}>
        {menuItems.map((item, index) => (
          <ListItem
            key={index}
            component={Link}
            to={item.route}
            sx={{
              borderRadius: '8px',
              mb: 1,
              p: 1,
              color: isActive(item.route) ? '#213a93' : 'inherit',
              backgroundColor: isActive(item.route) ? '#f5f5f5' : 'transparent',
              '&:hover': {
                backgroundColor: '#f5f5f5'
              },
              textDecoration: 'none'
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: '30px',
              color: isActive(item.route) ? '#213a93' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{
                '& .MuiTypography-root': {
                  fontWeight: isActive(item.route) ? 600 : 400,
                  fontSize: '15px',
                },
              }}
            />
          </ListItem>
        ))}

        <ListItem
          button
          onClick={handleSettingsClick}
          sx={{
            borderRadius: '8px',
            mb: 1,
            p: 1,
            color: settingsOpen ? '#213a93' : 'inherit',
            backgroundColor: settingsOpen ? '#f5f5f5' : 'transparent',
            '&:hover': {
              backgroundColor: '#f5f5f5'
            }
          }}
        >
          <ListItemIcon sx={{ 
            minWidth: '30px',
            color: settingsOpen ? '#213a93' : 'inherit'
          }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Settings"
            sx={{
              '& .MuiTypography-root': {
                fontWeight: settingsOpen ? 600 : 400,
                fontSize: '15px',
              },
            }}
          />
          {settingsOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>

        <Collapse in={settingsOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {settingsMenuItems.map((item) => (
              <ListItem
                key={item.text}
                component={item.path ? Link : 'div'}
                to={item.path}
                onClick={item.onClick}
                button
                sx={{
                  p: 1,
                  paddingLeft: '20px',
                  borderRadius: '8px',
                  mb: 0.5,
                  boxSizing: 'border-box',
                  color: isActive(item.path) ? '#213a93' : 'inherit',
                  backgroundColor: isActive(item.path) ? '#f5f5f5' : 'transparent',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                    cursor: 'pointer'
                  },
                  textDecoration: 'none'
                }}
              >
                <ListItemIcon sx={{ 
                  minWidth: '30px',
                  color: isActive(item.path) ? '#213a93' : 'inherit'
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: '15px',
                    },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    </Card>
  );
};

export default DashboardSidebar; 