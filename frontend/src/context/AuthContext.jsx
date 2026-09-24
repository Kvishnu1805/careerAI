import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('careerai_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('careerai_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch updated profile only on initial app mount if an existing token was stored
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('careerai_token');
      if (storedToken) {
        try {
          const res = await api.get('/profile');
          setUser(res.data);
          localStorage.setItem('careerai_user', JSON.stringify(res.data));
        } catch (err) {
          console.warn('Session expired or could not fetch profile:', err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('careerai_token', access_token);
    localStorage.setItem('careerai_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password, target_role, skills = []) => {
    const res = await api.post('/auth/register', {
      name,
      email,
      password,
      target_role,
      skills,
    });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('careerai_token', access_token);
    localStorage.setItem('careerai_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('careerai_token');
    localStorage.removeItem('careerai_user');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('careerai_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

