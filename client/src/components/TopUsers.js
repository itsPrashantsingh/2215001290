import React, { useState, useEffect } from 'react';
import api from '../api/config';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Box,
  Avatar,
  Alert,
  Button
} from '@mui/material';

const TopUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error in fetchTopUsers:', err);
      setError('Failed to fetch top users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
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
            <Button color="inherit" size="small" onClick={fetchTopUsers}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="info">
          No users found.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Top 5 Users by Comment Count
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Rank</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Comment Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <Avatar>{user.name.charAt(0)}</Avatar>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell align="right">{user.commentCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopUsers;
