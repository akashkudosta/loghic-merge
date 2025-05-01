import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Divider,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Notifications = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    UserNotificationsSettings_Public_Comment: true,
    UserNotificationsSettings_Mentions_Public_Comment: true,
    UserNotificationsSettings_Like_Post: false,
    UserNotificationsSettings_Follows: true,
    UserNotificationsSettings_Send_Message: true,
    UserNotificationsSettings_Shares_Post: true
  });
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'comment',
      message: 'John Doe commented on your post',
      time: '2 hours ago',
      read: false
    },
    {
      id: 2,
      type: 'follow',
      message: 'Jane Smith started following you',
      time: '5 hours ago',
      read: false
    },
    {
      id: 3,
      type: 'mention',
      message: 'You were mentioned in a comment',
      time: '1 day ago',
      read: true
    }
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [userInfoResponse, settingsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.post(`${process.env.REACT_APP_API_URL}/api/users/userNotificationsSettings`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setUserInfo(userInfoResponse.data.data.userInfo);
        if (settingsResponse.data.data) {
          setSettings({
            UserNotificationsSettings_Public_Comment: settingsResponse.data.data.UserNotificationsSettings_Public_Comment,
            UserNotificationsSettings_Mentions_Public_Comment: settingsResponse.data.data.UserNotificationsSettings_Mentions_Public_Comment,
            UserNotificationsSettings_Like_Post: settingsResponse.data.data.UserNotificationsSettings_Like_Post,
            UserNotificationsSettings_Follows: settingsResponse.data.data.UserNotificationsSettings_Follows,
            UserNotificationsSettings_Send_Message: settingsResponse.data.data.UserNotificationsSettings_Send_Message,
            UserNotificationsSettings_Shares_Post: settingsResponse.data.data.UserNotificationsSettings_Shares_Post
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load notification settings',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSettingChange = async (setting) => {
    const newValue = !settings[setting];
    
    // Optimistic update
    setSettings(prev => ({
      ...prev,
      [setting]: newValue
    }));

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/users/userNotificationsSettings`,
        {
          ...settings,
          [setting]: newValue
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSnackbar({
        open: true,
        message: 'Settings updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating notification setting:', error);
      // Revert on error
      setSettings(prev => ({
        ...prev,
        [setting]: !newValue
      }));
      
      setSnackbar({
        open: true,
        message: 'Failed to update settings. Please try again.',
        severity: 'error'
      });
    }
  };

  const handleMenuOpen = (event, notification) => {
    setAnchorEl(event.currentTarget);
    setSelectedNotification(notification);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(notifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
    handleMenuClose();
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/notifications/${notificationId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(notifications.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
    handleMenuClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (loading) {
    return (
      <FrontendLayout>
        <MDBox>
          <Typography>Loading...</Typography>
        </MDBox>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <DashboardSidebar userInfo={userInfo} />
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 3, backgroundColor: 'white' }}>
              <MDTypography variant="h5" color="dark" mb={3}>
                Notification Settings
              </MDTypography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Someone leaves a public comment on my post"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Public_Comment}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Public_Comment')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Someone mentions me in a public comment"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Mentions_Public_Comment}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Mentions_Public_Comment')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Someone likes one of my posts"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Like_Post}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Like_Post')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Someone follows me"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Follows}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Follows')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Someone sends me a message"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Send_Message}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Send_Message')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Someone shares a post with me"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.UserNotificationsSettings_Shares_Post}
                      onChange={() => handleSettingChange('UserNotificationsSettings_Shares_Post')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              {/* Feedback Snackbar */}
              <Snackbar 
                open={snackbar.open} 
                autoHideDuration={6000} 
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert 
                  onClose={handleCloseSnackbar} 
                  severity={snackbar.severity} 
                  sx={{ width: '100%' }}
                >
                  {snackbar.message}
                </Alert>
              </Snackbar>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Notifications; 