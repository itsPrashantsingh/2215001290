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

  const validateUserData = (data) => {
    if (!Array.isArray(data)) {
      throw new Error('Expected array of users but received different data type');
    }

    // Validate each user object
    return data.map(user => ({
      id: user.id || 'N/A',
      name: user.name || 'Unknown',
      email: user.email || 'N/A',
      rollNo: user.rollNo || 'N/A'
    }));
  };

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching users from API...');
      
      const response = await api.get('/users');
      console.log('Raw API response:', response.data);
      
      const validatedData = validateUserData(response.data);
      console.log('Validated user data:', validatedData);
      
      setUsers(validatedData);
    } catch (err) {
      console.error('Error in fetchTopUsers:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      setError(err.response?.data?.error || 'Failed to fetch top users');
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
        Users ({users.length})
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roll Number</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <Avatar>{user.name.charAt(0)}</Avatar>
                </TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.rollNo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TopUsers; 