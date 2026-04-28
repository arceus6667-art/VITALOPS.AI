// ═══════════════════════════════════════════════════
// VitalOps AI — Auth Context (Firebase Auth + Roles)
// Replaces mock localStorage auth with real Firebase.
// Two roles: 'guest' and 'staff', stored in Firestore.
// ═══════════════════════════════════════════════════

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, serverTimestamp } from '../services/firebase';

export const AuthContext = createContext();

// ─────────────────────────────────────────────
// Custom hook for consuming auth
// ─────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); // 'guest' | 'staff' | null
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // ── Listen to Firebase auth state changes ──
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Read role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setRole(data.role || null);
          } else {
            // User exists in Auth but not Firestore (edge case)
            setRole(null);
          }
        } catch (error) {
          console.warn('[Auth] Failed to read user role:', error.message);
          setRole(null);
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ── Staff login: email + password ──
  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = credential.user;
      setUser(firebaseUser);

      // Read role from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setRole(data.role);
      } else {
        // First-time staff login — create Firestore profile
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.email.split('@')[0] || 'Staff Member',
          role: 'staff',
          staffRole: 'Manager',
          currentZone: 'Lobby & Reception',
          status: 'Available',
          createdAt: serverTimestamp(),
        });
        setRole('staff');
      }

      navigate('/');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Login failed:', error.message);
      return { success: false, error: error.message };
    }
  };

  // ── Guest login: anonymous auth + Firestore profile ──
  const guestLogin = async (name, roomNumber) => {
    try {
      const credential = await signInAnonymously(auth);
      const firebaseUser = credential.user;
      setUser(firebaseUser);

      // Write guest profile to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name: name || 'Guest',
        role: 'guest',
        roomNumber: roomNumber || 'Unknown',
        currentZone: 'Lobby & Reception',
        status: 'Available',
        createdAt: serverTimestamp(),
      });

      setRole('guest');
      navigate('/sos');
      return { success: true };
    } catch (error) {
      console.error('[Auth] Guest login failed:', error.message);
      return { success: false, error: error.message };
    }
  };

  // ── Logout ──
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
      navigate('/login');
    } catch (error) {
      console.error('[Auth] Logout failed:', error.message);
    }
  };

  const PageLoader = () => (
    <div style={{ 
      height: '100vh', width: '100vw', display: 'grid', placeItems: 'center', 
      background: '#050810', color: '#00f3ff', fontFamily: 'monospace' 
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="spin-loader" style={{ 
          width: '40px', height: '40px', border: '3px solid rgba(0,243,255,0.1)', 
          borderTopColor: '#00f3ff', borderRadius: '50%', animation: 'spin 1s linear infinite' 
        }} />
        <span style={{ letterSpacing: '0.2em', fontSize: '0.8rem' }}>INITIALIZING VITAL-OPS...</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, role, loading, login, guestLogin, logout }}>
      {loading ? <PageLoader /> : children}
    </AuthContext.Provider>
  );
}
