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
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDButton from 'components/MDButton';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const Followers = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [followers, setFollowers] = useState([
    {
      id: 1,
      name: 'Alice Cooper',
      username: '@alice',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      isFollowing: true
    },
    {
      id: 2,
      name: 'Bob Wilson',
      username: '@bobwilson',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      isFollowing: false
    },
    {
      id: 3,
      name: 'Carol Smith',
      username: '@carol',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      isFollowing: true
    }
  ]);

  const [following, setFollowing] = useState([
    {
      id: 4,
      name: 'David Brown',
      username: '@david',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      isFollowing: true
    },
    {
      id: 5,
      name: 'Eva Green',
      username: '@eva',
      avatar: 'https://files.loghic.com/TEST_USER/defaultImages/profileImages/user-icon_11.png',
      isFollowing: true
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

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleFollowToggle = (userId, currentList) => {
    if (currentList === 'followers') {
      setFollowers(followers.map(follower =>
        follower.id === userId
          ? { ...follower, isFollowing: !follower.isFollowing }
          : follower
      ));
    } else {
      setFollowing(following.map(follow =>
        follow.id === userId
          ? { ...follow, isFollowing: !follow.isFollowing }
          : follow
      ));
    }
  };

  const UserCard = ({ user, currentList }) => (
    <Card sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            src={user.avatar}
            sx={{ width: 50, height: 50, mr: 2 }}
          />
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {user.username}
            </Typography>
          </Box>
        </Box>
        <MDButton
          variant={user.isFollowing ? "outlined" : "contained"}
          color="primary"
          onClick={() => handleFollowToggle(user.id, currentList)}
        >
          {user.isFollowing ? "Unfollow" : "Follow"}
        </MDButton>
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
              <MDTypography variant="h5" color="dark" mb={3}>
                Connections
              </MDTypography>

              <Box sx={{  mb: 3 }}>
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
                  <Tab label={`Followers (${followers.length})`} />
                  <Tab label={`Following (${following.length})`} />
                </Tabs>
              </Box>

              {/* Followers/Following List */}
              <Box>
                {selectedTab === 0 ? (
                  followers.map(user => (
                    <UserCard key={user.id} user={user} currentList="followers" />
                  ))
                ) : (
                  following.map(user => (
                    <UserCard key={user.id} user={user} currentList="following" />
                  ))
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