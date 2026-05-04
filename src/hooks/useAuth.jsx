import { useState, useEffect, createContext, useContext } from 'react';
import { devUsers } from '../lib/devUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize synchronously from sessionStorage to prevent flash redirect on refresh
  const [user, setUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser = sessionStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email, password) => {
    const devUser = devUsers[email];
    if (devUser) {
      // Reset session before setting new user — prevent cross-user contamination
      sessionStorage.removeItem('user');
      const userData = { ...devUser, email };
      sessionStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      console.log("ACTIVE SESSION:", userData);
      return { user: userData };
    } else {
      throw new Error('User not found in Dev Auth system');
    }
  };

  const signUpWithEmail = async (email, password) => {
    // For Dev Auth, Sign Up just logs them in if they exist, or throws error
    return signInWithEmail(email, password);
  };

  const signInWithGoogle = async () => {
    // Reset session before setting new user
    sessionStorage.removeItem('user');
    // Default to manager for google dev login
    const devUser = devUsers['anamalagirisha@gmail.com'];
    const userData = { ...devUser, email: 'anamalagirisha@gmail.com' };
    sessionStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    console.log("ACTIVE SESSION:", userData);
    return { user: userData };
  };

  const signOut = async () => {
    sessionStorage.removeItem('user');
    setUser(null);
  };

  const saveUserRole = async (userId, role) => {
    // No-op in Dev Auth, roles are static in devUsers.js
    console.log('Dev Auth: role mapping handled via devUsers.js');
  };

  const saveProfile = async (userId, email) => {
    // No-op in Dev Auth
    console.log('Dev Auth: profile mapping handled via devUsers.js');
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    saveUserRole,
    saveProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
