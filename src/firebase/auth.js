import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { ref, set, serverTimestamp, get } from 'firebase/database';
import { auth, db } from './config';

const googleProvider = new GoogleAuthProvider();

/**
 * Register a new user with email/password.
 * Creates user profile in RTDB under users/{uid}.
 */
export async function registerUser({ email, password, name, phone, college, year }) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  // Write user profile to RTDB
  await set(ref(db, `users/${user.uid}`), {
    name,
    email,
    phone: phone || '',
    college: college || '',
    year: year || '',
    role: 'participant',
    teamId: null,
    lastReadAnnouncements: 0,
    createdAt: Date.now(),
  });

  return user;
}

/**
 * Login with email/password.
 */
export async function loginUser(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

/**
 * Sign in with Google.
 * Creates profile in RTDB if it doesn't exist.
 */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Check if profile exists
  const snapshot = await get(ref(db, `users/${user.uid}`));
  if (!snapshot.exists()) {
    await set(ref(db, `users/${user.uid}`), {
      name: user.displayName || '',
      email: user.email || '',
      phone: '',
      college: '',
      year: '',
      role: 'participant',
      teamId: null,
      lastReadAnnouncements: 0,
      createdAt: Date.now(),
    });
  }

  return user;
}

/**
 * Logout the current user.
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Send password reset email.
 */
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}

/**
 * Map Firebase auth error codes to friendly messages.
 */
export function getAuthErrorMessage(errorCode) {
  const messages = {
    'auth/email-already-in-use': 'This email is already registered. Try logging in.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-credential': 'Invalid credentials. Please check your email and password.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed. Please try again.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  };
  return messages[errorCode] || 'An unexpected error occurred. Please try again.';
}
