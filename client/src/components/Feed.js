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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

const API_BASE_URL = 'http://localhost:5000';

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
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
        if (response.data.length > 0) {
          setSelectedPost(response.data[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedUser]);

  useEffect(() => {
    const fetchComments = async () => {
      if (!selectedPost) return;

      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/posts/${selectedPost}/comments`);
        setComments(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch comments');
        setLoading(false);
      }
    };

    fetchComments();
  }, [selectedPost]);

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
        Comments
      </Typography>
      <Box mb={3}>
        <FormControl fullWidth>
          <InputLabel>Select Post</InputLabel>
          <Select
            value={selectedPost || ''}
            onChange={(e) => setSelectedPost(e.target.value)}
            label="Select Post"
          >
            {posts.map((post) => (
              <MenuItem key={post.id} value={post.id}>
                {post.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Paper>
        <List>
          {comments.map((comment, index) => (
            <React.Fragment key={comment.id}>
              <ListItem>
                <ListItemText
                  primary={comment.name}
                  secondary={comment.body}
                />
              </ListItem>
              {index < comments.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default Feed; 