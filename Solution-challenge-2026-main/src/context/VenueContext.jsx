// ═══════════════════════════════════════════════════
// VitalOps AI — Venue Context
// Real-time Firestore synchronization (Stable Hackathon Edition)
// No composite indices required. In-memory filtering for safety.
// ═══════════════════════════════════════════════════

import React, { createContext, useState, useContext, useMemo, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  query,
} from 'firebase/firestore';
import { db, serverTimestamp } from '../services/firebase';
import { summarizeIncident } from '../services/gemini';
import { translations } from '../data/translations';

const VenueContext = createContext();

export function VenueProvider({ children }) {
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [visibleFloors, setVisibleFloors] = useState(new Set([0, 1, 2, 3, 4]));
  const [viewMode, setViewMode] = useState('stacked'); 
  const [liveMode, setLiveMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [hoveredRoom, setHoveredRoom] = useState(null);

  // Core Data State
  const [rawIncidents, setRawIncidents] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [roomStats, setRoomStats] = useState({});

  // ── 1. Derived State (In-memory filtering avoids Index errors) ──
  const activeIncidents = useMemo(() => {
    return rawIncidents
      .filter(i => i.status !== 'resolved')
      .sort((a, b) => {
        const timeA = a.createdAt?.getTime ? a.createdAt.getTime() : 0;
        const timeB = b.createdAt?.getTime ? b.createdAt.getTime() : 0;
        return timeB - timeA;
      });
  }, [rawIncidents]);

  const allStaff = useMemo(() => {
    return rawUsers.filter(u => u.role === 'staff');
  }, [rawUsers]);

  const t = useMemo(() => (key) => {
    const lang = translations[language] || translations['en'];
    return lang[key] || key;
  }, [language]);

  // ── 2. Sync Logic ──
  useEffect(() => {
    // Single listener for all incidents (safer for indices)
    const unsubIncidents = onSnapshot(collection(db, 'incidents'), (snapshot) => {
      const data = snapshot.docs.map(d => {
        const item = d.data();
        let createdAt = new Date();
        if (item.createdAt?.toDate) createdAt = item.createdAt.toDate();
        else if (item.createdAt) createdAt = new Date(item.createdAt);
        return { id: d.id, ...item, createdAt };
      });
      setRawIncidents(data);
    }, (err) => console.warn('[Venue] Incidents sync error:', err.message));

    // Single listener for all users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setRawUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn('[Venue] Users sync error:', err.message));

    // Inventory
    const unsubInventory = onSnapshot(collection(db, 'inventory'), (snapshot) => {
      setInventory(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn('[Venue] Inventory sync error:', err.message));

    // Rooms (optional, for 3D view stats)
    const unsubRooms = onSnapshot(collection(db, 'rooms'), (snapshot) => {
      const stats = {};
      snapshot.docs.forEach(d => {
        stats[d.id] = { id: d.id, ...d.data() };
      });
      setRoomStats(stats);
    }, (err) => console.warn('[Venue] Rooms sync error:', err.message));

    return () => {
      unsubIncidents(); unsubUsers(); unsubInventory(); unsubRooms();
    };
  }, []);

  const getRoomStats = useCallback((roomId) => {
    if (roomStats[roomId]) return roomStats[roomId];
    return {
      occupancy: 0,
      capacity: 50,
      status: 'available',
      activeIncidents: activeIncidents.filter(i => i.zoneId === roomId || i.zone === roomId).length,
      staffOnSite: allStaff.filter(s => s.currentZoneId === roomId || s.currentZone === roomId).length,
    };
  }, [roomStats, activeIncidents, allStaff]);

  const toggleFloorVisibility = useCallback((floorLevel) => {
    setVisibleFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floorLevel)) next.delete(floorLevel);
      else next.add(floorLevel);
      return next;
    });
  }, []);

  const focusFloor = useCallback((floorLevel) => {
    if (selectedFloor === floorLevel) {
      setSelectedFloor(null);
      setVisibleFloors(new Set([0, 1, 2, 3, 4]));
    } else {
      setSelectedFloor(floorLevel);
      setVisibleFloors(new Set([floorLevel]));
    }
  }, [selectedFloor]);

  const resetView = useCallback(() => {
    setSelectedFloor(null);
    setSelectedRoom(null);
    setVisibleFloors(new Set([0, 1, 2, 3, 4]));
    setViewMode('stacked');
  }, []);

  const dispatchStaff = useCallback(async (incidentId, staffId) => {
    try {
      await updateDoc(doc(db, 'incidents', incidentId), {
        assignedStaff: arrayUnion(staffId),
        status: 'in-progress',
      });
      await updateDoc(doc(db, 'users', staffId), {
        status: 'Deployed',
      });
      return { success: true };
    } catch (error) {
      console.error('[Venue] dispatchStaff failed:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  const resolveIncident = useCallback(async (incidentId) => {
    try {
      const incidentDoc = await getDoc(doc(db, 'incidents', incidentId));
      if (!incidentDoc.exists()) return { success: false };
      
      const incident = { id: incidentDoc.id, ...incidentDoc.data() };
      const geminiSummary = await summarizeIncident(incident);

      await updateDoc(doc(db, 'incidents', incidentId), {
        status: 'resolved',
        resolvedAt: serverTimestamp(),
        geminiSummary: geminiSummary,
      });

      if (incident.assignedStaff && incident.assignedStaff.length > 0) {
        const staffUpdates = incident.assignedStaff.map((staffId) =>
          updateDoc(doc(db, 'users', staffId), {
            status: 'Available',
          })
        );
        await Promise.all(staffUpdates);
      }
      return { success: true };
    } catch (error) {
      console.error('[Venue] resolveIncident failed:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  const value = {
    activeIncidents,
    allStaff,
    inventory,
    getRoomStats,
    selectedFloor,
    setSelectedFloor,
    selectedRoom,
    setSelectedRoom,
    visibleFloors,
    setVisibleFloors,
    viewMode,
    setViewMode,
    liveMode,
    setLiveMode,
    language,
    setLanguage,
    hoveredRoom,
    setHoveredRoom,
    toggleFloorVisibility,
    focusFloor,
    resetView,
    dispatchStaff,
    resolveIncident,
    t
  };

  return (
    <VenueContext.Provider value={value}>
      {children}
    </VenueContext.Provider>
  );
}

export const useVenue = () => {
  const context = useContext(VenueContext);
  if (!context) {
    throw new Error('useVenue must be used within a VenueProvider');
  }
  return context;
};

export default VenueContext;
