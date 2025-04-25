import React, { useState, useEffect } from 'react';
import api from '../api/config';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Button,
  Grid,
  Avatar,
  CardHeader,
  IconButton
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const REFRESH_INTERVAL = 10000; // Refresh every 10 seconds

const Feed = () => {
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
          userName: user.name,
          timestamp: new Date().getTime() - Math.floor(Math.random() * 1000000) // Simulated timestamp
        }));
        allPosts = [...allPosts, ...userPosts];
      }
      
      // Sort posts by timestamp (newest first)
      return allPosts.sort((a, b) => b.timestamp - a.timestamp);
    } catch (err) {
      throw new Error('Failed to fetch posts');
    }
  };

  const refreshFeed = async () => {
    try {
      setLoading(true);
      setError(null);
      const allPosts = await fetchAllPosts();
      setPosts(allPosts);
    } catch (err) {
      console.error('Error in refreshFeed:', err);
      setError('Failed to refresh feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshFeed();

    // Set up real-time updates
    const interval = setInterval(refreshFeed, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert 
          severity="error" 
          action={
            <Button color="inherit" size="small" onClick={refreshFeed}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Feed
        </Typography>
        <IconButton onClick={refreshFeed} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>
      
      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}
      
      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} key={post.id}>
            <Card>
              <CardHeader
                avatar={
                  <Avatar>
                    {post.userName.charAt(0)}
                  </Avatar>
                }
                title={post.userName}
                subheader={new Date(post.timestamp).toLocaleString()}
              />
              <CardContent>
                <Typography variant="body1">
                  {post.content}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {!loading && posts.length === 0 && (
        <Alert severity="info">
          No posts found.
        </Alert>
      )}
    </Box>
  );
};

export default Feed; 