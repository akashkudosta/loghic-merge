import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Grid,
  Typography,
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

const DeleteAccount = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [password, setPassword] = useState('');

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

  const handleDeleteAccount = () => {
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/delete-account`, 
        { password },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      // Handle successful deletion (redirect to login, clear storage, etc.)
    } catch (error) {
      console.error('Error deleting account:', error);
    }
    setOpenDialog(false);
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
                Delete Account
              </MDTypography>

              <Box sx={{ mb: 4 }}>
                <Typography variant="body1" color="error" paragraph>
                  Warning: This action cannot be undone.
                </Typography>
                <Typography variant="body1" paragraph>
                  Deleting your account will:
                </Typography>
                <ul>
                  <li>Remove all your personal information</li>
                  <li>Delete all your posts and comments</li>
                  <li>Cancel any active subscriptions</li>
                  <li>Remove your profile from our platform</li>
                </ul>
              </Box>

              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteAccount}
                sx={{ mt: 2 }}
              >
                Delete My Account
              </Button>

              <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Confirm Account Deletion</DialogTitle>
                <DialogContent>
                  <Typography paragraph>
                    Please enter your password to confirm account deletion:
                  </Typography>
                  <TextField
                    type="password"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    margin="dense"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button onClick={handleConfirmDelete} color="error">
                    Confirm Delete
                  </Button>
                </DialogActions>
              </Dialog>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default DeleteAccount; 