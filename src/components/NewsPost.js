import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Avatar, Icon, Button } from '@mui/material';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import PropTypes from 'prop-types';
import PostDetails from './PostDetails'; // Import the PostDetails component

const NewsPost = ({ post, onInteraction }) => {
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

      // Handle updateCounts action separately
      if (type === 'updateCounts') {
        setCounts(prev => ({
          ...prev,
          likes: postId?.Post_NumLikes || prev.likes,
          dislikes: postId?.Post_NumDislikes || prev.dislikes,
          comments: postId?.Post_NumComments || prev.comments
        }));
        return { success: true };
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
    <MDBox p={3}>
      {/* Header */}
      <MDBox display="flex" alignItems="center" mb={3}>
        {post.Post_TypeUserOrCompany === "user" ? (
          <Link to={`/advisor-profile/${post.Post_UserID}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ mr: 2, width: 48, height: 48 }} 
                alt={post.Post_UserName} 
                src={post.Post_UserImageURL}
                aria-label={`${post.Post_UserName}'s profile picture`}
              />
              <MDBox>
                <MDTypography variant="subtitle1" fontWeight="medium">
                  {post.Post_UserName}
                </MDTypography>
              </MDBox>
            </Box>
          </Link>
        ) : (
          <Link 
            to={`/coin-profile/${post.Post_CompanyCode}.${post.Post_MarketType}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <Box display="flex" alignItems="center">
              <Avatar 
                sx={{ mr: 2, width: 48, height: 48 }} 
                alt={post.Post_CompanyName} 
                src={post.Post_CompanyLogoURL}
                aria-label={`${post.Post_CompanyName}'s logo`}
              />
              <MDBox>
                <MDTypography variant="subtitle1" fontWeight="medium">
                  {post.Post_CompanyName}
                </MDTypography>
              </MDBox>
            </Box>
          </Link>
        )}
        {/* <MDBox ml="auto">
          <Icon>more_horiz</Icon>
        </MDBox> */}
      </MDBox>
      
      {/* Content */}
      <MDTypography variant="body1" mb={3} fontSize="1rem" sx={{ cursor: "pointer" }} onClick={() => setOpenCommentModal(true)}>
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

      {/* Interaction Buttons */}
      <MDBox display="flex" alignItems="center" mt={2}>
        <Box 
          component="button"
          onClick={() => handleInteraction('like', post.Post_PublicID)}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Like post"
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_up_off</Icon>
          <MDTypography variant="button">{counts.likes}</MDTypography>
        </Box>
        <Box 
          component="button"
          onClick={() => handleInteraction('dislike', post.Post_PublicID)}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Dislike post"
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_down</Icon>
          <MDTypography variant="button">{counts.dislikes}</MDTypography>
        </Box>
        <Box 
          component="button"
          onClick={() => setOpenCommentModal(true)}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Comment on post"
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>comment</Icon>
          <MDTypography variant="button">{counts.comments}</MDTypography>
        </Box>
        <Box 
          component="button"
          onClick={() => onInteraction('share', post.Post_PublicID)}
          sx={{ 
            display: "flex", 
            alignItems: "center",
            ml: 2,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
          aria-label="Share post"
        >
          <Icon fontSize="small">share</Icon>
        </Box>
      </MDBox>

      {/* Comment Modal */}
      <PostDetails 
        open={openCommentModal} 
        handleClose={() => setOpenCommentModal(false)} 
        post={post}
        onInteraction={handleInteraction}
        counts={counts}
      />
    </MDBox>
  );
};

// PropTypes validation
NewsPost.propTypes = {
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
  }).isRequired,
  onInteraction: PropTypes.func.isRequired,
};

export default NewsPost; 