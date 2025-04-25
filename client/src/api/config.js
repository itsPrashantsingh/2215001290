import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:8080', // Match the server port
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add a request interceptor for logging
api.interceptors.request.use(
    (config) => {
        console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            // Handle specific error codes
            switch (error.response.status) {
                case 400:
                    console.error('Bad Request:', error.response.data?.error);
                    break;
                case 500:
                    console.error('Server Error:', error.response.data?.error);
                    break;
                default:
                    console.error('API Error:', error.response.data?.error);
            }
        } else {
            console.error('Network Error:', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
