import React, { createContext, useState, useContext } from 'react';
import { authService } from '../services/auth.service';
import { channelService } from '../services/channel.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const updateUser = (userData) => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      if (response.user) {
        updateUser(response.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await authService.signup(userData);
      if (response.token) {
        updateUser(response.user);
        return { success: true };
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Signup failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    authService.logout();
  };

  const createUserChannel = async (channelData) => {
    try {
      // First check if user already has a channel
      if (user?.channelId) {
        return {
          success: true,
          channel: { _id: user.channelId },
          message: 'User already has a channel'
        };
      }

      const response = await channelService.createChannel(channelData);
      
      if (response.success && response.channel) {
        const updatedUser = { 
          ...user, 
          channelId: response.channel._id 
        };
        updateUser(updatedUser);
        return { 
          success: true, 
          channel: response.channel 
        };
      }
      
      return {
        success: false,
        error: 'Failed to create channel'
      };
    } catch (error) {
      console.error('Channel creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create channel'
      };
    }
  };

  const hasChannel = () => {
    return Boolean(user?.channelId);
  };

  const contextValue = {
    user,
    login,
    signup,
    logout,
    createUserChannel,
    hasChannel,
    updateUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
