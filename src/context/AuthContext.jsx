import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const AuthContext = createContext(null);

const getUserRole = async (userId) => {
  console.log('[Auth][RoleFetch] Start role fetch.');
  console.log(`[Auth][RoleFetch] Auth UID: ${userId}`);
  console.log(`[Auth][RoleFetch] Fetching Firestore doc: users/${userId}`);
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    console.log('[Auth][RoleFetch] Firestore doc not found. Defaulting role to owner.');
    return 'owner';
  }

  const { role } = userDoc.data();
  console.log(`[Auth][RoleFetch] Firestore role value: ${role}`);
  return role === 'admin' ? 'admin' : 'owner';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('owner');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    setPersistence(auth, browserLocalPersistence).catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) {
        return;
      }

      console.log('[Auth][State] Auth state changed.');
      console.log(`[Auth][State] Auth UID: ${currentUser?.uid ?? 'none'}`);
      setUser(currentUser);

      if (currentUser) {
        const fetchedRole = await getUserRole(currentUser.uid);
        if (isMounted) {
          console.log(`[Auth][State] Resolved role: ${fetchedRole}`);
          setRole(fetchedRole);
        }
      } else {
        console.log('[Auth][State] No authenticated user. Defaulting role to owner.');
        setRole('owner');
      }

      setIsReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = (email, password) => {
    console.log('[Auth][Login] Attempting login.');
    console.log(`[Auth][Login] Email: ${email}`);
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => signOut(auth);

  const value = useMemo(
    () => ({
      user,
      role,
      isReady,
      login,
      logout
    }),
    [user, role, isReady]
  );

  if (!isReady) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
