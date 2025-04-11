import { createContext,  useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // e.g., { name, email, role, token }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
//export const useAuth = () => useContext(AuthContext);
export { AuthContext };

