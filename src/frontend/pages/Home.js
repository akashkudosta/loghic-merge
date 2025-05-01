import React, { useEffect, useState, useContext, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import { Link } from 'react-router-dom';
import { Button, Box } from '@mui/material';

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import AddPost from '../../components/AddPost';
import FrontendLayout from "layouts/frontend";
import { AuthContext } from "../../context";
import { useNotification } from "../../context/NotificationContext";
import NewsPost from "components/NewsPost";
import TrendingNews from '../../components/TrendingNews/TrendingNews';

const Home = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [trendingCompanies, setTrendingCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [topGainers, setTopGainers] = useState([]);
  const [loadingGainers, setLoadingGainers] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [newsPosts, setNewsPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const NewsLimit = 20; // Set the limit for posts to fetch

  // Add dummy data for upcoming events
  const dummyUpcomingEvents = [
    {
      Event_ID: 1,
      Event_Title: "Annual Blockchain Conference 2024",
      Event_Description: "Join us for the biggest blockchain event of the year featuring industry leaders and innovative projects.",
      Event_Date: "2024-05-15",
      Event_Time: "09:00 AM",
      Event_Location: "New York City",
      Event_Type: "Conference",
      Event_ImageURL: "https://example.com/conference-image.jpg"
    },
    {
      Event_ID: 2,
      Event_Title: "Crypto Trading Workshop",
      Event_Description: "Learn advanced trading strategies from experienced traders in this hands-on workshop.",
      Event_Date: "2024-05-20",
      Event_Time: "02:00 PM",
      Event_Location: "Virtual Event",
      Event_Type: "Workshop",
      Event_ImageURL: "https://example.com/workshop-image.jpg"
    },
    {
      Event_ID: 3,
      Event_Title: "DeFi Summit 2024",
      Event_Description: "Explore the latest developments in decentralized finance with expert panels and networking opportunities.",
      Event_Date: "2024-06-01",
      Event_Time: "10:00 AM",
      Event_Location: "London",
      Event_Type: "Summit",
      Event_ImageURL: "https://example.com/defi-image.jpg"
    },
    {
      Event_ID: 4,
      Event_Title: "NFT Art Exhibition",
      Event_Description: "Discover groundbreaking digital art and meet the artists shaping the future of NFTs.",
      Event_Date: "2024-06-15",
      Event_Time: "06:00 PM",
      Event_Location: "Miami",
      Event_Type: "Exhibition",
      Event_ImageURL: "https://example.com/nft-image.jpg"
    },
    {
      Event_ID: 5,
      Event_Title: "Metaverse Development Forum",
      Event_Description: "Connect with developers and entrepreneurs building the next generation of virtual worlds.",
      Event_Date: "2024-06-30",
      Event_Time: "11:00 AM",
      Event_Location: "San Francisco",
      Event_Type: "Forum",
      Event_ImageURL: "https://example.com/metaverse-image.jpg"
    }
  ];

  const fetchMarketOverview = async (page = 1, limit = 10) => {

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getCompanyMarketOverview?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      if (data.status) {
        setMarketData(data.data.companies);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching market overview:", error);
    } finally {
      setLoadingMarket(false);
    }
  };

  const fetchTrendingCompanies = async (page = 1, limit = 5) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getTrendingCompanies?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) {
        setTrendingCompanies(data.data.companies);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching trending companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchTopGainers = async (page = 1, limit = 5) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/companies/getTopGainers?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status) {
        setTopGainers(data.data.companies);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching top gainers:", error);
    } finally {
      setLoadingGainers(false);
    }
  };

  const fetchUpcomingEvents = async (page = 1, limit = 5) => {
    try {
      // Instead of making an API call, use the dummy data
      setUpcomingEvents(dummyUpcomingEvents);
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchNewsPosts = useCallback(async (page = 1, limit = NewsLimit) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPosts?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) {
        if (page === 1) {
          // Reset posts when fetching first page
          setNewsPosts(data.data.posts);
        } else {
          // Append posts for subsequent pages
          setNewsPosts((prevPosts) => [...prevPosts, ...data.data.posts]);
        }
        setHasMorePosts(data.data.posts.length === limit);
      } else {
        console.error(data.message);
        setHasMorePosts(false);
      }
    } catch (error) {
      console.error("Error fetching news posts:", error);
      setHasMorePosts(false);
    } finally {
      setLoadingPosts(false);
    }
  }, [NewsLimit]);

  const loadMorePosts = useCallback(() => {
    if (!loadingPosts && hasMorePosts) {
      setLoadingPosts(true);
      setCurrentPage((prevPage) => prevPage + 1);
    }
  }, [loadingPosts, hasMorePosts]);

  useEffect(() => {
    const handleScroll = () => {
      if (loadingPosts || !hasMorePosts) return;

      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate distance from bottom (in pixels) - adjust this value as needed
      const distanceFromBottom = 200;
      
      // Check if we're near the bottom
      if (documentHeight - (scrollPosition + windowHeight) < distanceFromBottom) {
        loadMorePosts();
      }
    };

    // Throttle scroll event for better performance
    let timeoutId;
    const throttledScroll = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledScroll);
    return () => {
      window.removeEventListener('scroll', throttledScroll);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [loadingPosts, hasMorePosts, loadMorePosts]);

  useEffect(() => {
    fetchMarketOverview();
    fetchTrendingCompanies();
    fetchTopGainers();
    fetchUpcomingEvents();
    fetchNewsPosts(currentPage);
  }, [currentPage, fetchNewsPosts]);

  const handleOpen = () => {
    setOpenModal(true);
  };

  const handleClose = (isPostCreated = false) => {
    setOpenModal(false);
    // Only refresh posts if a new post was actually created
    if (isPostCreated === true) {  // Explicit check for true
      setNewsPosts([]);
      setCurrentPage(1);
      fetchNewsPosts(1);
    }
  };

  const handleInteraction = async (action, postId) => {
    // Handle updateCounts action separately
    if (action === 'updateCounts') {
      return { success: true };
    }

    if (!isAuthenticated) {
      const messages = {
        like: 'Please login to like posts',
        dislike: 'Please login to dislike posts',
        comment: 'Please login to comment on posts',
        share: 'Please login to share posts'
      };

      showNotification({
        message: messages[action] || 'Please login to interact with posts',
        severity: 'warning'
      });
      return { success: false };
    }

    if (action === 'like' || action === 'dislike') {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/postVote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            PostVote_PostID: postId,
            PostVote_VoteType: action === 'like' ? 'Like' : 'Dislike'
          })
        });

        const data = await response.json();
        
        if (data.status) {
          // Get the updated post data from the response
          const updatedPost = data.data;
          
          // Update the post with the new counts
          setNewsPosts(prevPosts => 
            prevPosts.map(post => {
              if (post.Post_PublicID === postId) {
                return {
                  ...post,
                  Post_NumLikes: updatedPost.Post_NumLikes,
                  Post_NumDislikes: updatedPost.Post_NumDislikes
                };
              }
              return post;
            })
          );

          showNotification({
            message: data.message,
            severity: 'success'
          });
          
          // Return the updated counts
          return { 
            success: true,
            likes: updatedPost.Post_NumLikes,
            dislikes: updatedPost.Post_NumDislikes
          };
        } else {
          showNotification({
            message: data.message || `Failed to ${action} the post`,
            severity: 'error'
          });
          return { success: false };
        }
      } catch (error) {
        console.error(`Error handling ${action}:`, error);
        showNotification({
          message: 'An error occurred while processing your request',
          severity: 'error'
        });
        return { success: false };
      }
    }
    return { success: true };
  };

  return (
    <FrontendLayout>
    <MDBox py={3}>
      <Grid container spacing={3}>
        {/* Market Overview Section */}
        <Grid item xs={12} md={3}>
          <Grid container spacing={3}>
            {/* Trending Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Market Overview
                  </MDTypography>
                  
                  <MDBox mt={3}>
                    {loadingMarket ? (
                      <MDTypography variant="body1">Loading...</MDTypography>
                    ) : (
                      marketData.map((coin) => (
                        <MDBox key={coin.Company_Symbol} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Link to={`/coin-profile/${coin.Company_Symbol}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MDBox display="flex" alignItems="center">
                              <MDBox
                                component="img"
                                src={coin.Company_LogoURL || ''}
                                alt={coin.Company_Name || 'No Name'}
                                width="30px"
                                height="30px"
                                mr={2}
                                borderRadius="xl"
                              />
                              <MDTypography variant="button" fontWeight="medium">
                                {coin.Company_Name || 'Unknown Company'}
                              </MDTypography>
                            </MDBox>
                          </Link>
                          <MDBox textAlign="right">
                            <MDTypography variant="h6">${(coin.Current_Price || 0).toFixed(5)}</MDTypography>
                            <MDTypography variant="button" color={(coin.PriceChangePercentage_24h || 0) > 0 ? "success" : "error"}>
                              {(coin.PriceChangePercentage_24h || 0).toFixed(5)}%
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      ))
                    )}
                  </MDBox>
                </MDBox>

              </Card>
            </Grid>

            {/* Trending News Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <TrendingNews limit={5} />
                </MDBox>
              </Card>
            </Grid>
 
          </Grid>
        </Grid>
         

        {/* News Feed Section */}
        <Grid item xs={12} md={6}>
          {/* What's on your mind input - Only show for authenticated users */}
          {isAuthenticated ? (
            <Card sx={{ mb: 3 }}>
              <MDBox p={2} display="flex" alignItems="center">
                <Avatar sx={{ mr: 2 }} alt="User profile" src="" />
                <MDBox 
                  component="input" 
                  placeholder="What's on your mind ?"
                  width="100%"
                  p={1.5}
                  borderRadius="lg"
                  bgcolor="grey.100"
                  border="none"
                  sx={{ 
                    outline: "none",
                    fontSize: "16px",
                    color: "grey.700",
                    "&::placeholder": {
                      color: "grey.400"
                    },
                    cursor: 'pointer'
                  }}
                  onClick={handleOpen}
                />
              </MDBox>
            </Card>
          ) : null}

          {/* News Posts */}
          {newsPosts.map((post) => (
            <Card key={post.Post_PublicID} sx={{ mb: 3, overflow: "hidden" }}>
              <NewsPost post={post} onInteraction={handleInteraction} />
            </Card>
          ))}
          
          {/* Loading indicator */}
          {loadingPosts && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <MDTypography variant="body1">Loading more posts...</MDTypography>
            </Box>
          )}
          
          {/* No more posts indicator */}
          {!hasMorePosts && newsPosts.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
              <MDTypography variant="body1">No more posts to load</MDTypography>
            </Box>
          )}
        </Grid>

        {/* Trending and Events Section */}
        <Grid item xs={12} md={3}>
          <Grid container spacing={3}>
            {/* Trending Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Trending
                    </MDTypography>
                  </MDBox>
                  
                  {/* Trending Companies */}
                  {loadingCompanies ? (
                    <MDTypography variant="body1">Loading...</MDTypography>
                  ) : (
                    trendingCompanies.map((company) => (
                      <MDBox key={company.Company_Symbol} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Link to={`/coin-profile/${company.Company_Symbol}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <MDBox display="flex" alignItems="center">
                            <MDBox
                              component="img"
                              src={company.Company_LogoURL || ''}
                              alt={company.Company_Name || 'No Name'}
                              width="40px"
                              height="40px"
                              mr={2}
                              borderRadius="xl"
                            />
                            <MDTypography variant="button" fontWeight="medium">
                              {company.Company_Name || 'Unknown Company'}
                            </MDTypography>
                          </MDBox>
                        </Link>
                        <MDBox textAlign="right">
                          <MDTypography variant="h6">${(company.Current_Price || 0).toFixed(5)}</MDTypography>
                          <MDTypography variant="button" color={(company.PriceChangePercentage_24h || 0) > 0 ? "success" : "error"}>
                            {(company.PriceChangePercentage_24h || 0).toFixed(5)}%
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ))
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Events Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <MDTypography variant="h6" fontWeight="medium">
                      Events
                    </MDTypography>
                    <MDButton variant="text" color="info">
                      View All
                    </MDButton>
                  </MDBox>
                  
                  {/* Event Items */}
                  {loadingEvents ? (
                    <MDTypography variant="body1">Loading...</MDTypography>
                  ) : (
                    upcomingEvents.map((event) => (
                      <MDBox key={event.Event_ID} display="flex" alignItems="center" mb={2}>
                        <MDBox
                          display="flex"
                          justifyContent="center"
                          alignItems="center"
                          width="40px"
                          height="40px"
                          mr={2}
                          color="white"
                          bgColor="info"
                          borderRadius="xl"
                        >
                          <Icon>event</Icon>
                        </MDBox>
                        <MDBox>
                          <MDTypography variant="button" fontWeight="medium">
                            {event.Event_Title || 'No Title'}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {new Date(event.Event_Date).toLocaleString()}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    ))
                  )}
                </MDBox>
              </Card>
            </Grid>

            {/* Top Gainers Section */}
            <Grid item xs={12}>
              <Card>
                <MDBox p={3}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Top Gainers
                  </MDTypography>
                  
                  <MDBox mt={3}>
                    {loadingGainers ? (
                      <MDTypography variant="body1">Loading...</MDTypography>
                    ) : (
                      topGainers.map((company) => (
                        <MDBox key={company.Company_Symbol} display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Link to={`/coin-profile/${company.Company_Symbol}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <MDBox display="flex" alignItems="center">
                              <MDBox
                                component="img"
                                src={company.Company_LogoURL || ''}
                                alt={company.Company_Name || 'No Name'}
                                width="30px"
                                height="30px"
                                mr={2}
                                borderRadius="xl"
                              />
                              <MDTypography variant="button" fontWeight="medium">
                                {company.Company_Name || 'Unknown Company'}
                              </MDTypography>
                            </MDBox>
                          </Link>
                          <MDBox textAlign="right">
                            <MDTypography variant="h6">${(company.Current_Price || 0).toFixed(5)}</MDTypography>
                            <MDTypography variant="button" color={(company.PriceChangePercentage_24h || 0) > 0 ? "success" : "error"}>
                              {(company.PriceChangePercentage_24h || 0).toFixed(5)}%
                            </MDTypography>
                          </MDBox>
                        </MDBox>
                      ))
                    )}
                  </MDBox>
                </MDBox>

              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <AddPost open={openModal} handleClose={handleClose} />
    </MDBox>
    </FrontendLayout>
  );
};

export default Home;