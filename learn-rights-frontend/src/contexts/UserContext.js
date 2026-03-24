import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState({});
  const [progress, setProgress] = useState({});
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize userId from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
      } catch (err) {
        console.error('Invalid token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch user data when userId is available
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userRes, progressRes, modulesRes] = await Promise.all([
          axios.get(`/profile/${userId}`),
          axios.get(`/progress/${userId}`),
          axios.get(`/modules/user/${userId}`)
        ]);

        setUser(userRes.data);
        setProgress(progressRes.data);
        setModules(modulesRes.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Function to refresh user data
  const refreshUserData = async () => {
    if (!userId) return;

    try {
      const [userRes, progressRes, modulesRes] = await Promise.all([
        axios.get(`/profile/${userId}`),
        axios.get(`/progress/${userId}`),
        axios.get(`/modules/user/${userId}`)
      ]);

      setUser(userRes.data);
      setProgress(progressRes.data);
      setModules(modulesRes.data);
      console.log('User data refreshed:', {
        user: userRes.data,
        progress: progressRes.data,
        modules: modulesRes.data,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Make refreshUserData available globally for components that need it
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.refreshUserData = refreshUserData;
    }
  }, [userId]);

  // Function to update progress locally (for immediate UI feedback)
  const updateProgressLocally = (newProgress) => {
    setProgress(prevProgress => ({
      ...prevProgress,
      ...newProgress
    }));
  };

  const value = {
    userId,
    user,
    progress,
    modules,
    loading,
    refreshUserData,
    updateProgressLocally
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
