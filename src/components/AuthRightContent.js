import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import NewsPost from 'components/NewsPost';
import { useNotification } from "../context/NotificationContext";

const ContentPreview = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const fetchNewsPosts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/posts/getPosts?page=1&limit=3`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status) {
        setPosts(data.data.posts);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching news posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsPosts();
  }, []);

  const handleInteraction = async (action, postId) => {
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
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box>
      {posts.map((post) => (
        <Box 
          key={post.Post_PublicID} 
          className="lc-postCard my-20" 
          sx={{ 
            mb: 2, 
            border: '1px solid #fff', 
            borderRadius: '8px', 
            backgroundColor: "#fff",
            overflow: "hidden"
          }}
        >
          <NewsPost post={post} onInteraction={handleInteraction} />
        </Box>
      ))}
    </Box>
  );
};

export default ContentPreview; 