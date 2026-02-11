import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    // Set axios default header
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            fetchUserInfo();
        } else {
            delete axios.defaults.headers.common['Authorization'];
            setLoading(false);
        }
    }, [token]);

    const fetchUserInfo = async () => {
        try {
            const response = await axios.get('http://localhost:8090/api/auth/me');
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch user info:', error);
            logout();
        } finally {
            setLoading(false);
        }
    };

    const login = async (emailOrMobile, password) => {
        try {
            const response = await axios.post('http://localhost:8090/api/auth/login', {
                emailOrMobile,
                password
            });
            const { token: newToken, ...userData } = response.data;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed. Please try again.'
            };
        }
    };

    const signup = async (name, email, mobileNumber, password, confirmPassword) => {
        try {
            const response = await axios.post('http://localhost:8090/api/auth/signup', {
                name,
                email,
                mobileNumber,
                password,
                confirmPassword
            });
            const { token: newToken, ...userData } = response.data;
            setToken(newToken);
            localStorage.setItem('token', newToken);
            setUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Signup failed. Please try again.'
            };
        }
    };

    const logout = () => {
        // Clear all auth state
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        sessionStorage.clear(); // Clear any session data
        delete axios.defaults.headers.common['Authorization'];
        setLoading(false);
    };

    const value = {
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated: !!token && !!user
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
