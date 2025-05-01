import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Container, Typography, Box, Grid, Card, CardContent } from '@mui/material';
import FrontendLayout from "layouts/frontend"; // Assuming you have a layout component
import PostDetails from '../../components/PostDetails'; // Import the PostDetails component

import defaultCompanyImage from '../../assets/images/company-default.jpg';
import defaultUserImage from '../../assets/images/user-default.png';

const SearchPage = () => {
  const location = useLocation();
  const keyword = new URLSearchParams(location.search).get('keyword');
  const [results, setResults] = useState({ companies: [], users: [], posts: [] });
  const [openPostDetails, setOpenPostDetails] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    if (keyword) {
      const fetchSearchResults = async () => {
        setLoading(true); // Set loading to true before fetching
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/search/searchAll?Search_keyword=${keyword}`);
          const data = await response.json();
          setResults(data.status ? data.data : { companies: [], users: [], posts: [] });
        } catch (error) {
          console.error("Error fetching search results:", error);
          setResults({ companies: [], users: [], posts: [] });
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      };
      fetchSearchResults();
    }
  }, [keyword]);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    setOpenPostDetails(true);
  };

  const handleInteraction = async (type, postId) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
      const data = await response.json();
      return data.success ? { success: true, likes: data.likes, dislikes: data.dislikes } : { success: false };
    } catch (error) {
      console.error('Error handling interaction:', error);
      return { success: false };
    }
  };

    const renderCard = (item, type) => (
        <Grid item xs={12} sm={6} md={4} key={item[type === 'company' ? 'Company_PublicID' : 'User_PublicID'] || item.Post_PublicID}>
        <Card sx={{ border: '1px solid #ccc', background: '#fff', boxShadow: 'none', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <CardContent sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ display: 'block', width: '100%', borderBottom: '1px solid #f1f1f1', marginBottom: 2, height: 35, fontWeight: 600, color: '#000' }}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
            </Typography>
            <Box display="flex" alignItems="center" sx={{ marginTop: 2 }}>
                <Link to={type === 'company' ? `/coin-profile/${item.Company_Symbol}` : `/advisor-profile/${item.User_PublicID}`}>  
                <img src={item[type === 'company' ? 'Company_LogoURL' : 'User_ImageURL'] || (type === 'company' ? defaultCompanyImage : defaultUserImage)} 
                    alt={item[type === 'company' ? 'Company_Name' : 'User_Name']} 
                    style={{ width: 80, height: 80, borderRadius: '50%', marginRight: 16 }} />
                </Link>
                <Box>                                                                                                                                                                           
                <Link to={type === 'company' ? `/coin-profile/${item.Company_Symbol}` : `/advisor-profile/${item.User_PublicID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600, color: '#000' }}>
                    {item[type === 'company' ? 'Company_Name' : 'User_Name']}
                    </Typography>
                </Link>
                {type === 'company' && <Typography variant="body2">{item.Company_Categories}</Typography>}
                </Box>
            </Box>
            </CardContent>
        </Card>
        </Grid>
    );

    return (
        <FrontendLayout>
            <Container sx={{ padding: 2, background: '#fff', borderRadius: 1, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h4" sx={{ width: '100%', marginBottom: 5, fontSize: 16, fontWeight: 500, color: '#787373' }} gutterBottom>
                Search Results: {keyword}
                </Typography>
                
                <Grid container spacing={3}>
                    {/* Render Companies */}
                    {results.companies.length > 0 && (
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                {results.companies.map(company => renderCard(company, 'company'))}
                            </Grid>
                        </Grid>
                    )}

                    {/* Render Users */}
                    {results.users.length > 0 && (
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                {results.users.map(user => renderCard(user, 'user'))}
                            </Grid>
                        </Grid>
                    )}

                    {/* Render Posts */}
                    {results.posts.length > 0 && (
                        <Grid item xs={12}>
                            <Grid container spacing={2}>
                                {results.posts.map(post => (
                                <Grid item xs={12} sm={6} md={4} key={post.Post_PublicID}>
                                    <Card sx={{border: '1px solid #ccc', background: '#fff', boxShadow: 'none'}}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ display: 'block', width: '100%', borderBottom: '1px solid #f1f1f1', marginBottom: 2, height: 35, fontWeight: 600, color: '#000', cursor: 'pointer' }} onClick={() => handlePostClick(post)}>Post</Typography>
                                        <Box display="flex" alignItems="center" sx={{ marginTop: 2 }}>
                                        {post.Post_ImageURL && (
                                            <img src={post.Post_ImageURL} alt={post.Post_Title} style={{ width: 50, height: 50, borderRadius: '50%', marginRight: 16, cursor: 'pointer' }} />
                                        )}
                                        <Typography variant="h6" style={{ cursor: 'pointer', color: '#000' }} onClick={() => handlePostClick(post)}>{post.Post_Title}</Typography>
                                        </Box>
                                    </CardContent>
                                    </Card>
                                </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    )}

                    {/* Show message if no results found */}
                    {!loading && results.companies.length === 0 && results.users.length === 0 && results.posts.length === 0 && (
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ textAlign: 'center', color: '#787373', padding: 2, border: '1px solid #ccc', borderRadius: 1, backgroundColor: '#f9f9f9' }}>
                            No results found for "{keyword}". Please try a different search.
                            </Typography>
                        </Grid>
                    )}
                </Grid>

        {/* Post Details Modal */}
        {selectedPost && (
          <PostDetails 
            open={openPostDetails} 
            handleClose={() => setOpenPostDetails(false)}
            post={selectedPost}
            onInteraction={handleInteraction} 
          />
        )}
      </Container>
    </FrontendLayout>
  );
};

export default SearchPage; 