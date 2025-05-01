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
  IconButton,
  Chip,
  Divider,
  Menu,
  MenuItem
} from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import FrontendLayout from "layouts/frontend";
import axios from 'axios';
import DashboardSidebar from './DashboardSidebar';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const FlaggedComments = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [comments, setComments] = useState([
    {
      id: 1,
      content: 'This comment contains inappropriate language',
      post: 'How to improve code quality',
      flaggedBy: 'John Doe',
      flaggedDate: '2024-03-15',
      reason: 'Inappropriate Content'
    },
    {
      id: 2,
      content: 'Spam content detected in this comment',
      post: 'Best practices for React',
      flaggedBy: 'Jane Smith',
      flaggedDate: '2024-03-14',
      reason: 'Spam'
    },
    {
      id: 3,
      content: 'Harassment reported in this comment',
      post: 'JavaScript Tips and Tricks',
      flaggedBy: 'Mike Johnson',
      flaggedDate: '2024-03-13',
      reason: 'Harassment'
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

  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setSelectedComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedComment(null);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_URL}/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
    handleMenuClose();
  };

  const handleIgnoreFlag = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${process.env.REACT_APP_API_URL}/comments/${commentId}/ignore-flag`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error ignoring flag:', error);
    }
    handleMenuClose();
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
                Flagged Comments
              </MDTypography>

              <List>
                {comments.map((comment, index) => (
                  <React.Fragment key={comment.id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            {comment.content}
                            <Chip
                              label={comment.reason}
                              color="error"
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Post:</strong> {comment.post}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Flagged by:</strong> {comment.flaggedBy} on {comment.flaggedDate}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={(e) => handleMenuOpen(e, comment)}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < comments.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => selectedComment && handleDeleteComment(selectedComment.id)}>
                  Delete Comment
                </MenuItem>
                <MenuItem onClick={() => selectedComment && handleIgnoreFlag(selectedComment.id)}>
                  Ignore Flag
                </MenuItem>
              </Menu>

              {comments.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    No flagged comments found
                  </Typography>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </FrontendLayout>
  );
};

export default FlaggedComments; 