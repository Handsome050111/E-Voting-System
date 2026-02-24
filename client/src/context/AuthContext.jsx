import { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            checkUserLoggedIn(token);
        } else {
            setLoading(false);
        }
    }, []);

    const checkUserLoggedIn = async (token) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };
            const res = await api.get('/auth/me', config);
            setUser({ ...res.data, token });
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', {
                email,
                password,
            });
            localStorage.setItem('token', res.data.token);
            setUser(res.data);
            return res.data;
        } catch (error) {
            // Rethrow so the component can handle it (e.g., checking if verification is needed)
            throw error;
        }
    };

    const register = async (name, email, password, role) => {
        const res = await api.post('/auth/register', {
            name,
            email,
            password,
            role,
        });
        // Don't log in yet - user needs to verify OTP
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
