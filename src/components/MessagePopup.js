import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Avatar,
  Typography,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import placehoderUserImage from '../assets/images/user-placehoder.png';
import { useNotification } from "../context/NotificationContext";

const MessagePopup = ({ open, onClose, recipient, recipientImage, recipientId }) => {
  const [message, setMessage] = useState('');
  const { showNotification } = useNotification();

  // Clear message when popup is opened or closed
  useEffect(() => {
    if (!open) {
      setMessage('');
    }
  }, [open]);

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      showNotification({ message: 'Please enter a message', severity: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Message_ReceiverID: recipientId,
          Message_Message: message.trim(),
          Message_MediaURL: "",
          Message_MediaName: "",
          Message_Type: ""
        })
      });

      const data = await response.json();
      
      if (!data.status) {
        showNotification({ message: data.message || 'Failed to send message', severity: 'error' });
        return;
      }

      showNotification({ message: data.message || 'Message sent successfully', severity: 'success' });
      handleClose();
    } catch (error) {
      showNotification({ message: 'Error sending message', severity: 'error' });
      console.error('Error:', error);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          p: 1,
          backgroundColor: 'white'
        }
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <DialogTitle 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pb: 1,
            backgroundColor: 'white',
            color: 'black'
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              Send a message to
            </Typography>
          </Box>
          <IconButton 
            onClick={handleClose}
            size="small"
            sx={{
              backgroundColor: '#f0f0f0',
              '&:hover': {
                backgroundColor: '#e0e0e0'
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar
              src={recipientImage || placehoderUserImage}
              alt={recipient}
              sx={{ width: 40, height: 40, mr: 1.5 }}
            />
            <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
              {recipient}
            </Typography>
          </Box>

          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Type your message here"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            variant="outlined"
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
            disabled={!message.trim()}
            sx={{
              borderRadius: '25px',
              py: 1.5,
              backgroundColor: '#ffc107',
              color: '#000',
              '&:hover': {
                backgroundColor: '#ffb300'
              },
              '&.Mui-disabled': {
                backgroundColor: '#ffd54f',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Submit
          </Button>
        </DialogContent>
      </Box>
    </Dialog>
  );
};

export default MessagePopup; 