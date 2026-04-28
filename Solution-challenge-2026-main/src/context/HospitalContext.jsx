import React, { createContext, useState, useContext, useMemo } from 'react';
import { translations } from '../data/translations';

const HospitalContext = createContext();

export function HospitalProvider({ children }) {
  const [selectedFloor, setSelectedFloor] = useState(null); // null means all floors visible
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [visibleFloors, setVisibleFloors] = useState(new Set([0, 1, 2, 3, 4]));
  const [viewMode, setViewMode] = useState('stacked'); // 'stacked' | 'exploded'
  const [liveMode, setLiveMode] = useState(true);
  const [language, setLanguage] = useState('en');
  const [hoveredRoom, setHoveredRoom] = useState(null);

  const t = useMemo(() => (key) => {
    return translations[language][key] || key;
  }, [language]);

  const toggleFloorVisibility = (floorLevel) => {
    setVisibleFloors(prev => {
      const next = new Set(prev);
      if (next.has(floorLevel)) {
        next.delete(floorLevel);
      } else {
        next.add(floorLevel);
      }
      return next;
    });
  };

  const focusFloor = (floorLevel) => {
    if (selectedFloor === floorLevel) {
      setSelectedFloor(null);
      setVisibleFloors(new Set([0, 1, 2, 3, 4]));
    } else {
      setSelectedFloor(floorLevel);
      setVisibleFloors(new Set([floorLevel]));
    }
  };

  const resetView = () => {
    setSelectedFloor(null);
    setSelectedRoom(null);
    setVisibleFloors(new Set([0, 1, 2, 3, 4]));
    setViewMode('stacked');
  };

  // Mock data for rooms
  const getRoomStats = (roomId) => {
    // Generate deterministic mock data based on room ID
    const hash = roomId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const patientCount = (hash % 30) + 5;
    const capacity = (hash % 20) + 20;
    const status = patientCount > capacity * 0.9 ? 'critical' : patientCount > capacity * 0.7 ? 'busy' : 'available';
    
    return {
      patientCount,
      capacity,
      status,
      equipment: [
        { name: 'Ventilator', status: hash % 2 === 0 ? 'Functional' : 'Maintenance' },
        { name: 'Patient Monitor', status: 'Functional' },
        { name: 'Infusion Pump', status: 'Functional' }
      ],
      stockLevel: (hash % 50) + 40
    };
  };

  const value = {
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
    t,
    toggleFloorVisibility,
    focusFloor,
    resetView,
    getRoomStats
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
}

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
