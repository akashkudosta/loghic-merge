import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  Button,
  CircularProgress,
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import { useFollow } from '../../context/FollowContext';

const Followers = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState(null);
  const { followCounts, fetchFollowCounts, updateFollowCounts } = useFollow();

  const fetchFollowers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/followers`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: 1,
          limit: 20
        }
      });
      setFollowers(response.data.data.followers || []);
    } catch (error) {
      console.error('Error fetching followers:', error);
      setError('Failed to fetch followers');
    }
  };

  const fetchFollowing = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/following`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          page: 1,
          limit: 20
        }
      });
      setFollowing(response.data.data.following || []);
    } catch (error) {
      console.error('Error fetching following:', error);
      setError('Failed to fetch following users');
    }
  };

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
        setError('Failed to fetch user info');
      }
    };

    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserInfo(),
          fetchFollowCounts(),
          fetchFollowers(),
          fetchFollowing()
        ]);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFollowToggle = async (userId, currentList) => {
    try {
      const token = localStorage.getItem('token');
      
      // Optimistically update UI
      if (currentList === 'followers') {
        setFollowers(prev => prev.map(follower =>
          follower.User_PublicID === userId
            ? { ...follower, isFollowing: !follower.isFollowing }
            : follower
        ));
      } else {
        setFollowing(prev => prev.map(follow =>
          follow.User_PublicID === userId
            ? { ...follow, isFollowing: !follow.isFollowing }
            : follow
        ));
      }

      // Optimistically update counts
      const isCurrentlyFollowing = currentList === 'following' || 
        (currentList === 'followers' && followers.find(f => f.User_PublicID === userId)?.isFollowing);
      
      updateFollowCounts(isCurrentlyFollowing);

      // Make API call
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/users/follow`, {
        User_PublicID: userId
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.data.status) {
        throw new Error(response.data.message || 'Failed to update follow status');
      }

      // Refresh data to ensure consistency
      await Promise.all([
        fetchFollowCounts(),
        fetchFollowers(),
        fetchFollowing()
      ]);

    } catch (error) {
      console.error('Error toggling follow status:', error);
      setError('Failed to update follow status');
      
      // Revert optimistic updates on error
      await Promise.all([
        fetchFollowCounts(),
        fetchFollowers(),
        fetchFollowing()
      ]);
    }
  };

  const UserCard = ({ user, currentList }) => (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={user.User_ImageURL || 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png'}
            sx={{ width: 50, height: 50, mr: 2 }}
            alt={user.User_Name}
          />
          <Box>
            <Typography variant="h6">{user.User_Name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.User_Email}
            </Typography>
          </Box>
        </Box>
        <MDButton
          variant={user.isFollowing ? "outlined" : "contained"}
          color={user.isFollowing ? "error" : "primary"}
          onClick={() => handleFollowToggle(user.User_PublicID, currentList)}
          sx={{
            minWidth: '100px',
            '&.MuiButton-outlined': {
              borderColor: '#ff3366',
              color: '#ff3366',
              '&:hover': {
                borderColor: '#ff1744',
                backgroundColor: 'rgba(255, 51, 102, 0.08)'
              }
            }
          }}
        >
          {user.isFollowing ? "Unfollow" : "Follow"}
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
                Connections
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
                      color: '#FFF !important',
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#213a93',
                    },
                  }}
                >
                  <Tab label={`Followers (${followCounts.followers || 0})`} />
                  <Tab label={`Following (${followCounts.following || 0})`} />
                </Tabs>
              </Box>

              {/* Followers/Following List */}
              <Box>
                {selectedTab === 0 ? (
                  followers.length > 0 ? (
                    followers.map(user => (
                      <UserCard key={user.User_PublicID} user={user} currentList="followers" />
                    ))
                  ) : (
                    <Typography variant="body1" textAlign="center" py={4}>
                      No followers yet
                    </Typography>
                  )
                ) : (
                  following.length > 0 ? (
                    following.map(user => (
                      <UserCard key={user.User_PublicID} user={user} currentList="following" />
                    ))
                  ) : (
                    <Typography variant="body1" textAlign="center" py={4}>
                      Not following anyone yet
                    </Typography>
                  )
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default Followers; 