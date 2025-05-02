import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MessageIcon from '@mui/icons-material/Message';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import MessagePopup from 'components/MessagePopup';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const Contacts = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messagePopup, setMessagePopup] = useState({
    open: false,
    recipient: null,
    recipientId: null,
    recipientImage: null
  });

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUserInfo(response.data.data.userInfo);
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user info');
    }
  };

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/contacts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setContacts(response.data.data.contacts || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setError('Failed to fetch contacts');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchContacts()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMessageClick = (contact) => {
    setMessagePopup({
      open: true,
      recipient: contact.User_Name,
      recipientId: contact.User_PublicID,
      recipientImage: contact.User_ImageURL
    });
  };

  const handleCloseMessagePopup = () => {
    setMessagePopup({
      open: false,
      recipient: null,
      recipientId: null,
      recipientImage: null
    });
  };

  const filteredContacts = contacts.filter(contact => 
    contact.User_Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.User_Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ContactCard = ({ contact }) => (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={contact.User_ImageURL || 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png'}
            sx={{ width: 50, height: 50, mr: 2 }}
            alt={contact.User_Name}
          />
          <Box>
            <Typography variant="h6">{contact.User_Name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.User_Email}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {contact.User_Role}
            </Typography>
          </Box>
        </Box>
        <MDButton
          variant="contained"
          color="info"
          onClick={() => handleMessageClick(contact)}
          startIcon={<MessageIcon />}
          sx={{
            minWidth: '120px',
            borderRadius: '8px',
            backgroundColor: '#213a93',
            '&:hover': {
              backgroundColor: '#1a2d75'
            }
          }}
        >
          Message
        </MDButton>
      </Box>
    </Card>
  );

  if (loading) {
    return (
      <FrontendLayout>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </MDBox>
      </FrontendLayout>
    );
  }

  if (error) {
    return (
      <FrontendLayout>
        <MDBox>
          <Typography color="error">{error}</Typography>
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
                Contacts
              </MDTypography>

              {/* Search Box */}
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* Contacts List */}
              <Box>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map(contact => (
                    <ContactCard key={contact.User_PublicID} contact={contact} />
                  ))
                ) : (
                  <Typography variant="body1" textAlign="center" py={4}>
                    {searchQuery ? "No contacts found matching your search" : "No contacts yet"}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Message Popup */}
      <MessagePopup
        open={messagePopup.open}
        onClose={handleCloseMessagePopup}
        recipient={messagePopup.recipient}
        recipientId={messagePopup.recipientId}
        recipientImage={messagePopup.recipientImage}
      />
    </FrontendLayout>
  );
};

export default Contacts; 