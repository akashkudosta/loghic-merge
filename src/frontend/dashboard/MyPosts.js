import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';

const MyPosts = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  const posts = [
    {
      id: 1,
      title: 'Analysis of Bitcoin Market Trends',
      date: '2024-03-15',
      status: 'Published',
      views: 1234,
      likes: 56
    },
    {
      id: 2,
      title: 'Ethereum 2.0: What to Expect',
      date: '2024-03-14',
      status: 'Draft',
      views: 0,
      likes: 0
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

  const handleMenuClick = (event, post) => {
    setAnchorEl(event.currentTarget);
    setSelectedPost(post);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPost(null);
  };

  const handleEditPost = () => {
    if (selectedPost) {
      navigate('/dashboard/add-post', { 
        state: { 
          isEditing: true,
          postData: selectedPost
        } 
      });
    }
    handleMenuClose();
  };

  const handleCreateNewPost = () => {
    navigate('/dashboard/add-post');
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <MDTypography variant="h5" color="dark">
                  My Posts
                </MDTypography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNewPost}
                  sx={{
                    backgroundColor: '#213a93',
                    color: '#ffffff',
                    '&:hover': { backgroundColor: '#1a2d75' }
                  }}
                >
                  Create New Post
                </Button>
              </Box>

              <Grid container spacing={3}>
                {posts.map((post) => (
                  <Grid item xs={12} key={post.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: '1px solid #eee',
                        borderRadius: 1,
                        '&:hover': { backgroundColor: '#f8f9fa' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {post.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Posted on {post.date}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <Chip
                              label={post.status}
                              size="small"
                              color={post.status === 'Published' ? 'success' : 'default'}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {post.views} views • {post.likes} likes
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton onClick={(e) => handleMenuClick(e, post)}>
                          <MoreVertIcon />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleEditPost}>Edit</MenuItem>
                <MenuItem onClick={handleMenuClose}>Preview</MenuItem>
                {selectedPost?.status === 'Draft' && (
                  <MenuItem onClick={handleMenuClose}>Publish</MenuItem>
                )}
                <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
                  Delete
                </MenuItem>
              </Menu>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default MyPosts; 