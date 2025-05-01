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
  Button,
  Chip,
  Divider
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const Subscriptions = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      plan: 'Premium Plan',
      status: 'Active',
      renewalDate: '2024-04-15',
      price: '$9.99/month'
    },
    {
      id: 2,
      plan: 'Storage Add-on',
      status: 'Cancelled',
      renewalDate: '2024-03-30',
      price: '$4.99/month'
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

  const handleManageSubscription = (subscriptionId) => {
    // Handle subscription management
    console.log('Managing subscription:', subscriptionId);
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
                My Subscriptions
              </MDTypography>

              <List>
                {subscriptions.map((subscription, index) => (
                  <React.Fragment key={subscription.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {subscription.plan}
                            <Chip
                              label={subscription.status}
                              color={subscription.status === 'Active' ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              Price: {subscription.price}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Renewal Date: {subscription.renewalDate}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          variant="outlined"
                          onClick={() => handleManageSubscription(subscription.id)}
                          sx={{ borderColor: '#213a93', color: '#213a93' }}
                        >
                          Manage
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < subscriptions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Subscriptions; 