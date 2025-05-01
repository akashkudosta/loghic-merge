import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Tab,
  Tabs,
  Typography,
  Button,
  IconButton,
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const MyCards = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);

  const cardData = [
    {
      type: 'visa',
      number: 'XXXX XXXX XXXX 4242',
      expiry: '04/25',
      status: 'Active',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png'
    },
    {
      type: 'mastercard',
      number: 'XXXX XXXX XXXX 5678',
      expiry: '08/26',
      status: 'Active',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png'
    }
  ];

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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => {
    return (
      <div role="tabpanel" hidden={value !== index}>
        {value === index && (
          <Box sx={{ py: 2 }}>
            {children}
          </Box>
        )}
      </div>
    );
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
                Payment Cards
              </MDTypography>

              <Box sx={{ mb: 3 }}>
                <Tabs
                  value={selectedTab}
                  onChange={handleTabChange}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: 500,
                      minWidth: 120,
                      color: '#666',
                      px: 3,
                    },
                    '& .Mui-selected': {
                      color: '#fff !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#213a93',
                    },
                  }}
                >
                  <Tab label="Your Cards" />
                  <Tab label="Payments" />
                </Tabs>
              </Box>

              <TabPanel value={selectedTab} index={0}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: '#213a93',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#1a2d75' }
                    }}
                  >
                    Add Card
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Box sx={{ width: '100%', overflow: 'auto' }}>
                      <Box sx={{ minWidth: 650 }}>
                        <Box sx={{ mb: 2, fontWeight: 'bold' }}>
                          <Grid container>
                            <Grid item xs={3} sx={{fontSize: '15px'}}>Card Number</Grid>
                            <Grid item xs={3} sx={{fontSize: '15px'}}>Expiration Date</Grid>
                            <Grid item xs={3} sx={{fontSize: '15px'}}>Status</Grid>
                            <Grid item xs={3} sx={{fontSize: '15px', textAlign: 'right'}}>Action</Grid>
                          </Grid>
                        </Box>

                        {cardData.map((card, index) => (
                          <Box
                            key={index}
                            sx={{
                              py: 2,
                              borderBottom: '1px solid #eee',
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <Grid container alignItems="center">
                              <Grid item xs={3}>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Box
                                    component="img"
                                    src={card.logo}
                                    alt={card.type}
                                    sx={{ width: 24, mr: 2, objectFit: 'contain' }}
                                  />
                                  <Box sx={{fontSize: '14.5px', whiteSpace: 'nowrap'}}>{card.number}</Box>
                                </Box>
                              </Grid>
                              <Grid item xs={3} sx={{fontSize: '14.5px'}}>{card.expiry}</Grid>
                              <Grid item xs={3}>
                                <Box
                                  sx={{
                                    display: 'inline-block',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: '16px',
                                    backgroundColor: '#e8f5e9',
                                    color: '#2e7d32',
                                    fontSize: '14.5px'
                                  }}
                                >
                                  {card.status}
                                </Box>
                              </Grid>
                              <Grid item xs={3} sx={{textAlign: 'right'}}>
                                <IconButton
                                  size="small"
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': { backgroundColor: '#ffebee' }
                                  }}
                                >
                                  <CloseIcon />
                                </IconButton>
                              </Grid>
                            </Grid>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ mt: 4, p: 2, backgroundColor: '#fff3e0', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    <span role="img" aria-label="info">ℹ️</span> The charges on your credit card statement will appear as Loghic research.
                  </Typography>
                </Box>

                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    We are fully compliant with Payment Card Industry Data Security Standards.
                  </Typography>
                  <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                    <Box 
                      component="img" 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" 
                      alt="Visa" 
                      sx={{ height: 20, objectFit: 'contain' }} 
                    />
                    <Box 
                      component="img" 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" 
                      alt="Mastercard" 
                      sx={{ height: 20, objectFit: 'contain' }} 
                    />
                    <Box 
                      component="img" 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/1200px-American_Express_logo_%282018%29.svg.png" 
                      alt="American Express" 
                      sx={{ height: 20, objectFit: 'contain' }} 
                    />
                    
                    <Box 
                      component="img" 
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/JCB_logo.svg/2560px-JCB_logo.svg.png" 
                      alt="JCB" 
                      sx={{ height: 20, objectFit: 'contain' }} 
                    />
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                <Typography>Payment history will be displayed here</Typography>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default MyCards; 