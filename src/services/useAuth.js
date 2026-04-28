import { useCallback, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setPersistence(auth, browserLocalPersistence).catch((persistenceError) => {
      if (active) {
        setError(persistenceError.message);
      }
    });

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (!active) {
          return;
        }
        setUser(nextUser);
        setLoading(false);
      },
      (authError) => {
        if (!active) {
          return;
        }
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const clearError = useCallback(() => {
    setError("");
  }, []);

  const register = useCallback(async (email, password) => {
    setError("");
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth);
  }, []);

  const login = useCallback(async (email, password) => {
    setError("");
    await signInWithEmailAndPassword(auth, email, password);
  }, []);

  const logout = useCallback(async () => {
    setError("");
    await signOut(auth);
  }, []);

  return {
    user,
    loading,
    error,
    clearError,
    register,
    login,
    logout,
  };
}
