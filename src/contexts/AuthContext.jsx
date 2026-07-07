import { createContext, useContext, useEffect, useState } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  subscribeToAuthChanges,
  resetPassword,
} from '../firebase/auth.service';
import { getUserProfile } from '../firebase/firestore.service';
import { logActivity } from '../firebase/activityLog.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(async (user) => {
      setCurrentUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = async (fullName, email, password) => {
    const user = await registerUser({ fullName, email, password });
    const profile = await getUserProfile(user.uid);
    setUserProfile(profile);
    logActivity({
      actorId: user.uid,
      actorRole: 'user',
      actorName: fullName,
      actorEmail: email,
      action: 'Created account',
    });
    return user;
  };

  const login = async (email, password) => {
    const user = await loginUser({ email, password });
    const profile = await getUserProfile(user.uid);
    logActivity({
      actorId: user.uid,
      actorRole: profile?.role || 'user',
      actorName: profile?.fullName || 'Unknown',
      actorEmail: profile?.email || email,
      action: 'Logged in',
    });
    return user;
  };

  const logout = async () => logoutUser();
  const forgotPassword = async (email) => resetPassword(email);

  const refreshProfile = async () => {
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      setUserProfile(profile);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    register,
    login,
    logout,
    forgotPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}