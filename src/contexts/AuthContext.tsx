import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const createOrUpdateUser = async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const userData: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || 'User',
        photoURL: firebaseUser.photoURL || undefined
      };
      await setDoc(userRef, userData);
      return userData;
    }

    return userSnap.data() as User;
  };

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createOrUpdateUser(result.user);
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await createOrUpdateUser(result.user);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, 'users', result.user.uid);
    const userData: User = {
      id: result.user.uid,
      email,
      name
    };
    await setDoc(userRef, userData);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await createOrUpdateUser(firebaseUser);
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
