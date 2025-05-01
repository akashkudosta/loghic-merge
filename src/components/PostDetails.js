import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, Modal, IconButton, Avatar, Icon, Alert, Snackbar } from '@mui/material';
import { AiOutlineClose, AiOutlineUpload } from 'react-icons/ai';
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import { format } from 'date-fns';
import { AuthContext } from "../context";
import { useNotification } from "../context/NotificationContext";
import DOMPurify from 'dompurify';
import placehoderUserImage from '../assets/images/user-placehoder.png';
import PostDetailsCss from './PostDetails.css';
import Sparkline from 'components/Sparkline';

const PostDetails = ({ open, handleClose, post, onInteraction }) => {
  const { isAuthenticated } = useContext(AuthContext);
  const { showNotification } = useNotification();
  
  const [postState, setPostState] = useState({
    details: null,
    loading: false,
    error: null
  });

  const [commentState, setCommentState] = useState({
    comments: [],
    replyToId: null,
    replyText: '',
    mainCommentText: '',
    counts: {
      likes: post?.Post_NumLikes || 0,
      dislikes: post?.Post_NumDislikes || 0,
      comments: post?.Post_NumComments || 0
    }
  });

  // Update parent post's counts before closing
  const handleModalClose = useCallback(() => {
    // Only update counts if there are actual changes
    if (commentState.counts.likes !== post.Post_NumLikes ||
        commentState.counts.dislikes !== post.Post_NumDislikes ||
        commentState.counts.comments !== post.Post_NumComments) {
      const updatedCounts = {
        Post_NumLikes: commentState.counts.likes,
        Post_NumDislikes: commentState.counts.dislikes,
        Post_NumComments: commentState.counts.comments
      };
      
      // Update the parent post with new counts
      onInteraction('updateCounts', null, updatedCounts);
    }
    handleClose();
  }, [commentState.counts, handleClose, onInteraction, post.Post_NumLikes, post.Post_NumDislikes, post.Post_NumComments]);

  // Fetch post details when opened
  const fetchPostDetails = useCallback(async () => {
    if (!open || !post?.Post_PublicID) return;
    
    setPostState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostbyId?Post_PublicID=${post.Post_PublicID}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const data = await response.json();
      if (data.status) {
        setPostState(prev => ({
          ...prev,
          details: data.data,
          loading: false
        }));
        setCommentState(prev => ({
          ...prev,
          comments: data.data.Post_Comments || [],
          counts: {
            likes: data.data.Post_NumLikes || 0,
            dislikes: data.data.Post_NumDislikes || 0,
            comments: data.data.Post_NumComments || 0
          }
        }));
      } else {
        setPostState(prev => ({
          ...prev,
          error: data.message || 'Failed to fetch post details',
          loading: false
        }));
      }
    } catch (error) {
      console.error("Error fetching post details:", error);
      setPostState(prev => ({
        ...prev,
        error: 'An error occurred while fetching post details',
        loading: false
      }));
    }
  }, [open, post?.Post_PublicID]);

  // Reset states and fetch data when modal opens
  useEffect(() => {
    if (open) {
      fetchPostDetails();
    }
    setCommentState(prev => ({
      ...prev,
      replyToId: null,
      replyText: '',
      mainCommentText: ''
    }));
  }, [open, fetchPostDetails]);

  // Memoized handlers
  const handleReplyClick = useCallback((commentId) => {
    setCommentState(prev => ({
      ...prev,
      replyToId: prev.replyToId === commentId ? null : commentId,
      replyText: ''
    }));
  }, []);

  const handleReplyTextChange = useCallback((text) => {
    setCommentState(prev => ({
      ...prev,
      replyText: text
    }));
  }, []);

  const handleMainCommentChange = useCallback((text) => {
    setCommentState(prev => ({
      ...prev,
      mainCommentText: text
    }));
  }, []);

  const handleReplySubmit = useCallback(async (parentCommentId) => {
    if (!commentState.replyText.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/submitComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          PostComment_PostID: post.Post_PublicID,
          PostComment_ParentID: parentCommentId,
          PostComment_Comment: commentState.replyText.trim(),
          PostComment_ImageURL: "",
          PostComment_UserType: "user"
        })
      });

      const data = await response.json();
      if (data.status) {
        // Only fetch comments, not the entire post
        const commentsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostbyId?Post_PublicID=${post.Post_PublicID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const commentsData = await commentsResponse.json();
        if (commentsData.status) {
          setCommentState(prev => ({
            ...prev,
            comments: commentsData.data.Post_Comments || [],
            replyToId: null,
            replyText: '',
            counts: {
              ...prev.counts,
              comments: commentsData.data.Post_NumComments
            }
          }));
        }
        showNotification({
          message: data.message,
          severity: 'success'
        });
      } else {
        showNotification({
          message: data.message || 'Failed to submit reply',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
      showNotification({
        message: 'Error submitting reply',
        severity: 'error'
      });
    }
  }, [commentState.replyText, post.Post_PublicID, showNotification]);

  // Handle main comment submission
  const handleMainCommentSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      onInteraction('comment', post.Post_PublicID);
      return;
    }

    if (!commentState.mainCommentText.trim()) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/submitComment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          PostComment_PostID: post.Post_PublicID,
          PostComment_ParentID: "",
          PostComment_Comment: commentState.mainCommentText.trim(),
          PostComment_ImageURL: "",
          PostComment_UserType: "user"
        })
      });

      const data = await response.json();
      if (data.status) {
        // Fetch updated post details to get latest comments and counts
        const updatedResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostbyId?Post_PublicID=${post.Post_PublicID}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        const updatedData = await updatedResponse.json();
        if (updatedData.status) {
          setCommentState(prev => ({
            ...prev,
            comments: updatedData.data.Post_Comments || [],
            mainCommentText: '',
            counts: {
              likes: updatedData.data.Post_NumLikes || prev.counts.likes,
              dislikes: updatedData.data.Post_NumDislikes || prev.counts.dislikes,
              comments: updatedData.data.Post_NumComments || prev.counts.comments
            }
          }));

          // Update parent post's comment count immediately
          onInteraction('updateCounts', null, {
            Post_NumLikes: updatedData.data.Post_NumLikes,
            Post_NumDislikes: updatedData.data.Post_NumDislikes,
            Post_NumComments: updatedData.data.Post_NumComments
          });
        }
        showNotification({
          message: data.message,
          severity: 'success'
        });
      } else {
        showNotification({
          message: data.message || 'Failed to submit comment',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      showNotification({
        message: 'Error submitting comment',
        severity: 'error'
      });
    }
  }, [commentState.mainCommentText, post.Post_PublicID, isAuthenticated, onInteraction, showNotification]);

  // Handle likes, dislikes and other interactions
  const handleInteraction = useCallback(async (type) => {
    // Check if user is logged in
    if (!isAuthenticated) {
      onInteraction(type, post.Post_PublicID);
      return;
    }

    try {
      const response = await onInteraction(type, post.Post_PublicID);
      if (response?.success) {
        setCommentState(prev => ({
          ...prev,
          counts: {
            ...prev.counts,
            likes: response.likes ?? prev.counts.likes,
            dislikes: response.dislikes ?? prev.counts.dislikes
          }
        }));
      }
    } catch (error) {
      console.error('Error in PostDetails interaction:', error);
    }
  }, [isAuthenticated, post.Post_PublicID, onInteraction]);

  // Update handleCommentInteraction to handle nested replies
  const handleCommentInteraction = useCallback(async (type, commentId) => {
    if (!isAuthenticated) {
      showNotification({
        message: `Please login to ${type} comments`,
        severity: 'warning'
      });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/postCommentVote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          PostCommentVote_CommentID: commentId,
          PostCommentVote_VoteType: type === 'like' ? 'Like' : 'Dislike'
        })
      });

      const data = await response.json();
      if (data.status) {
        // Update comment counts recursively in the state
        setCommentState(prev => ({
          ...prev,
          comments: prev.comments.map(comment => {
            // Function to update comment and its replies
            const updateCommentCounts = (c) => {
              if (c.PostComment_PublicID === commentId) {
                return {
                  ...c,
                  PostComment_NumLikes: data.data.PostComment_NumLikes,
                  PostComment_NumDislikes: data.data.PostComment_NumDislikes
                };
              }
              
              // If this comment has replies, check them recursively
              if (c.PostComment_Replies && c.PostComment_Replies.length > 0) {
                return {
                  ...c,
                  PostComment_Replies: c.PostComment_Replies.map(updateCommentCounts)
                };
              }
              
              return c;
            };

            return updateCommentCounts(comment);
          })
        }));

        showNotification({
          message: data.message,
          severity: 'success'
        });
      } else {
        showNotification({
          message: data.message || `Failed to ${type} the comment`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error(`Error handling comment ${type}:`, error);
      showNotification({
        message: 'An error occurred while processing your request',
        severity: 'error'
      });
    }
  }, [isAuthenticated, showNotification]);

  // Memoized CommentItem component
  const CommentItem = useMemo(() => React.memo(({ comment, isReply = false, depth = 0 }) => (
    <Box sx={{ 
      padding: 1, 
      marginTop: 1,
      marginLeft: isReply ? 4 : 0,
      backgroundColor: 'transparent'
    }}>
      <Box display="flex" alignItems="center" mb={1}>
        <Avatar 
          sx={{ mr: 2, width: 32, height: 32 }} 
          alt={comment.PostComment_UserName} 
          src={comment.PostComment_UserImageURL || placehoderUserImage}
        />
        <Box display="flex" flexDirection="column">
          <Typography variant="subtitle2">{comment.PostComment_UserName}</Typography>
          <Typography variant="caption" color="textSecondary">
            {format(new Date(comment.PostComment_CreatedDate), 'dd MMM yyyy')}
          </Typography>
        </Box>
      </Box>
      <Box bgcolor="rgb(241 241 241 / 50%)" p={1} borderRadius={1} border="1px solid #e0e0e0" sx={{ ml: 6 }}>
        <Typography variant="body2">{comment.PostComment_Comment}</Typography>
      </Box>
      <MDBox display="flex" alignItems="center" mt={2} ml={6} mb={3}>
        <Box 
          component="button"
          onClick={() => handleCommentInteraction('like', comment.PostComment_PublicID)}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_up_off</Icon>
          <MDTypography variant="button">{comment.PostComment_NumLikes || 0}</MDTypography>
        </Box>
        <Box 
          component="button"
          onClick={() => handleCommentInteraction('dislike', comment.PostComment_PublicID)}
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            mr: 4,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_down</Icon>
          <MDTypography variant="button">{comment.PostComment_NumDislikes || 0}</MDTypography>
        </Box>
        {isAuthenticated && depth < 2 && (
          <Box 
            component="button"
            onClick={() => handleReplyClick(comment.PostComment_PublicID)}
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              mr: 4,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <MDTypography variant="button" color="primary">Reply</MDTypography>
          </Box>
        )}
      </MDBox>

      {commentState.replyToId === comment.PostComment_PublicID && (
        <Box display="flex" alignItems="center" mt={2} ml={6}>
          <TextField
            fullWidth
            placeholder="Write a reply..."
            value={commentState.replyText}
            onChange={(e) => handleReplyTextChange(e.target.value)}
            size="small"
            autoFocus
            sx={{ 
              mr: 1,
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#f8f9fa'
              }
            }}
          />
          <Button 
            variant="contained"
            onClick={() => handleReplySubmit(comment.PostComment_PublicID)}
            sx={{ 
              backgroundColor: '#203A93',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#162a6b'
              }
            }}
          >
            Reply
          </Button>
        </Box>
      )}

      {/* Render nested replies */}
      {comment.PostComment_Replies && comment.PostComment_Replies.map((reply) => (
        <CommentItem 
          key={reply.PostComment_PublicID} 
          comment={reply} 
          isReply={true}
          depth={depth + 1}
        />
      ))}
    </Box>
  )), [commentState.replyToId, commentState.replyText, handleReplyClick, handleReplyTextChange, handleReplySubmit, isAuthenticated, handleCommentInteraction]);

  // Main comment input section
  const MainCommentInput = useMemo(() => (
    <Box display="flex" alignItems="center" mt={2}>
      <Avatar 
        sx={{ mr: 2, width: 48, height: 48 }} 
        alt={postState.details?.Post_CompanyName || post.Post_UserName} 
        src={postState.details?.Post_CompanyLogoURL || post.Post_UserImageURL}
        aria-label={`${postState.details?.Post_CompanyName || post.Post_UserName}'s profile picture`}
      />
      <TextField
        label="Your Comment"
        variant="outlined"
        fullWidth
        value={commentState.mainCommentText}
        onChange={(e) => handleMainCommentChange(e.target.value)}
        style={{ height: '46px', margin: 0 }}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleMainCommentSubmit();
          }
        }}
      />
      
      {isAuthenticated && (
        <>
          <input
            type="file"
            accept="image/*"
            id="upload-image"
            style={{ display: 'none' }}
          />
          <Button 
            component="label"
            htmlFor="upload-image" 
            style={{ 
              cursor: 'pointer', 
              marginLeft: 10, 
              backgroundColor: 'transparent', 
              color: '#000', 
              height: '46px', 
              border: '1px solid #d2d6da' 
            }}
          >
            <Icon fontSize="small">attach_file</Icon>
          </Button>
        </>
      )}
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleMainCommentSubmit}
        style={{ 
          marginLeft: 10, 
          backgroundColor: '#203A93', 
          color: '#fff', 
          height: '46px' 
        }}
      >
        <Icon fontSize="small" sx={{ mr: 0.5 }}>send</Icon>
      </Button>
    </Box>
  ), [
    postState.details, 
    post.Post_UserName, 
    post.Post_UserImageURL, 
    commentState.mainCommentText, 
    handleMainCommentChange, 
    handleMainCommentSubmit, 
    isAuthenticated
  ]);

  const sanitizeAndCleanHtml = (html) => {
    if (!html) return '';
    // First sanitize the HTML
    let cleanHtml = DOMPurify.sanitize(html, {
      ADD_TAGS: ['h2'],
      ADD_ATTR: ['id', 'class', 'style', 'data-post-id'],
    });
    // Process the related stories section
    if (postState.details?.Post_RelatedStories) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = cleanHtml;
      
      // Find the related stories content container
      const relatedStoriesContent = tempDiv.querySelector('#related_stories');
      if (relatedStoriesContent) {
        // Create the related stories HTML
        const relatedStoriesHtml = `<div class="related-stories">
                                      <h2>Related Stories:</h2>
                                      <div class="lc_AI_Article_Summary_Sub_item_related_stories_content" id="related_stories_content">
                                        ${postState.details.Post_RelatedStories.map(story => `
                                          <div 
                                            class="related-story-item" 
                                            data-post-id="${story.Post_PublicID}"
                                            style="padding: 10px 0; margin-bottom: 10px; border-bottom: 1px solid #e0e0e0; cursor: pointer;"
                                          >
                                            <div style="font-size: 16px; margin-bottom: 8px; color: #344767;">
                                              ${story.Post_Title}
                                            </div>
                                            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #666;">
                                              <span style="display: flex; align-items: center; gap: 12px; color: #666;">
                                                <span style="display: flex; align-items: center;">
                                                  <i class="material-icons" style="font-size: 16px; margin-right: 4px;">thumb_up</i>
                                                  <span style="font-size: 12px;">${story.Post_NumLikes || 0}</span>
                                                </span>
                                                <span style="display: flex; align-items: center;">
                                                  <i class="material-icons" style="font-size: 16px; margin-right: 4px;">thumb_down</i>
                                                  <span style="font-size: 12px;">${story.Post_NumDislikes || 0}</span>
                                                </span>
                                                <span style="display: flex; align-items: center;">
                                                  <i class="material-icons" style="font-size: 16px; margin-right: 4px;">comment</i>
                                                  <span style="font-size: 12px;">${story.Post_NumComments || 0}</span>
                                                </span>
                                              </span>
                                            </div>
                                          </div>
                                        `).join('')}
                                      </div>
                                    </div>`;
        relatedStoriesContent.innerHTML = relatedStoriesHtml;
      }

      // Update the parent div style
      const relatedStoriesDiv = tempDiv.querySelector('#related_stories');
      if (relatedStoriesDiv) {
        relatedStoriesDiv.style.cssText = 'display: block; background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;';
        
        // Update the heading style
        const heading = relatedStoriesDiv.querySelector('h2');
        if (heading) {
          heading.style.cssText = 'font-size: 18px; margin-bottom: 15px; color: #333;';
        }
      }
      
      cleanHtml = tempDiv.innerHTML;
    }
    
    return cleanHtml;
  };

  const sparkline = postState.details?.Company_Data?.CoinPrice?.Coin_Sparkline_7d && 
    postState.details.Company_Data.CoinPrice.Coin_Sparkline_7d.length > 1 
    ? postState.details.Company_Data.CoinPrice.Coin_Sparkline_7d 
    : [];
  const sparklineData = sparkline.map(price => ({ value: price }));

  // Add click handler for related stories
  useEffect(() => {
    const handleRelatedStoryClick = async (event) => {
      const storyElement = event.target.closest('.related-story-item');
      if (storyElement) {
        const postId = storyElement.getAttribute('data-post-id');
        if (postId) {
          // Find the related story from the postState
          const relatedStory = postState.details?.Post_RelatedStories?.find(
            story => story.Post_PublicID === postId
          );
          if (relatedStory) {
            try {
              setPostState(prev => ({ ...prev, loading: true, error: null }));
              
              // Fetch the full details of the related story using its ID
              const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPostbyId?Post_PublicID=${postId}`, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              const data = await response.json();
              if (data.status) {
                // Update post state with the full details
                setPostState(prev => ({
                  ...prev,
                  details: data.data,
                  loading: false
                }));
                
                // Reset comment state with the new post's data
                setCommentState(prev => ({
                  ...prev,
                  comments: data.data.Post_Comments || [],
                  replyToId: null,
                  replyText: '',
                  mainCommentText: '',
                  counts: {
                    likes: data.data.Post_NumLikes || 0,
                    dislikes: data.data.Post_NumDislikes || 0,
                    comments: data.data.Post_NumComments || 0
                  }
                }));
              } else {
                setPostState(prev => ({
                  ...prev,
                  error: data.message || 'Failed to fetch post details',
                  loading: false
                }));
              }
            } catch (error) {
              console.error("Error fetching related post details:", error);
              setPostState(prev => ({
                ...prev,
                error: 'An error occurred while fetching post details',
                loading: false
              }));
            }
          }
        }
      }
    };

    // Add click event listener to the modal content
    const modalContent = document.querySelector('.MuiModal-root');
    if (modalContent) {
      modalContent.addEventListener('click', handleRelatedStoryClick);
      return () => {
        modalContent.removeEventListener('click', handleRelatedStoryClick);
      };
    }
  }, [postState.details]);

  return (
    <Modal 
      open={open} 
      onClose={handleModalClose}
      aria-labelledby="post-details-modal"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{ 
        padding: 2, 
        maxWidth: 840, 
        width: '94%', 
        margin: 'auto', 
        top: '50%', 
        left: '50%',
        transform: 'translate(-50%, -50%)', 
        backgroundColor: '#fff', 
        borderRadius: 2, 
        boxShadow: 3, 
        position: 'absolute', 
        maxHeight: '80vh', 
        overflow: 'auto' 
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <IconButton 
            onClick={handleModalClose} 
            sx={{ position: 'absolute', top: 10, right: 10 }}
            aria-label="close modal"
          >
            <AiOutlineClose />
          </IconButton>
        </Box>

        {postState.loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <MDTypography>Loading...</MDTypography>
          </Box>
        ) : postState.error ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <MDTypography color="error">{postState.error}</MDTypography>
          </Box>
        ) : (
          <>
            {/* Post Header with Company/User Info and Sparkline */}
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
              <Box display="flex" alignItems="center">
                <Avatar 
                  sx={{ mr: 2, width: 48, height: 48 }} 
                  alt={postState.details?.Post_CompanyName || post.Post_UserName}
                  src={postState.details?.Post_CompanyLogoURL || post.Post_UserImageURL || placehoderUserImage}
                />
                <MDBox>
                  <MDTypography variant="subtitle1" fontWeight="medium">
                    {postState.details?.Post_CompanyName || post.Post_UserName}
                  </MDTypography>
                  <MDTypography variant="subtitle1" fontSize="12px">
                    {format(new Date(postState.details?.Post_CreatedDate || post.Post_CreatedDate), 'dd MMM yyyy')}
                  </MDTypography>
                </MDBox>
              </Box>

              {/* Sparkline Graph Section */}
              {postState.details?.Post_TypeUserOrCompany === 'rss_news' && 
               postState.details?.Company_Data?.CoinPrice && (
                <Box display="flex" alignItems="center" gap={1}>
                  <Box display="flex" flexDirection="column" alignItems="flex-end">
                    <MDTypography 
                      variant="caption" 
                      color={postState.details.Company_Data.CoinPrice.Coin_PriceChangePercentage_1h >= 0 ? "success" : "error"}
                      fontWeight="medium"
                      display="flex"
                      alignItems="center"
                      fontSize="14px"
                    >
                      {postState.details.Company_Data.CoinPrice.Coin_PriceChangePercentage_1h >= 0 ? '▲' : '▼'}
                      {Math.abs(postState.details.Company_Data.CoinPrice.Coin_PriceChangePercentage_1h).toFixed(2)}%
                    </MDTypography>
                  </Box>
                  {postState.details.Company_Data.CoinPrice.Coin_Sparkline_7d && (
                    <Box sx={{ 
                      width: '140px',
                      height: '40px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '40px',
                      border: '1px solid #e0e0e0',
                      borderRadius: '5px',
                    }}>
                      <Sparkline 
                        data={sparklineData}
                        color={postState.details.Company_Data.CoinPrice.Coin_PriceChangePercentage_1h >= 0 ? "success" : "error"}
                        height={35}
                        width={120}
                      />
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Box mt={2}>
              <Typography variant="h4">{postState.details?.Post_Title || post.Post_Title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {postState.details?.Post_Category || post.Post_Category}
              </Typography>
              {(postState.details?.Post_ImageURL || post.Post_ImageURL) && (
                <Box 
                  component="img" 
                  src={postState.details?.Post_ImageURL || post.Post_ImageURL} 
                  alt={postState.details?.Post_Title || post.Post_Title} 
                  width="100%" 
                  height="260px" 
                  sx={{ objectFit: 'cover', borderRadius: 1 }} 
                />
              )}
              <Box 
                dangerouslySetInnerHTML={{ 
                  __html: sanitizeAndCleanHtml(postState.details?.Post_Text || post.Post_Text || post.Post_Title)
                }}
                sx={{
                  '& #related_stories': {
                    display: 'block !important'
                  },
                  '& #related_stories_content': {
                    '& > div': {
                      padding: '10px',
                      marginBottom: '10px',
                      borderBottom: '1px solid #e0e0e0'
                    },
                    '& .material-icons': {
                      fontSize: '16px',
                      marginRight: '4px',
                      verticalAlign: 'middle'
                    }
                  }
                }}
              />
              {(postState.details?.Post_Link || post.Post_Link) && (
                <Typography variant="body2" color="text.secondary">
                  <a href={postState.details?.Post_Link || post.Post_Link} target="_blank" rel="noopener noreferrer">
                    Read More
                  </a>
                </Typography>
              )}
            </Box>

            {/* Interaction Buttons */}
            <MDBox display="flex" alignItems="center" mt={2}>
              <Box 
                component="button"
                onClick={() => handleInteraction('like')}
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
                <Icon fontSize="small" sx={{ mr: 0.5 }}>thumb_up</Icon>
                <MDTypography variant="button">{commentState.counts.likes}</MDTypography>
              </Box>
              <Box 
                component="button"
                onClick={() => handleInteraction('dislike')}
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
                <MDTypography variant="button">{commentState.counts.dislikes}</MDTypography>
              </Box>
              <Box 
                component="button"
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
                <MDTypography variant="button">{commentState.counts.comments}</MDTypography>
              </Box>
              <Box 
                component="button"
                onClick={() => handleInteraction('share')}
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

            {/* Comments section */}
            {MainCommentInput}
            <Box mt={2}>
              {commentState.comments.map((comment) => (
                <CommentItem 
                  key={comment.PostComment_PublicID} 
                  comment={comment}
                  isReply={false}
                  depth={0}
                />
              ))}
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default PostDetails;