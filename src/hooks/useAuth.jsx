import { useState, useEffect, createContext, useContext } from 'react';
import { devUsers } from '../lib/devUsers';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email, password) => {
    const devUser = devUsers[email];
    if (devUser) {
      const userData = { ...devUser, email };
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
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
    // Default to manager for google dev login
    const devUser = devUsers['anamalagirisha@gmail.com'];
    localStorage.setItem('user', JSON.stringify(devUser));
    setUser(devUser);
    return { user: devUser };
  };

  const signOut = async () => {
    localStorage.removeItem('user');
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
