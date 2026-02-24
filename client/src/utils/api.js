import axios from 'axios';

// Use environment variable for API URL in production, or fallback to localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Helper for image/static paths (without /api suffix)
export const getBaseURL = () => {
    const url = new URL(API_BASE_URL);
    return `${url.protocol}//${url.host}`;
};

export default api;
