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

  const fetchTrendingPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/posts?type=popular');
      setPosts(response.data);
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