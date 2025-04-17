import { createContext, useState, useEffect } from 'react';

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

