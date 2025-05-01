import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
} from '@mui/material';
import MDBox from 'components/MDBox';
import FrontendLayout from "layouts/frontend";
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingNews from '../../components/TrendingNews/TrendingNews';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/notifications/getUserNotifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.status && response.data.data) {
        setNotifications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/notifications/deleteNotification/${notificationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status) {
        setNotifications(notifications.filter(
          notification => notification.UserNotification_PublicID !== notificationId
        ));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/notifications/clearAllNotifications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.status) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
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
          {/* Notifications List */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, boxShadow: 'none', backgroundColor: 'transparent' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                  Notifications
                </Typography>
                {notifications.length > 0 && (
                  <Button
                    variant="text"
                    color="error"
                    onClick={handleClearAll}
                    sx={{ textTransform: 'none' }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>

              <List sx={{ bgcolor: 'white', borderRadius: 1 }}>
                {notifications.length === 0 ? (
                  <ListItem>
                    <ListItemText 
                      primary={
                        <Typography align="center" color="textSecondary">
                          No notifications
                        </Typography>
                      }
                    />
                  </ListItem>
                ) : (
                  notifications.map((notification) => (
                    <ListItem
                      key={notification.UserNotification_PublicID}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleDelete(notification.UserNotification_PublicID)}
                          sx={{ 
                            marginRight: 1,
                            '&:hover': { 
                              backgroundColor: 'rgba(233, 30, 99, 0.1)' 
                            } 
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      }
                      sx={{
                        mb: 1,
                        p: 1,
                        '&:hover': { 
                          backgroundColor: '#f5f5f5' 
                        },
                        borderRadius: 1,
                        transition: 'background-color 0.3s'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={notification.UserNotification_ImageURL || ''} />
                      </ListItemAvatar>
                      <ListItemText 
                        sx={{display: 'flex', flexDirection: 'column' }}
                        primary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography
                              component="span"
                              variant="subtitle1"
                              sx={{ fontWeight: 'medium', mr: 1 }}
                              fontSize={15}
                            >
                              {notification.UserNotification_ObjectType}
                            </Typography>
                            <Typography component="span" variant="body1" fontSize={14}>
                              {notification.UserNotification_Text}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notification.UserNotification_CreatedDateTime).toLocaleDateString()}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Card>
          </Grid>

          {/* Trending Posts Section */}
          <Grid item xs={12} md={4}>
            <Card sx={{ boxShadow: 'none', backgroundColor: 'white' }}>
              <MDBox p={3}>
                <TrendingNews limit={10} />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Notifications; 