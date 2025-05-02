import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const FollowContext = createContext();

export const FollowProvider = ({ children }) => {
  const [followCounts, setFollowCounts] = useState({ followers: 0, following: 0 });

  const fetchFollowCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/getFollowCounts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setFollowCounts(response.data.data);
    } catch (error) {
      console.error('Error fetching follow counts:', error);
    }
  }, []);

  const updateFollowCounts = useCallback((isFollowing) => {
    setFollowCounts(prev => ({
      ...prev,
      following: prev.following + (isFollowing ? -1 : 1)
    }));
  }, []);

  return (
    <FollowContext.Provider value={{ followCounts, fetchFollowCounts, updateFollowCounts }}>
      {children}
    </FollowContext.Provider>
  );
};

export const useFollow = () => {
  const context = useContext(FollowContext);
  if (!context) {
    throw new Error('useFollow must be used within a FollowProvider');
  }
  return context;
}; 