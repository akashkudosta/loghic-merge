import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
  Switch,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const Security = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    twoFactorAuth: false,
    loginNotifications: true,
    deviceManagement: true,
    passwordExpiry: true
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

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

  const handleToggle = async (setting) => {
    if (setting === 'twoFactorAuth' && !settings.twoFactorAuth) {
      setOpenDialog(true);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/security-settings`,
        { 
          setting,
          value: !settings[setting]
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSettings(prev => ({
        ...prev,
        [setting]: !prev[setting]
      }));
    } catch (error) {
      console.error('Error updating security setting:', error);
    }
  };

  const handleVerifyCode = async () => {
    try {
      const token = localStorage.getItem('token');  
      await axios.post(`${process.env.REACT_APP_API_URL}/verify-2fa`,
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSettings(prev => ({
        ...prev,
        twoFactorAuth: true
      }));
      setOpenDialog(false);
      setVerificationCode('');
    } catch (error) {
      console.error('Error verifying 2FA code:', error);
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
          {/* Left Sidebar */}
          <Grid item xs={12} md={3}>
            <DashboardSidebar userInfo={userInfo} />
          </Grid>

          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Card sx={{ p: 3, backgroundColor: 'white' }}>
              <MDTypography variant="h5" color="dark" mb={3}>
                Security Settings
              </MDTypography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="Two-Factor Authentication"
                    secondary="Add an extra layer of security to your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.twoFactorAuth}
                      onChange={() => handleToggle('twoFactorAuth')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Login Notifications"
                    secondary="Get notified when someone logs into your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.loginNotifications}
                      onChange={() => handleToggle('loginNotifications')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Device Management"
                    secondary="View and manage devices that have access to your account"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.deviceManagement}
                      onChange={() => handleToggle('deviceManagement')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />

                <ListItem>
                  <ListItemText
                    primary="Password Expiry"
                    secondary="Require password change every 90 days"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={settings.passwordExpiry}
                      onChange={() => handleToggle('passwordExpiry')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
        <DialogContent>
          <Typography paragraph sx={{ mt: 1 }}>
            Please enter the verification code sent to your email
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleVerifyCode}
            variant="contained"
            sx={{
              backgroundColor: '#213a93',
              '&:hover': { backgroundColor: '#1a2d75' }
            }}
          >
            Verify
          </Button>
        </DialogActions>
      </Dialog>
    </FrontendLayout>
  );
};

export default Security; 