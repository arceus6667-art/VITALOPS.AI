// ═══════════════════════════════════════════════════
// VitalOps AI — Alert Context (Firestore Real-time)
// Replaces mock alert state with live Firestore listener
// on the incidents collection.
// ═══════════════════════════════════════════════════

import React, { createContext, useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
} from 'firebase/firestore';
import { db, serverTimestamp } from '../services/firebase';

export const AlertContext = createContext();

// ─────────────────────────────────────────────
// Helper: format Firestore timestamp to display string
// ─────────────────────────────────────────────
function formatAlertTime(firestoreTimestamp) {
  if (!firestoreTimestamp) return 'Just now';

  const date = firestoreTimestamp.toDate ? firestoreTimestamp.toDate() : new Date(firestoreTimestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString();
}

// ─────────────────────────────────────────────
// Helper: check if timestamp is from today
// ─────────────────────────────────────────────
function isToday(firestoreTimestamp) {
  if (!firestoreTimestamp) return true;
  const date = firestoreTimestamp.toDate ? firestoreTimestamp.toDate() : new Date(firestoreTimestamp);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

// ─────────────────────────────────────────────
// Helper: get display title from incident type + zone
// ─────────────────────────────────────────────
const TYPE_LABELS = {
  fire: '🔥 Fire Emergency',
  medical: '🏥 Medical Emergency',
  security: '🚨 Security Alert',
  flood: '💧 Flood / Water Leak',
  other: '⚠️ Incident Report',
};

function getAlertTitle(type, zone) {
  const label = TYPE_LABELS[type] || TYPE_LABELS.other;
  return `${label} at ${zone || 'Unknown Zone'}`;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
export function AlertProvider({ children }) {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const [hasMarkedRead, setHasMarkedRead] = useState(false);

  // ── Firestore real-time listener ──
  useEffect(() => {
    const alertsQuery = query(
      collection(db, 'incidents'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      alertsQuery,
      (snapshot) => {
        const mapped = snapshot.docs.map((d) => {
          const data = d.data();
          // Map severity: 'high' → 'critical' for display consistency
          let displaySeverity = data.severity || 'medium';
          if (displaySeverity === 'high') displaySeverity = 'critical';

          return {
            id: d.id,
            title: getAlertTitle(data.type, data.zone),
            severity: displaySeverity,
            zone: data.zone || 'Unknown',
            time: formatAlertTime(data.createdAt),
            suggestion: data.geminiClassification?.response || 'Assessing situation...',
            status: data.status || 'active',
            date: isToday(data.createdAt) ? 'Live' : 'Earlier',
            // Preserve raw fields for detail views
            type: data.type,
            description: data.description || '',
            assignedStaff: data.assignedStaff || [],
            geminiClassification: data.geminiClassification || null,
            geminiSummary: data.geminiSummary || '',
            reportedBy: data.reportedBy || '',
            guestRoom: data.guestRoom || '',
            createdAt: data.createdAt,
            resolvedAt: data.resolvedAt || null,
          };
        });

        setAlerts(mapped);

        // Update unread count (only active/in-progress that haven't been read)
        if (!hasMarkedRead) {
          const activeCount = mapped.filter(
            (a) => a.status !== 'resolved' && !dismissedIds.has(a.id)
          ).length;
          setUnreadCount(activeCount);
        }
      },
      (error) => {
        console.warn('[Alerts] Listener error:', error.message);
      }
    );

    // Cleanup listener
    return () => unsubscribe();
  }, [dismissedIds, hasMarkedRead]);

  // ── Add new incident to Firestore ──
  const addAlert = useCallback(async (reportData) => {
    try {
      const incidentDoc = {
        type: reportData.type || 'other',
        severity: reportData.severity || 'medium',
        zone: reportData.zone || 'Unknown',
        reportedBy: reportData.reportedBy || '',
        guestRoom: reportData.guestRoom || '',
        description: reportData.description || '',
        voiceTranscript: reportData.voiceTranscript || '',
        geminiClassification: reportData.geminiClassification || null,
        assignedStaff: [],
        status: 'active',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'incidents'), incidentDoc);
      // Reset read state so new alert shows as unread
      setHasMarkedRead(false);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('[Alerts] addAlert failed:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // ── Dismiss alert (local UI only — doesn't delete from Firestore) ──
  const dismissAlert = useCallback((id) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  // ── Mark all as read (local UI toggle) ──
  const markAllRead = useCallback(() => {
    setUnreadCount(0);
    setHasMarkedRead(true);
  }, []);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        addAlert,
        dismissAlert,
        markAllRead,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}
