import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
    // Removed withCredentials: true to avoid CORS credential issues
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        console.log(`Making API request to: ${config.url}`);
        // Add timestamp to prevent caching
        config.params = {
            ...config.params,
            _t: Date.now()
        };
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        console.log(`API Response from ${response.config.url}:`, {
            status: response.status,
            dataType: typeof response.data,
            isArray: Array.isArray(response.data),
            dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
        });
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // If the error is due to network issues, retry the request
        if (!error.response && error.request) {
            console.error('Network Error:', {
                message: error.message,
                url: originalRequest.url
            });
            // Retry logic
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                return api(originalRequest);
            }
        }

        if (error.response) {
            // Handle specific error codes
            switch (error.response.status) {
                case 401:
                    console.error('Authentication Error:', {
                        message: error.response.data?.error,
                        details: error.response.data?.details
                    });
                    break;
                case 403:
                    console.error('Forbidden:', {
                        message: error.response.data?.error,
                        details: error.response.data?.details
                    });
                    break;
                case 404:
                    console.error('Not Found:', {
                        message: error.response.data?.error,
                        details: error.response.data?.details
                    });
                    break;
                case 500:
                    console.error('Server Error:', {
                        message: error.response.data?.error,
                        details: error.response.data?.details
                    });
                    break;
                default:
                    console.error('API Error:', {
                        status: error.response.status,
                        message: error.response.data?.error,
                        details: error.response.data?.details
                    });
            }
        }

        return Promise.reject(error);
    }
);

export default api;
