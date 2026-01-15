import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

const client = axios.create({
    baseURL: API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL,  // Remove trailing slash
    headers: {
        'Content-Type': 'application/json',
    },
    validateStatus: function (status) {
        return status < 500; // Don't throw on 4xx errors
    },
});

// Add a request interceptor to include the token
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default client;
