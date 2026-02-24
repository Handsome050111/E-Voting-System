import axios from 'axios';

// Use environment variable for API URL in production, or fallback to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Helper for image/static paths (without /api suffix)
export const getBaseURL = () => {
    if (API_BASE_URL.startsWith('http')) {
        const url = new URL(API_BASE_URL);
        return `${url.protocol}//${url.host}`;
    }
    return window.location.origin;
};

export default api;
