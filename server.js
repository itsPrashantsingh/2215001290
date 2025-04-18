const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Add logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

app.use(express.json());

// Authentication credentials from environment variables
const AUTH_CREDENTIALS = {
    email: process.env.EMAIL,
    name: process.env.NAME,
    rollNo: process.env.ROLL_NO,
    accessCode: process.env.ACCESS_CODE,
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
};

// Base URL for the evaluation service
const BASE_URL = process.env.BASE_URL;

// Cache for authentication token
let authToken = null;
let tokenExpiry = null;

// Helper function to get authentication token
async function getAuthToken() {
    // Check if we have a valid token
    if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
        console.log('Using cached token');
        return authToken;
    }

    try {
        console.log('Getting new authentication token...');
        console.log('Auth credentials:', AUTH_CREDENTIALS);
        
        const response = await axios.post(`${BASE_URL}/auth`, AUTH_CREDENTIALS);
        console.log('Auth response:', response.data);
        
        authToken = response.data;
        // Set token expiry to 1 hour from now
        tokenExpiry = Date.now() + 3600000;
        return authToken;
    } catch (error) {
        console.error('Authentication error:', {
            message: error.message,
            data: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers
        });
        throw error;
    }
}

// Helper function to fetch data with authentication
async function fetchData(url) {
    try {
        const authData = await getAuthToken();
        
        console.log(`Fetching from external API: ${url}`);
        console.log('Auth token:', {
            type: authData.token_type,
            token: authData.access_token ? '***' : 'missing'
        });

        const response = await axios.get(url, {
            headers: {
                'Authorization': `${authData.token_type} ${authData.access_token}`,
                'Content-Type': 'application/json'
            }
        });
        
        // Validate response data
        if (!response.data) {
            throw new Error('No data received from external API');
        }

        console.log(`External API Response for ${url}:`, {
            status: response.status,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        });

        // Log first item if array
        if (Array.isArray(response.data) && response.data.length > 0) {
            console.log('Sample data item:', response.data[0]);
        }
        
        return response.data;
    } catch (error) {
        console.error(`Error fetching ${url}:`, {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            headers: error.response?.headers
        });
        throw error;
    }
}

// Get all users
app.get('/users', async (req, res) => {
    try {
        console.log('Starting /users endpoint request...');
        const data = await fetchData(`${BASE_URL}/users`);
        
        // Validate the data before sending to client
        if (!Array.isArray(data)) {
            throw new Error('Expected array of users but received different data type');
        }

        console.log(`Sending ${data.length} users to client`);
        res.json(data);
    } catch (error) {
        console.error('Error in /users endpoint:', error);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch users',
            details: error.response?.data || error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get posts for a specific user
app.get('/users/:userId/posts', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`Fetching posts for user ${userId}...`);
        const data = await fetchData(`${BASE_URL}/users/${userId}/posts`);
        console.log('Posts data:', data);
        res.json(data);
    } catch (error) {
        console.error(`Error in /users/${req.params.userId}/posts endpoint:`, error);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch user posts',
            details: error.response?.data || error.message
        });
    }
});

// Get comments for a specific post
app.get('/posts/:postId/comments', async (req, res) => {
    try {
        const { postId } = req.params;
        console.log(`Fetching comments for post ${postId}...`);
        const data = await fetchData(`${BASE_URL}/posts/${postId}/comments`);
        console.log('Comments data:', data);
        res.json(data);
    } catch (error) {
        console.error(`Error in /posts/${req.params.postId}/comments endpoint:`, error);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch post comments',
            details: error.response?.data || error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!',
        message: err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Evaluation service URL: ${BASE_URL}`);
    console.log('Server configuration:', {
        cors: true,
        jsonParser: true,
        port: PORT
    });
}); 