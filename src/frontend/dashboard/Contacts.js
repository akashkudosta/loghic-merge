import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import MDButton from 'components/MDButton';

const Contacts = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      role: 'Developer'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      role: 'Designer'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      role: 'Manager'
    }
  ]);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ContactCard = ({ contact }) => (
    <Card sx={{ p: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={contact.avatar}
            sx={{ width: 50, height: 50, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{contact.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {contact.email}
            </Typography>
            <Typography variant="body2" color="primary">
              {contact.role}
            </Typography>
          </Box>
        </Box>
        <Button variant="outlined" sx={{ backgroundColor: 'white', color: '#203a93', borderColor: '#203a93' }}>
          Message
        </Button>
      </Box>
    </Card>
  );

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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <MDTypography variant="h5" color="dark">
                  Contacts
                </MDTypography>
              </Box>

              {/* Search Bar */}
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
                {filteredContacts.map(contact => (
                  <ContactCard key={contact.id} contact={contact} />
                ))}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Contacts; 