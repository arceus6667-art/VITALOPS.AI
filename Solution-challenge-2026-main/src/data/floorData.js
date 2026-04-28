export const FLOOR_DATA = [
  {
    level: 0,
    name: "Parking & Entrance",
    shortName: "P",
    rooms: [
      { id: "P-ENTRANCE", name: "Main Entrance", department: "Operations", category: "admin", color: "#00f3ff", pos: [-3, 0, -2], size: [3, 1, 3] },
      { id: "P-PARKING-A", name: "Parking A", department: "Operations", category: "utility", color: "#64748b", pos: [1, 0, -2], size: [3, 1, 3] },
      { id: "P-PARKING-B", name: "Parking B", department: "Operations", category: "utility", color: "#64748b", pos: [5, 0, -2], size: [3, 1, 3] },
      { id: "P-VALET", name: "Valet Bay", department: "Operations", category: "utility", color: "#f59e0b", pos: [-3, 0, 2], size: [3, 1, 2.5] },
      { id: "P-SECURITY", name: "Security Post", department: "Security", category: "emergency", color: "#00ff66", pos: [1, 0, 2], size: [2.5, 1, 2.5] },
    ]
  },
  {
    level: 1,
    name: "Lobby & Reception",
    shortName: "L",
    rooms: [
      { id: "L-RECEPTION", name: "Reception Desk", department: "Front Office", category: "admin", color: "#00f3ff", pos: [-4, 0, -2], size: [4, 1, 3] },
      { id: "L-CONCIERGE", name: "Concierge", department: "Front Office", category: "admin", color: "#a855f7", pos: [1, 0, -2], size: [3, 1, 3] },
      { id: "L-LOUNGE", name: "Lobby Lounge", department: "Hospitality", category: "utility", color: "#00f3ff", pos: [5, 0, -2], size: [4, 1, 3] },
      { id: "L-LUGGAGE", name: "Luggage Room", department: "Operations", category: "utility", color: "#f59e0b", pos: [-4, 0, 2], size: [3, 1, 3] },
      { id: "L-BUSINESS", name: "Business Center", department: "Hospitality", category: "lab", color: "#00ff66", pos: [0, 0, 2], size: [4, 1, 3] },
    ]
  },
  {
    level: 2,
    name: "Conference & Events",
    shortName: "C",
    rooms: [
      { id: "C-BALLROOM", name: "Grand Ballroom", department: "Events", category: "ward", color: "#a855f7", pos: [-5, 0, -2], size: [5, 1, 4] },
      { id: "C-BANQUET-A", name: "Banquet Hall A", department: "Events", category: "ward", color: "#00f3ff", pos: [1, 0, -2], size: [4, 1, 4] },
      { id: "C-BANQUET-B", name: "Banquet Hall B", department: "Events", category: "ward", color: "#00f3ff", pos: [6, 0, -2], size: [4, 1, 4] },
      { id: "C-CONF-1", name: "Conference Room 1", department: "Events", category: "lab", color: "#00ff66", pos: [-4, 0, 3], size: [3.5, 1, 3] },
      { id: "C-CONF-2", name: "Conference Room 2", department: "Events", category: "lab", color: "#00ff66", pos: [0, 0, 3], size: [3.5, 1, 3] },
      { id: "C-AV", name: "AV Control", department: "Operations", category: "utility", color: "#f59e0b", pos: [5, 0, 3], size: [3, 1, 3] },
    ]
  },
  {
    level: 3,
    name: "Guest Rooms",
    shortName: "G",
    rooms: [
      { id: "G-EAST", name: "Rooms 301-310 (East Wing)", department: "Rooms", category: "ward", color: "#00f3ff", pos: [-5, 0, -2], size: [5, 1, 4], beds: 10 },
      { id: "G-WEST", name: "Rooms 311-320 (West Wing)", department: "Rooms", category: "ward", color: "#00f3ff", pos: [1, 0, -2], size: [5, 1, 4], beds: 10 },
      { id: "G-HOUSEKEEPING", name: "Housekeeping", department: "Operations", category: "utility", color: "#f59e0b", pos: [-4, 0, 3], size: [4, 1, 3] },
      { id: "G-LAUNDRY", name: "Laundry", department: "Operations", category: "utility", color: "#64748b", pos: [2, 0, 3], size: [4, 1, 3] },
    ]
  },
  {
    level: 4,
    name: "Pool & Recreation",
    shortName: "R",
    rooms: [
      { id: "R-OUTDOOR", name: "Outdoor Pool", department: "Recreation", category: "utility", color: "#06b6d4", pos: [-5, 0, -2], size: [4, 1, 3] },
      { id: "R-INDOOR", name: "Indoor Pool", department: "Recreation", category: "utility", color: "#06b6d4", pos: [0, 0, -2], size: [4, 1, 3] },
      { id: "R-SPA", name: "Spa", department: "Recreation", category: "opd", color: "#ec4899", pos: [5, 0, -2], size: [3, 1, 3] },
      { id: "R-GYM", name: "Gym", department: "Recreation", category: "utility", color: "#00ff66", pos: [-4, 0, 2], size: [3.5, 1, 3] },
      { id: "R-TERRACE", name: "Rooftop Terrace", department: "Recreation", category: "utility", color: "#00f3ff", pos: [0, 0, 2], size: [4, 1, 3] },
      { id: "R-BAR", name: "Bar & Lounge", department: "Hospitality", category: "utility", color: "#a855f7", pos: [5, 0, 2], size: [3.5, 1, 3] },
    ]
  }
];
