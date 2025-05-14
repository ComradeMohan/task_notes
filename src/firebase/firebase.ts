import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD3VTloZLaE_vOipufcpaIiDKUdZjxzA0c",
  authDomain: "enrollmentalert-4ce89.firebaseapp.com",
  projectId: "enrollmentalert-4ce89",
  storageBucket: "enrollmentalert-4ce89.firebasestorage.app",
  messagingSenderId: "347030161904",
  appId: "1:347030161904:web:9338b27989bbe36553f535",
  measurementId: "G-KL4FMCJ9W3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;