import React, { useState, useEffect } from 'react';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import { List, ListItem, Box } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import PostDetails from '../PostDetails';
import { useNotification } from "../../context/NotificationContext";

const TrendingNews = ({ limit = 5 }) => {
  const { showNotification } = useNotification();
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openPostModal, setOpenPostModal] = useState(false);

  const fetchTrendingPosts = async () => {
    try {
      setLoadingPosts(true);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getTrendingPosts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page: 1, limit }),
      });
      const data = await response.json();
      if (data.status) {
        setTrendingPosts(data.data.posts);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching trending posts:', error);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
  }, [limit]); // Re-fetch when limit changes

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setOpenPostModal(true);
  };

  const handleClosePostModal = () => {
    setOpenPostModal(false);
    setSelectedPost(null);
  };

  const handleInteraction = async (type, postId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification({
          message: 'Please login to interact with posts',
          severity: 'warning'
        });
        return { success: false };
      }

      if (type === 'updateCounts') {
        // Just update local state for counts
        return { success: true };
      }

      if (type === 'like' || type === 'dislike') {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/postVote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            PostVote_PostID: postId,
            PostVote_VoteType: type === 'like' ? 'Like' : 'Dislike'
          }),
        });

        const data = await response.json();
        if (data.status) {
          // Update the post with new counts in local state
          setTrendingPosts(prevPosts =>
            prevPosts.map(post => {
              if (post.Post_PublicID === postId) {
                return {
                  ...post,
                  Post_NumLikes: data.data.Post_NumLikes,
                  Post_NumDislikes: data.data.Post_NumDislikes
                };
              }
              return post;
            })
          );

          return {
            success: true,
            likes: data.data.Post_NumLikes,
            dislikes: data.data.Post_NumDislikes
          };
        }
      }

      return { success: true };
    } catch (error) {
      console.error(`Error handling ${type}:`, error);
      showNotification({
        message: 'An error occurred while processing your request',
        severity: 'error'
      });
      return { success: false };
    }
  };

  return (
    <MDBox>
      <MDTypography variant="h4" color="dark" mb={2}>
        Trending News
      </MDTypography>
      <List sx={{ p: 0 }}>
        {loadingPosts ? (
          <ListItem>
            <MDTypography variant="body1" color="text">Loading...</MDTypography>
          </ListItem>
        ) : (
          trendingPosts.map((post) => (
            <ListItem
              key={post._id}
              onClick={() => handlePostClick(post)}
              sx={{
                borderBottom: '1px solid #eee',
                p: 1,
                '&:hover': {
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                },
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <MDTypography variant="body2" fontWeight="medium" color="dark">
                {post.Post_Title}
              </MDTypography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                width: '100%',
                mt: 1 
              }}>
                <MDTypography variant="caption" color="text">
                  {new Date(post.Post_CreatedDate).toLocaleString()}
                </MDTypography>
                {post.comments_count && (
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    ml: 'auto' 
                  }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    <MDTypography variant="caption" color="text">
                      {post.comments_count}
                    </MDTypography>
                  </Box>
                )}
              </Box>
            </ListItem>
          ))
        )}
      </List>

      {/* Post Details Modal */}
      {selectedPost && (
        <PostDetails
          open={openPostModal}
          handleClose={handleClosePostModal}
          post={selectedPost}
          onInteraction={handleInteraction}
        />
      )}
    </MDBox>
  );
};

export default TrendingNews; 