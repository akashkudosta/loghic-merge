import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  List,
  Typography,
  Tab,
  Tabs,
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const DashBoard = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([
    {
      id: 1,
      type: 'company',
      title: '$BRAINS - Your Greed Is My Fuel By Virtuals',
      timestamp: '02/04/2025, 12:08:42 pm'
    },
    {
      id: 2,
      type: 'company',
      title: '1inch',
      timestamp: '27/03/2025, 03:46:00 pm'
    },
    {
      id: 3,
      type: 'company',
      title: 'Bitcoin',
      timestamp: '26/03/2025, 08:57:27 am'
    }
  ]);

  const lastCompanyVisited = activities[0];

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

  const ActivityItem = ({ title, timestamp }) => (
    <Box 
      sx={{ 
        mb: 2, 
        backgroundColor: 'white', 
        borderRadius: '8px',
        p: 2,
        '&:hover': { backgroundColor: '#f8f9fa' }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
        <Box 
          sx={{ 
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#f0f2f5',
            mr: 2
          }} 
        />
        <Box>
          <Typography 
            variant="body1" 
            sx={{ 
              fontWeight: 500,
              color: '#213a93',
              mb: 0.5
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            {timestamp}
          </Typography>
        </Box>
      </Box>
    </Box>
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
          {/* Left Sidebar - Profile and Navigation */}
          <Grid item xs={12} md={3}>
            <DashboardSidebar userInfo={userInfo} />
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 3, backgroundColor: 'white' }}>
              <MDTypography variant="h5" color="dark" mb={3}>
                Quick View
              </MDTypography>

              <Box sx={{ }}>
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
                      py: 1,
                    },
                    '& .Mui-selected': {
                      color: '#ffffff !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#213a93',
                    },
                  }}
                >
                  <Tab label="All Activities" />
                  <Tab label="Last Coin Visited" />
                </Tabs>
              </Box>

              <TabPanel value={selectedTab} index={0}>
                <List sx={{ p: 0 }}>
                  {activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      title={activity.title}
                      timestamp={activity.timestamp}
                    />
                  ))}
                </List>
              </TabPanel>

              <TabPanel value={selectedTab} index={1}>
                <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: '8px', p: 2 }}>
                  <ActivityItem
                    title={lastCompanyVisited.title}
                    timestamp={lastCompanyVisited.timestamp}
                  />
                </Box>
              </TabPanel>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default DashBoard; 