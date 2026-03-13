'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';

/** Initiate anonymous sign-in (Properly Awaited). */
export async function initiateAnonymousSignIn(authInstance: Auth): Promise<User | void> {
  try {
    const result = await signInAnonymously(authInstance);
    return result.user;
  } catch (error) {
    console.error("Anonymous sign-in error:", error);
  }
}

/** Initiate email/password sign-up (Properly Awaited). */
export async function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<User | void> {
  try {
    const result = await createUserWithEmailAndPassword(authInstance, email, password);
    return result.user;
  } catch (error) {
    console.error("Email sign-up error:", error);
    throw error;
  }
}

/** Initiate email/password sign-in (Properly Awaited). */
export async function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<User | void> {
  try {
    const result = await signInWithEmailAndPassword(authInstance, email, password);
    return result.user;
  } catch (error) {
    console.error("Email sign-in error:", error);
    throw error;
  }
}

/** Initiate Google sign-in (Properly Awaited). */
export async function initiateGoogleSignIn(authInstance: Auth): Promise<User | void> {
  const provider = new GoogleAuthProvider();
  
  // We MUST use await here. Without it, the popup is orphaned and 
  // Firebase cancels the request, leading to your Error 400 or Cancelled error.
  try {
    const result = await signInWithPopup(authInstance, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("User closed the login popup.");
    } else {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }
}