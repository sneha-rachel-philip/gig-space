import { useContext } from 'react';
import { AuthContext } from './AuthContext'; // Import the context

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);