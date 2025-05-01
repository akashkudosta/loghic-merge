import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  TextField,
  IconButton,
  Paper,
  Alert,
  Button
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import FrontendLayout from "layouts/frontend";
import placehoderUserImage from "../../assets/images/user-placehoder.png";

const Messages = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState('');
  const [contactStatus, setContactStatus] = useState('');
  const [contactUserType, setContactUserType] = useState('');
  const messagesEndRef = useRef(null);

  const selectedContact = contacts.find(c => c.contact.User_PublicID === selectedContactId);

  useEffect(() => {
    fetchContacts();
    const interval = setInterval(fetchContacts, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedContactId]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.status) {
        // Sort contacts to maintain order - latest message first
        const sortedContacts = [...data.data.contacts].sort((a, b) => {
          const dateA = a.lastMessage?.Message_CreatedDate ? new Date(a.lastMessage.Message_CreatedDate) : new Date(0);
          const dateB = b.lastMessage?.Message_CreatedDate ? new Date(b.lastMessage.Message_CreatedDate) : new Date(0);
          return dateB - dateA;
        });
        setContacts(sortedContacts);
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedContactId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/list?ConnectUserID=${selectedContactId}&page=1&limit=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.status) {
        // Sort messages by creation date in ascending order (oldest first)
        const sortedMessages = [...(data.data.Message || [])].sort((a, b) => {
          return new Date(a.Message_CreatedDate) - new Date(b.Message_CreatedDate);
        });
        setMessages(sortedMessages);
        setContactStatus(data.data.contact_status);
        setContactUserType(data.data.contact_userType);
        setError('');
        scrollToBottom();
      } else {
        setMessages([]);
        setError(data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
      setError('Failed to fetch messages');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContactId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          Message_ReceiverID: selectedContactId,
          Message_Message: newMessage.trim()
        })
      });

      if (response.status === 403) {
        const data = await response.json();
        setError(data.message);
      } else if (response.ok) {
        setNewMessage('');
        fetchMessages();
        fetchContacts();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleAcceptRequest = async () => {
    if (!selectedContact) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/request/handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ConnectUserID: selectedContact.contact.User_PublicID,
          Action: "accept"
        })
      });

      const data = await response.json();
      if (data.status) {
        // Refresh both contacts and messages to update UI
        fetchContacts();
        fetchMessages();
        setError('');
      } else {
        setError(data.message || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      setError('Failed to accept request');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedContact) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/messages/request/handle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ConnectUserID: selectedContact.contact.User_PublicID,
          Action: "reject"
        })
      });

      const data = await response.json();
      if (data.status) {
        // After rejection, refresh contacts and clear selected contact
        fetchContacts();
        setSelectedContactId(null);
        setError('');
      } else {
        setError(data.message || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
      setError('Failed to reject request');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  return (
    <FrontendLayout>
      <Box sx={{ height: 'calc(100vh - 100px)', mt: 2 }}>
        <Grid container spacing={2} sx={{ height: '100%' }}>
          {/* Contacts List */}
          <Grid item xs={3}>
            <Paper sx={{ height: '100%', overflow: 'hidden' }}>
              <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                Messages
              </Typography>
              <List sx={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
                {contacts.map((contact) => (
                  <ListItem
                    key={contact._id}
                    button
                    selected={selectedContactId === contact.contact.User_PublicID}
                    onClick={() => {
                      setSelectedContactId(contact.contact.User_PublicID);
                      setError('');
                      setMessages([]);
                    }}
                    sx={{
                      p: 2,
                      '&:hover': { bgcolor: '#f5f5f5' },
                      '&.Mui-selected': { bgcolor: '#e3f2fd' },
                      bgcolor: contact.status === 'pending' ? '#fff3e0' : 'transparent'
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={contact.contact.User_ImageURL || placehoderUserImage}
                        alt={contact.contact.User_Name}
                      />
                    </ListItemAvatar>
                    <ListItemText
                      primary={contact.contact.User_Name}
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {contact.lastMessage?.Message_Message || ''}
                          </Typography>
                          {contact.lastMessage?.Message_CreatedDate && (
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(contact.lastMessage.Message_CreatedDate)}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* Messages Area */}
          <Grid item xs={9}>
            <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {selectedContact ? (
                <>
                  {/* Contact Header */}
                  <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar
                        src={selectedContact.contact.User_ImageURL || placehoderUserImage}
                        alt={selectedContact.contact.User_Name}
                        sx={{ mr: 2 }}
                      />
                      <Typography variant="h6">
                        {selectedContact.contact.User_Name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Messages List */}
                  <Box 
                    sx={{ 
                      flexGrow: 1, 
                      overflowY: 'auto', 
                      p: 2, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2,
                      bgcolor: '#ffffff',
                      maxHeight: 'calc(100vh - 300px)'
                    }}
                  >
                    {messages.map((message) => (
                      <Box
                        key={message.Message_ID}
                        sx={{
                          display: 'flex',
                          justifyContent: message.Message_SenderID === selectedContact.contact.User_PublicID ? 'flex-start' : 'flex-end',
                          alignItems: 'flex-end',
                          gap: 1
                        }}
                      >
                        {message.Message_SenderID === selectedContact.contact.User_PublicID && (
                          <Avatar
                            src={message.Message_UserImageURL || placehoderUserImage}
                            alt={selectedContact.contact.User_Name}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                        <Box
                          sx={{
                            maxWidth: '70%',
                            bgcolor: message.Message_SenderID === selectedContact.contact.User_PublicID ? '#f5f5f5' : '#e3f2fd',
                            borderRadius: '12px',
                            p: 1.5
                          }}
                        >
                          <Typography variant="body1">
                            {message.Message_Message}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                          >
                            {formatTime(message.Message_CreatedDate)}
                          </Typography>
                        </Box>
                        {message.Message_SenderID !== selectedContact.contact.User_PublicID && (
                          <Avatar
                            src={placehoderUserImage}
                            sx={{ width: 32, height: 32 }}
                          />
                        )}
                      </Box>
                    ))}
                    <div ref={messagesEndRef} />
                  </Box>

                  {/* Error Message */}
                  {error && (
                    <Alert 
                      severity="error"
                      sx={{ 
                        backgroundColor: '#fef2f2',
                        color: '#ef4444',
                        '& .MuiAlert-icon': { color: 'inherit' }
                      }}
                    >
                      {error}
                    </Alert>
                  )}

                  {/* Request UI */}
                  {contactStatus === 'pending' && (
                    <Box sx={{ 
                      borderTop: '1px solid #ffe0b2',
                      bgcolor: '#fff3e0'
                    }}>
                      {contactUserType === 'receiver' ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          p: 2
                        }}>
                          <Typography>
                            Would you like to {selectedContact.contact.User_Name} in your contacts.
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              variant="contained"
                              onClick={handleAcceptRequest}
                              sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                '&:hover': { bgcolor: '#45a049' },
                                textTransform: 'none',
                                px: 3
                              }}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="contained"
                              onClick={handleRejectRequest}
                              sx={{
                                bgcolor: '#f44336',
                                color: 'white',
                                '&:hover': { bgcolor: '#d32f2f' },
                                textTransform: 'none',
                                px: 3
                              }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </Box>
                      ) : (
                        <Alert 
                          severity="warning"
                          sx={{ 
                            backgroundColor: '#ffebee',
                            color: '#d32f2f',
                            '& .MuiAlert-icon': { color: 'inherit' }
                          }}
                        >
                          Your request is pending from receiver side.
                        </Alert>
                      )}
                    </Box>
                  )}

                  {/* Message Input - Only show if contact is accepted */}
                  {contactStatus !== 'pending' && !error && (
                    <Box
                      component="form"
                      onSubmit={handleSendMessage}
                      sx={{
                        p: 2,
                        borderTop: '1px solid #eee',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: '#ffffff'
                      }}
                    >
                      <IconButton size="small">
                        <ImageIcon />
                      </IconButton>
                      <TextField
                        fullWidth
                        placeholder="Write a Message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                          }
                        }}
                      />
                      <IconButton
                        type="submit"
                        disabled={!newMessage.trim()}
                        sx={{
                          backgroundColor: '#e3f2fd',
                          '&:hover': { backgroundColor: '#bbdefb' }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </Box>
                  )}
                </>
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: '#ffffff'
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Select a contact to start messaging
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </FrontendLayout>
  );
};

export default Messages; 