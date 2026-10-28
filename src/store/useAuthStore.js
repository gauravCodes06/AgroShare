import { create } from "zustand";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  updateProfile
} from "firebase/auth";
import { ref, set, get } from "firebase/database";
import { auth, db } from "../firebase";

/**
 * Direct exported helper for Email & Password Sign Up
 */
export async function signUpWithEmail({ email, password, name, role = "farmer", village = "", district = "" }) {
  useAuthStore.setState({ isLoading: true });
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    if (name) {
      await updateProfile(fbUser, { displayName: name }).catch(() => {});
    }

    const userProfile = {
      uid: fbUser.uid,
      name: name || email.split("@")[0],
      email: fbUser.email,
      role,
      village,
      district,
      createdAt: new Date().toISOString()
    };

    // Persist to Firebase Realtime Database
    await set(ref(db, `users/${fbUser.uid}`), userProfile);

    useAuthStore.setState({ authUser: fbUser, user: userProfile, isLoading: false });
    return { success: true, user: userProfile };
  } catch (err) {
    useAuthStore.setState({ isLoading: false });
    return { success: false, error: err.message };
  }
}

/**
 * Direct exported helper for Email & Password Sign In
 */
export async function signInWithEmail(email, password) {
  useAuthStore.setState({ isLoading: true });
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = userCredential.user;

    // Retrieve profile from Realtime Database
    const snapshot = await get(ref(db, `users/${fbUser.uid}`));
    let userProfile = null;
    if (snapshot.exists()) {
      userProfile = snapshot.val();
    } else {
      userProfile = {
        uid: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0],
        email: fbUser.email,
        role: "farmer",
        createdAt: new Date().toISOString()
      };
      await set(ref(db, `users/${fbUser.uid}`), userProfile).catch(() => {});
    }

    useAuthStore.setState({ authUser: fbUser, user: userProfile, isLoading: false });
    return { success: true, user: userProfile };
  } catch (err) {
    useAuthStore.setState({ isLoading: false });
    return { success: false, error: err.message };
  }
}

/**
 * Direct exported helper for Sign Out
 */
export async function logout() {
  useAuthStore.setState({ authUser: null, user: null, isLoading: false });
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn("Sign out error", e);
  } finally {
    useAuthStore.setState({ authUser: null, user: null, isLoading: false });
  }
}

const useAuthStore = create((set, getStore) => ({
  authUser: null, // Firebase user object
  user: null,     // Realtime Database profile { uid, name, email, role, village, district, ... }
  isLoading: true,

  setAuthUser: (authUser) => set({ authUser }),
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),

  signUpWithEmail,
  signInWithEmail,
  logout
}));

export default useAuthStore;
