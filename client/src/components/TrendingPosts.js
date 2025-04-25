import React, { useState, useEffect } from 'react';
import api from '../api/config';
import {
  Paper,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Button,
  Grid,
  Chip
} from '@mui/material';
import CommentIcon from '@mui/icons-material/Comment';

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAllPosts = async () => {
    try {
      const response = await api.get('/users');
      const users = response.data;
      let allPosts = [];
      
      for (const user of users) {
        const postsResponse = await api.get(`/users/${user.id}/posts`);
        const userPosts = postsResponse.data.map(post => ({
          ...post,
          userName: user.name
        }));
        allPosts = [...allPosts, ...userPosts];
      }
      
      return allPosts;
    } catch (err) {
      throw new Error('Failed to fetch posts');
    }
  };

  const fetchPostComments = async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data.length;
    } catch (err) {
      console.error(`Error fetching comments for post ${postId}:`, err);
      return 0;
    }
  };

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all posts
      const allPosts = await fetchAllPosts();
      
      // Fetch comment counts for each post
      const postsWithComments = await Promise.all(
        allPosts.map(async (post) => ({
          ...post,
          commentCount: await fetchPostComments(post.id)
        }))
      );
      
      // Sort by comment count and get posts with maximum comments
      const sortedPosts = postsWithComments.sort((a, b) => b.commentCount - a.commentCount);
      const maxComments = sortedPosts[0]?.commentCount || 0;
      const trendingPosts = sortedPosts.filter(post => post.commentCount === maxComments);
      
      setPosts(trendingPosts);
    } catch (err) {
      console.error('Error in fetchTrendingPosts:', err);
      setError('Failed to fetch trending posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingPosts();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={fetchTrendingPosts}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          No trending posts found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Trending Posts
      </Typography>
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.content}
                </Typography>
                <Typography color="textSecondary" gutterBottom>
                  Posted by {post.userName}
                </Typography>
                <Box display="flex" alignItems="center" mt={1}>
                  <Chip
                    icon={<CommentIcon />}
                    label={`${post.commentCount} comments`}
                    color="primary"
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default TrendingPosts; 