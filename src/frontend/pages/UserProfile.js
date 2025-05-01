import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button, Icon, Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import placehoderBannerProfileImage from "../../assets/images/banner-placehoder.jpg";
import placehoderUserImage from '../../assets/images/user-placehoder.png';
import { useNotification } from "../../context/NotificationContext";
import { AuthContext } from "../../context";
import MessagePopup from '../../components/MessagePopup';


const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const { isAuthenticated } = useContext(AuthContext);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Add new function to check follow status
  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/checkFollowStatus?User_PublicID=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Check Follow Status Response:', data);
      
      if (data.status) {
        setIsFollowing(data.data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    if (isAuthenticated && id) {
      checkFollowStatus();
    }
  }, [id, isAuthenticated]);

  const handleFollow = async () => {
    if (!isAuthenticated) {
      showNotification({
        message: 'Please login to follow users',
        severity: 'warning'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          User_PublicID: id
        })
      });

      const data = await response.json();
      console.log('Follow API Response:', data);
      
      if (data.status) {
        setIsFollowing(!isFollowing);
        showNotification({
          message: data.message,
          severity: 'success'
        });

      } else {
        showNotification({
          message: data.message || 'Failed to update follow status',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      showNotification({
        message: 'An error occurred while updating follow status',
        severity: 'error'
      });
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/getUserById?User_PublicID=${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      if (data.status) {
        if (data.data.User_Role === 'financial-advisor') {
          showNotification({
            message: 'Redirecting to advisor profile',
            severity: 'info'
          });
          navigate(`/advisor-profile/${id}`);
          return;
        }
        
        console.log('User Data:', data.data);
        setUserData(data.data);
      } else {
        setError(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Error fetching user data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <FrontendLayout>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDTypography>Loading...</MDTypography>
        </MDBox>
      </FrontendLayout>
    );
  }

  if (error) {
    return (
      <FrontendLayout>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDTypography color="error">{error}</MDTypography>
        </MDBox>
      </FrontendLayout>
    );
  }

  if (!userData) {
    return (
      <FrontendLayout>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDTypography>User not found.</MDTypography>
        </MDBox>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <MDBox>
        {/* Profile Banner Section */}
        <Box sx={{ position: 'relative', mb: 4 }}>
          {/* Banner Image */}
          <Box
            component="img"
            src={userData.User_WallpaperImageURL || placehoderBannerProfileImage}
            alt="profile banner"
            sx={{
              width: '100%',
              height: '300px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />

          {/* Back Button */}
          <Button
            variant="contained"
            onClick={() => navigate(-1)}
            sx={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              backgroundColor: '#213a93',
              color: '#ffffff',
              '&:hover': { backgroundColor: '#1565c0' },
              textTransform: 'none',
              borderRadius: '4px'
            }}
          >
            Back
          </Button>

          {/* Profile Info Overlay */}
          <Card sx={{ 
                position: 'absolute',
                bottom: '-50px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                backgroundColor: 'transparent' }}>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '8px',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
                }}
            >
                {/* Left side - Profile pic and info */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    component="img"
                    src={userData.User_ImageURL || placehoderUserImage}
                    alt={userData.User_Name}
                    sx={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    border: '3px solid white'
                    }}
                />
                <Box>
                    <MDTypography variant="h5" fontWeight="bold">
                    {userData.User_Name}
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                    Friends
                    </MDTypography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Icon fontSize="small" sx={{ mr: 0.5 }}>person</Icon>
                    </Box>
                </Box>
                </Box>

                {/* Right side - Action buttons */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (!isAuthenticated) {
                        showNotification({
                          message: 'Please login to send messages',
                          severity: 'warning'
                        });
                        return;
                      }
                      setIsMessagePopupOpen(true);
                    }}
                    sx={{
                      backgroundColor: '#213a93',
                      color: '#ffffff',
                      '&:hover': { backgroundColor: '#1565c0' },
                      textTransform: 'none'
                    }}
                  >
                    Message
                  </Button>
                  <Button
                    variant={isFollowing ? "outlined" : "contained"}
                    onClick={handleFollow}
                    sx={{
                      backgroundColor: isFollowing ? 'transparent' : '#213a93',
                      color: isFollowing ? '#213a93' : '#ffffff',
                      borderColor: '#213a93',
                      '&:hover': { 
                        backgroundColor: isFollowing ? 'rgba(33, 58, 147, 0.1)' : '#1565c0',
                        borderColor: '#213a93'
                      },
                      textTransform: 'none'
                    }}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </Box>
            </Box>
          </Card>
        </Box>

        {/* Content Section */}
        <Grid container spacing={3} sx={{ mt: 8 }}>
          {/* Left Column - Intro */}
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, backgroundColor: 'white', borderRadius: '8px' }}>
              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Intro
              </MDTypography>
              <MDTypography variant="body2" mb={2}>
                I'm hero.
              </MDTypography>

              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Address
              </MDTypography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Icon fontSize="small" sx={{ mr: 1 }}>home</Icon>
                <MDTypography variant="body2">
                  Lives in 14-D, Jaipur
                </MDTypography>
              </Box>

              <MDTypography variant="h6" fontWeight="medium" mb={2}>
                Hero Line
              </MDTypography>
              <MDTypography variant="body2">
                I'm hero.
              </MDTypography>
            </Card>
          </Grid>

          {/* Right Column - Posts */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, backgroundColor: 'white', borderRadius: '8px' }}>
              <MDTypography variant="h6" fontWeight="medium" mb={3}>
                Posts
              </MDTypography>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  py: 4
                }}
              >
                {/* <Box
                  component="img"
                  src="/path/to/no-data-icon.png"
                  alt="No Data"
                  sx={{ width: '100px', mb: 2 }}
                /> */}
                <MDTypography variant="body1" color="text">
                  No Data Found
                </MDTypography>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Message Popup */}
        <MessagePopup
          open={isMessagePopupOpen}
          onClose={() => setIsMessagePopupOpen(false)}
          recipient={userData?.User_Name || ''}
          recipientImage={userData?.User_ImageURL || placehoderUserImage}
          recipientId={userData?.User_PublicID}
        />
      </MDBox>
    </FrontendLayout>
  );
};

export default UserProfile; 