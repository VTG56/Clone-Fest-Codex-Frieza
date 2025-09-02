// lib/auth.js
import { auth, db } from './firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile // FIXED: Added missing import
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// FIXED: Centralized Google provider configuration
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Sign Up Function - FIXED: Now properly updates user profile
export const signUp = async (email, password, username) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // FIXED: Update the user's display name immediately after account creation
    if (auth.currentUser) {
  await updateProfile(auth.currentUser, {
    displayName: editForm.displayName
  });
}


    // Create a user document in Firestore with proper user data
    await setDoc(doc(db, 'users', user.uid), {
      username: username,
      email: user.email,
      uid: user.uid,
      joinDate: new Date().toISOString(),
      bio: '',
      avatar: `https://api.dicebear.com/8.x/bottts/svg?seed=${username}`,
      displayName: username // FIXED: Ensure displayName is stored
    });

    // FIXED: Reload user to get updated profile
    await user.reload();
    
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign In Function
export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// FIXED: New Google Sign-In function - modularized and reusable
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Check if user document exists, create if not
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        username: user.displayName || 'Google User',
        email: user.email,
        uid: user.uid,
        joinDate: new Date().toISOString(),
        bio: '',
        avatar: user.photoURL || `https://api.dicebear.com/8.x/bottts/svg?seed=${user.uid}`,
        displayName: user.displayName || 'Google User'
      });
    }
    
    return user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// Sign Out Function
export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// FIXED: New utility function to get authentication error messages
export const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account already exists with this email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/too-many-requests':
      return 'Too many requests. Please try again later.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked. Please enable popups and try again.';
    case 'auth/cancelled-popup-request':
      return 'Sign-in was cancelled. Please try again.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with this email using a different sign-in method.';
    default:
      return error.message || 'An unexpected error occurred. Please try again.';
  }
};