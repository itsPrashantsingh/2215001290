import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Divider,
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

const TrendingPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        if (response.data.length > 0) {
          setSelectedUser(response.data[0].id);
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch users');
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchPosts = async () => {
      if (!selectedUser) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/users/${selectedUser}/posts`);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedUser]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Posts
      </Typography>
      <Paper>
        <List>
          {posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <ListItem>
                <ListItemText
                  primary={post.title}
                  secondary={post.body}
                />
              </ListItem>
              {index < posts.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default TrendingPosts; 