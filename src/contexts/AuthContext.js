import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../services/axiosClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to load current user from API using token
  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error("Failed to load user:", error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    const response = await axiosClient.post('/auth/login', { email, password });
    const { access_token, user: userData } = response.data;
    
    localStorage.setItem('token', access_token);
    setUser({
      ...userData,
      wallet_balance: userData.wallet_balance || 0 // Assuming backend might return it, else loadUser will fetch it
    });
    // Immediately reload to get full profile with wallet if needed
    await loadUser(); 
  };

  const register = async (email, password) => {
    await axiosClient.post('/auth/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshWallet = async () => {
      await loadUser();
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshWallet }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
