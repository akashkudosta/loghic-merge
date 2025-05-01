import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Button, Icon, Card } from '@mui/material';
import MDBox from 'components/MDBox';
import MDTypography from 'components/MDTypography';
import MDButton from 'components/MDButton';
import FrontendLayout from "layouts/frontend";
import placehoderBannerProfileImage from "../../assets/images/banner-placehoder.jpg";
import placehoderUserImage from '../../assets/images/user-placehoder.png';
import TrendingNews from '../../components/TrendingNews/TrendingNews';
import NewsPost from '../../components/NewsPost';
import NewsPostProfile from '../../components/NewsPostProfile';
import { useNotification } from "../../context/NotificationContext";
import { AuthContext } from "../../context";
import MessagePopup from '../../components/MessagePopup';

const AdvisorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [advisorData, setAdvisorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posts, setPosts] = useState([]);
  const { showNotification } = useNotification();
  const { isAuthenticated } = useContext(AuthContext);
  const [isMessagePopupOpen, setIsMessagePopupOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const handleInteraction = async (type, postId) => {
    if (!isAuthenticated) {
      const messages = {
        like: 'Please login to like posts',
        dislike: 'Please login to dislike posts',
        comment: 'Please login to comment on posts',
        share: 'Please login to share posts'
      };

      showNotification({
        message: messages[type] || 'Please login to interact with posts',
        severity: 'warning'
      });
      return { success: false };
    }

    if (type === 'like' || type === 'dislike') {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/postVote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            PostVote_PostID: postId,
            PostVote_VoteType: type === 'like' ? 'Like' : 'Dislike'
          }),
        });

        const data = await response.json();
        if (data.status) {
          // Update the post with new counts in local state
          setPosts(prevPosts =>
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

          showNotification({
            message: data.message,
            severity: 'success'
          });

          return {
            success: true,
            likes: data.data.Post_NumLikes,
            dislikes: data.data.Post_NumDislikes
          };
        } else {
          showNotification({
            message: data.message || `Failed to ${type} the post`,
            severity: 'error'
          });
          return { success: false };
        }
      } catch (error) {
        console.error(`Error handling ${type}:`, error);
        showNotification({
          message: 'An error occurred while processing your request',
          severity: 'error'
        });
        return { success: false };
      }
    }
    return { success: true };
  };

  const checkFollowStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/followStatus`, {
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
      console.log('Check Follow Status Response:', data);
      
      if (data.status) {
        setIsFollowing(data.data.isFollowing);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

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

  const fetchAdvisorData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/advisors/getAdvisorById?User_PublicID=${id}`, {
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
      if (data.success) {
        if (data.data.User_Role !== 'financial-advisor') {
          showNotification({
            message: 'Redirecting to user profile',
            severity: 'info'
          });
          navigate(`/user-profile/${id}`);
          return;
        }

        console.log('Advisor Data:', data.data);
        setAdvisorData(data.data);
        fetchAdvisorPosts(data.data.User_PublicID);
      } else {
        setError(data.message || 'Failed to fetch advisor data');
      }
    } catch (error) {
      setError('Error fetching advisor data');
      console.error('Error fetching advisor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdvisorPosts = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostbyUserId?Post_UserID=${userId}`, {
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
      if (data.status) {
        setPosts(data.data);
      } else {
        console.error('Failed to fetch posts:', data.message);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    fetchAdvisorData();
    if (isAuthenticated && id) {
      checkFollowStatus();
    }
  }, [id, isAuthenticated]);

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

  if (!advisorData) {
    return (
      <FrontendLayout>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <MDTypography>Advisor not found.</MDTypography>
        </MDBox>
      </FrontendLayout>
    );
  }

  return (
    <FrontendLayout>
      <MDBox>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, boxShadow: 'none', backgroundColor: 'transparent', position: 'relative' }}>
              {/* Back to Advice Button */}
              <Button
                variant="contained"
                onClick={() => navigate('/advice')}
                sx={{
                  mb: 3,
                  backgroundColor: '#213a93',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#1565c0' },
                  textTransform: 'none',
                  borderRadius: '50px',
                  px: 3,
                  position: 'absolute',
                  top: 30,
                  left: 30
                }}
              >
                Back to Advice
              </Button>

              <MDBox
                component="img"
                src={advisorData.User_WallpaperImageURL || placehoderBannerProfileImage}
                alt={advisorData.User_Name || 'advisor profile'}
                borderRadius="lg"
                width="100%"
                height="200px"
                mb={2}
                sx={{ objectFit: "cover" }}
              />

              {/* Profile Info Card */}
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                mb: 3
              }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} md={2}>
                    <Box
                      component="img"
                      src={advisorData.User_ImageURL || placehoderUserImage}
                      alt={advisorData.User_Name}
                      sx={{
                        width: '100%',
                        borderRadius: '50%',
                        border: '3px solid #FFD700'
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <MDTypography variant="h5" fontWeight="bold">
                      {advisorData.User_Name}
                    </MDTypography>
                    <MDTypography variant="body1" color="text">
                      {advisorData.Uesr_Advisor_Category || ''}
                    </MDTypography>
                    {advisorData.User_Location && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Icon fontSize="small" sx={{ mr: 0.5 }}>location_on</Icon>
                                <MDTypography variant="body2">
                                {advisorData.User_Location || ''}
                                </MDTypography>
                            </Box>
                        </Box>
                    )}
                    {advisorData.User_Email && (
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Icon fontSize="small" sx={{ mr: 0.5 }}>email</Icon>
                                <MDTypography variant="body2">
                                {advisorData.User_Email || ''}
                                </MDTypography>
                            </Box>
                        </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        fullWidth
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
                          textTransform: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        Message
                      </Button>
                      <Button
                        variant={isFollowing ? "outlined" : "contained"}
                        fullWidth
                        onClick={handleFollow}
                        sx={{
                          borderColor: '#213a93',
                          color: isFollowing ? '#213a93' : '#ffffff',
                          backgroundColor: isFollowing ? 'transparent' : '#213a93',
                          '&:hover': { 
                            backgroundColor: isFollowing ? 'rgba(33, 58, 147, 0.1)' : '#1565c0',
                            borderColor: '#213a93'
                          },
                          textTransform: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        {isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Hero Line */}
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                mb: 3
              }}>
                <MDTypography variant="h6" fontWeight="medium" mb={2}>
                  Hero Line
                </MDTypography>
                <MDTypography variant="body1" color="text">
                  Empowering your financial future with personalized guidance.
                </MDTypography>
                <MDTypography variant="body1" color="text" mt={2}>
                  "John Doe is a seasoned financial advisor with over [X] years of experience in helping clients achieve their financial goals. Specializing in [specific areas such as investment planning, retirement strategies, wealth management], John provides personalized financial solutions tailored to each client's unique needs. With a commitment to integrity and a client-first approach, John empowers individuals and families to make informed decisions for a secure financial future." Feel free to customize it further based on specific expertise and achievements
                </MDTypography>
              </Box>

                {/* Main Posts Section - First Post Only */}
                {posts.length > 0 && (
                    <Box sx={{ mt: 4 }}>
                        <Card sx={{ mb: 3, overflow: "hidden" }}>
                            <NewsPost post={posts[0]} onInteraction={handleInteraction} />
                        </Card>
                    </Box>
                )}
            </Card>
            {/* Test Posts Section - Remaining Posts */}

            {posts.slice(1).length > 0 && (
                <Card sx={{ mt: 4, p: 3, backgroundColor: 'transparent' }}>
                    <Box>
                        <Grid container spacing={3}>
                        {posts.slice(1).map((post) => (
                            <Grid item xs={12} sm={6} md={4} key={`grid-${post._id}`}>
                            <Card sx={{ 
                                backgroundColor: 'white', 
                                borderRadius: '10px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}>
                                <NewsPostProfile post={post} onInteraction={handleInteraction} />
                            </Card>
                            </Grid>
                        ))}
                        </Grid>
                        {posts.length <= 1 && (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <MDTypography variant="body1" color="text">
                            No additional posts available
                            </MDTypography>
                        </Box>
                        )}
                    </Box>
                </Card>
            )}
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Subscription Card */}
            {/* Please don't remove the Subscription Card commented code below we will use it in the future */}
            {/* <Card sx={{ marginBottom: 4, boxShadow: 'none', backgroundColor: 'transparent' }}>
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px',
                mb: 3,
                textAlign: 'center'
              }}>
                <MDTypography variant="h4" fontWeight="bold" mb={2} color="primary">
                  Upgrade to Premium, Dive Deeper.
                </MDTypography>
                <MDTypography variant="body1" color="text" mb={3}>
                  Discover More with Premium Content Subscription
                </MDTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#000',
                        '&:hover': { backgroundColor: '#F4C430' },
                        borderRadius: '25px',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      $25/Monthly SUBSCRIBE
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        backgroundColor: '#FFD700',
                        color: '#000',
                        '&:hover': { backgroundColor: '#F4C430' },
                        borderRadius: '25px',
                        py: 1.5,
                        textTransform: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      $350/Yearly SUBSCRIBE
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card> */}

            {/* Trending Posts */}
            <Card sx={{ p: 3, boxShadow: 'none', backgroundColor: 'transparent' }}>
              <Box sx={{ 
                backgroundColor: 'white',
                borderRadius: '10px',
                padding: '20px'
              }}>
                <TrendingNews limit={10} />
              </Box>
            </Card>
          </Grid>
        </Grid>
      </MDBox>

      {/* Message Popup */}
      <MessagePopup
        open={isMessagePopupOpen}
        onClose={() => setIsMessagePopupOpen(false)}
        recipient={advisorData?.User_Name || ''}
        recipientImage={advisorData?.User_ImageURL || placehoderUserImage}
        recipientId={advisorData?.User_PublicID}
      />
    </FrontendLayout>
  );
};

export default AdvisorProfile; 