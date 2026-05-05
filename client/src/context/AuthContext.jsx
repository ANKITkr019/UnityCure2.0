import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on app start
  useEffect(() => {
    const token = localStorage.getItem('uc_token');
    const savedUser = localStorage.getItem('uc_user');
    const savedRole = localStorage.getItem('uc_role');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  const login = (token, userData, userRole) => {
    localStorage.setItem('uc_token', token);
    localStorage.setItem('uc_user', JSON.stringify(userData));
    localStorage.setItem('uc_role', userRole);
    setUser(userData);
    setRole(userRole);
  };

  const logout = () => {
    localStorage.removeItem('uc_token');
    localStorage.removeItem('uc_user');
    localStorage.removeItem('uc_role');
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);