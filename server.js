const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Request Headers:', req.headers);
    res.on('finish', () => {
        console.log('Response Status:', res.statusCode);
        console.log('Response Headers:', res.getHeaders());
    });
    next();
});

// Environment variables
const AUTH_CREDENTIALS = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

const BASE_URL = process.env.BASE_URL || 'http://20.244.56.144/evaluation-service';

// Cache for auth token
let authToken = null;
let tokenExpiry = null;

// Helper function to get auth token
async function getAuthToken() {
    try {
        // Check if we have a valid cached token
        if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
            return authToken;
        }

        console.log('Fetching new auth token...');
        const response = await axios.post(`${BASE_URL}/auth`, AUTH_CREDENTIALS);

        if (!response.data || !response.data.access_token) {
            throw new Error('Invalid authentication response');
        }

        authToken = response.data.access_token;
        // Set token expiry to 5 minutes before actual expiry
        tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

        return authToken;
    } catch (error) {
        console.error('Authentication error:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw new Error('Failed to authenticate with the service');
    }
}

// Helper function to fetch data from API
async function fetchData(endpoint) {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${BASE_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log(`Raw data from external API ${endpoint}:`, response.data);

        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
}

// Helper function to normalize response data
function normalizeData(data, type) {
    console.log(`Normalizing data for type ${type}:`, data);

    if (Array.isArray(data)) {
        return data;
    }

    switch (type) {
        case 'users':
            if (data && data.users) {
                return Object.entries(data.users).map(([id, name]) => ({
                    id: parseInt(id),
                    name
                })).sort((a, b) => a.id - b.id);
            }
            break;
        case 'posts':
            // Posts endpoint returns array directly, so just return data if array
            if (Array.isArray(data)) {
                return data;
            }
            break;
        case 'comments':
            // Comments endpoint returns array directly, so just return data if array
            if (Array.isArray(data)) {
                return data;
            }
            break;
    }

    throw new Error(`Invalid ${type} data format`);
}

// Get all users
app.get('/users', async (req, res) => {
    try {
        const data = await fetchData('/users');
        const normalizedData = normalizeData(data, 'users');
        res.json(normalizedData);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        if (error.response && error.response.status === 403) {
            res.status(502).json({ error: 'External API returned 403 Forbidden' });
        } else {
            res.status(500).json({ error: 'Failed to fetch users' });
        }
    }
});

// Get posts for a user
app.get('/users/:userId/posts', async (req, res) => {
    try {
        const { userId } = req.params;
        const data = await fetchData(`/users/${userId}/posts`);
        const normalizedData = normalizeData(data, 'posts');
        res.json(normalizedData);
    } catch (error) {
        console.error(`Error in /users/${req.params.userId}/posts endpoint:`, error);
        res.status(500).json({ error: 'Failed to fetch user posts' });
    }
});

// Get comments for a post
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        const data = await fetchData(`/posts/${postId}/comments`);
        const normalizedData = normalizeData(data, 'comments');
        res.json(normalizedData);
    } catch (error) {
        console.error(`Error in /posts/${req.params.postId}/comments endpoint:`, error);
        res.status(500).json({ error: 'Failed to fetch post comments' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Internal server error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 