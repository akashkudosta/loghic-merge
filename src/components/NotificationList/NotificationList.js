import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Button,
  Box
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { notificationService } from '../../services/notificationService';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getUserNotifications();
      if (response.status && response.data) {
        setNotifications(response.data);
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
      const response = await notificationService.deleteNotification(notificationId);
      if (response.status) {
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
      const response = await notificationService.clearAllNotifications();
      if (response.status) {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const getNotificationIcon = (type) => {
    // You can customize this based on your notification types
    return <Avatar>{type[0]}</Avatar>;
  };

  if (loading) {
    return <Typography>Loading notifications...</Typography>;
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Notifications</Typography>
        {notifications.length > 0 && (
          <Button onClick={handleClearAll} color="primary">
            Clear All
          </Button>
        )}
      </Box>
      
      <List>
        {notifications.length === 0 ? (
          <Typography color="textSecondary" align="center">
            No notifications
          </Typography>
        ) : (
          notifications.map((notification) => (
            <ListItem
              key={notification.UserNotification_PublicID}
              alignItems="flex-start"
              sx={{
                bgcolor: notification.UserNotification_ViewedTF ? 'transparent' : 'action.hover',
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                {getNotificationIcon(notification.UserNotification_ObjectType)}
              </ListItemAvatar>
              <ListItemText
                primary={notification.UserNotification_Text}
                secondary={
                  <React.Fragment>
                    <Typography
                      component="span"
                      variant="body2"
                      color="textSecondary"
                    >
                      {formatDistanceToNow(new Date(notification.UserNotification_CreatedDateTime), { addSuffix: true })}
                    </Typography>
                  </React.Fragment>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(notification.UserNotification_PublicID)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
};

export default NotificationList; 