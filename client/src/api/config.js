import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8080', 
    headers: {
        'Content-Type': 'application/json',
        timeout: 10000,
        'Accept': 'application/json'
    }
});

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
           
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
