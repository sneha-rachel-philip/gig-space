/* import { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // e.g., { name, email, role, token }
 // console.log('AuthProvider user:', user); // Debugging line

  
  useEffect(() => {
    // Try to load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user)); // Keep in sync
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
//export const useAuth = () => useContext(AuthContext);
export { AuthContext };

 */
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading from storage (localStorage/session/cookies etc)
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setCurrentUser(storedUser);
      setUserRole(storedUser.role);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Example userData: { name: 'John', role: 'client' }
    setCurrentUser(userData);
    setUserRole(userData.role);
    setLoading(false);

    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Clear React state
    setCurrentUser(null);
    setUserRole(null);
    setLoading(false);
  
    // Clear all authentication-related items from localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Add this - important!
    localStorage.removeItem('jwt');   // Add this if you use this key
    
    // Redirect to login or home page if needed
    // navigate('/login');
  };

  const value = {
    currentUser,
    userRole,
    isAuthenticated: !!currentUser,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
