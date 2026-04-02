// Firebase client SDK — used ONLY for Google OAuth sign-in popup
// The heavy lifting (token verification, user creation) happens on the backend.
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-initialising in Next.js hot-reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Opens the Google sign-in popup and returns a Firebase ID token.
 * Send this token to POST /auth/google to get a LeetFlix JWT.
 */
export async function getGoogleIdToken(): Promise<string> {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user.getIdToken();
}
