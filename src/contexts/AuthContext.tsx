import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import toast from 'react-hot-toast';

interface AuthContextProps {
  currentUser: User | null;
  isFirstTimeUser: boolean;
  setIsFirstTimeUser: React.Dispatch<React.SetStateAction<boolean>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  async function signup(email: string, password: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    // Create a user document in Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: email,
      createdAt: new Date().toISOString(),
      firstLogin: true,
      emailVerified: false
    });
    
    toast.success('Verification email sent! Please check your inbox.');
    setIsFirstTimeUser(true);
    return userCredential.user;
  }

  async function login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    if (!userCredential.user.emailVerified) {
      throw new Error('Please verify your email before logging in.');
    }
    
    // Check if this is the first login
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    const userData = userDoc.data();
    
    if (userData && userData.firstLogin) {
      setIsFirstTimeUser(true);
      // Update the firstLogin flag
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        ...userData,
        firstLogin: false
      }, { merge: true });
    } else {
      setIsFirstTimeUser(false);
    }
    
    return userCredential.user;
  }

  async function resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  function logout() {
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    isFirstTimeUser,
    setIsFirstTimeUser,
    loading,
    login,
    signup,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}