import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Avatar, Icon, Button, Card } from '@mui/material';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from 'prop-types';
import PostDetails from './PostDetails'; // Import the PostDetails component

const NewsPostProfile = ({ post, onInteraction }) => {
  // Local state for counts
  const [counts, setCounts] = useState({
    likes: post.Post_NumLikes || 0,
    dislikes: post.Post_NumDislikes || 0,
    comments: post.Post_NumComments || 0
  });
  const [openCommentModal, setOpenCommentModal] = useState(false);

  // Update counts when post prop changes
  useEffect(() => {
    setCounts({
      likes: post.Post_NumLikes || 0,
      dislikes: post.Post_NumDislikes || 0,
      comments: post.Post_NumComments || 0
    });
  }, [post.Post_NumLikes, post.Post_NumDislikes, post.Post_NumComments]);

  const handleInteraction = async (type, postId) => {
    try {
      if (!onInteraction) {
        console.error('onInteraction prop is not provided to NewsPost');
        return { success: false };
      }
      const response = await onInteraction(type, postId || post.Post_PublicID);
      if (response?.success) {
        setCounts(prev => ({
          ...prev,
          likes: response.likes || prev.likes,
          dislikes: response.dislikes || prev.dislikes
        }));
      }
      return response;
    } catch (error) {
      console.error('Error handling interaction:', error);
      return { success: false };
    }
  };

  return (
    <Card sx={{ 
      p: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: 'white',
      borderRadius: '10px'
    }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2}>
        {post.Post_TypeUserOrCompany === "user" ? (
          <Link to={`/advisor-profile/${post.Post_UserID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ width: 40, height: 40 }} 
                alt={post.Post_UserName} 
                src={post.Post_UserImageURL}
                aria-label={`${post.Post_UserName}'s profile picture`}
              />
              <MDTypography variant="h6" ml={1} fontSize="1rem">
                {post.Post_UserName}
              </MDTypography>
            </Box>
          </Link>
        ) : (
          <Link 
            to={`/coin-profile/${post.Post_CompanyCode}.${post.Post_MarketType}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ width: 40, height: 40 }} 
                alt={post.Post_CompanyName} 
                src={post.Post_CompanyLogoURL}
                aria-label={`${post.Post_CompanyName}'s logo`}
              />
              <MDTypography variant="h6" ml={1} fontSize="1rem">
                {post.Post_CompanyName}
              </MDTypography>
            </Box>
          </Link>
        )}
      </Box>
      {/* Title */}
      <MDTypography 
        variant="body2" 
        color="text"
        sx={{ 
          mb: 2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          cursor: 'pointer'
        }}
        onClick={() => setOpenCommentModal(true)}
      >
        {post.Post_Title}
      </MDTypography>
    
      {/* Image */}
      {post.Post_ImageURL && (
        <MDBox
          component="img"
          src={post.Post_ImageURL}
          alt={post.Post_Title}
          borderRadius="lg"
          width="100%"
          height="200px"
          mb={2}
          sx={{ objectFit: "cover", cursor: "pointer" }}
          onClick={() => setOpenCommentModal(true)}
        />
      )}
      {/* Category Tag if exists */}
      {post.Post_Category && (
        <Box 
          sx={{ 
            display: 'inline-block',
            bgcolor: 'rgba(25, 118, 210, 0.1)',
            color: 'primary.main',
            borderRadius: '16px',
            px: 1.5,
            py: 0.5,
            mb: 2,
            fontSize: '0.75rem'
          }}
        >
          {post.Post_Category}
        </Box>
      )}
      {/* Interaction Buttons */}
      <Box 
        sx={{ 
          mt: 'auto', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          gap: 2
        }}
      >
        <Box 
          component="button"
          onClick={() => handleInteraction('like', post.Post_PublicID)}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            p: 0,
            color: 'text.secondary'
          }}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_up</Icon>
          <MDTypography variant="caption">{counts.likes}</MDTypography>
        </Box>

        <Box 
          component="button"
          onClick={() => handleInteraction('dislike', post.Post_PublicID)}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            p: 0,
            color: 'text.secondary'
          }}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_down</Icon>
          <MDTypography variant="caption">{counts.dislikes}</MDTypography>
        </Box>

        <Box 
          component="button"
          onClick={() => setOpenCommentModal(true)}
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            p: 0,
            color: 'text.secondary'
          }}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>comment</Icon>
          <MDTypography variant="caption">{counts.comments}</MDTypography>
        </Box>
      </Box>

      {/* Comment Modal */}
      <PostDetails 
        open={openCommentModal} 
        handleClose={() => setOpenCommentModal(false)} 
        post={post}
        onInteraction={handleInteraction}
        counts={counts}
      />
    </Card>
  );
};

// PropTypes validation
NewsPostProfile.propTypes = {
  post: PropTypes.shape({
    Post_PublicID: PropTypes.string.isRequired,
    Post_TypeUserOrCompany: PropTypes.string.isRequired,
    Post_UserName: PropTypes.string,
    Post_UserImageURL: PropTypes.string,
    Post_CompanyCode: PropTypes.string,
    Post_MarketType: PropTypes.string,
    Post_CompanyName: PropTypes.string,
    Post_CompanyLogoURL: PropTypes.string,
    Post_Title: PropTypes.string.isRequired,
    Post_ImageURL: PropTypes.string,
    Post_NumLikes: PropTypes.number.isRequired,
    Post_NumDislikes: PropTypes.number.isRequired,
    Post_NumComments: PropTypes.number.isRequired,
    Post_CreatedDate: PropTypes.string.isRequired,
    Post_Category: PropTypes.string,
  }).isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default NewsPostProfile; 