// contexts/AuthContext.js
import { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { logOut } from '@/lib/auth'; // FIXED: Import centralized auth functions

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // FIXED: Enhanced user state management with better error handling
      if (user) {
        // Ensure we have the most up-to-date user information
        setUser({
          ...user,
          displayName: user.displayName || user.email?.split('@')[0] || 'User'
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // FIXED: Added logout function to context for easier access
  const logout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const value = { 
    user, 
    loading,
    logout // FIXED: Provide logout function through context
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};