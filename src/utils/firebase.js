// Firebase Google Auth
// To enable REAL Google Sign In:
// 1. Go to https://console.firebase.google.com
// 2. Create a project called "prepmate"
// 3. Enable Google sign-in under Authentication > Sign-in method
// 4. Copy your config and replace below
// 5. Add localhost to authorized domains

let auth = null;
let GoogleAuthProvider = null;
let signInWithPopup = null;

const FIREBASE_CONFIG = {
  // REPLACE with your actual Firebase config from console.firebase.google.com
  apiKey: "",
  authDomain: "",
  projectId: "",
};

export async function initFirebase() {
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
    const { getAuth, GoogleAuthProvider: GP, signInWithPopup: SWP } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    if (FIREBASE_CONFIG.apiKey) {
      const app = initializeApp(FIREBASE_CONFIG);
      auth = getAuth(app);
      GoogleAuthProvider = GP;
      signInWithPopup = SWP;
      return true;
    }
    return false;
  } catch(e) {
    console.warn('Firebase not configured:', e);
    return false;
  }
}

export async function signInWithGoogle() {
  if (!auth || !GoogleAuthProvider || !signInWithPopup) {
    // Firebase not configured — return mock user for demo
    return {
      uid: 'demo-' + Date.now(),
      displayName: null, // will prompt for details
      email: null, // will prompt for email
      photoURL: null,
      isNew: true,
    };
  }
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    // Check if new user via metadata
    const isNew = user.metadata.creationTime === user.metadata.lastSignInTime;
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      isNew,
    };
  } catch(e) {
    console.error('Google sign in error:', e);
    throw e;
  }
}

export async function signOut() {
  if (auth) {
    const { signOut: so } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    await so(auth);
  }
}
