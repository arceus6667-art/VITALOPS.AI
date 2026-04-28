import React, { useMemo, useEffect, useRef } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import gsap from 'gsap';

// A beautifully mocked charting panel leveraging recharts
export default function AnalyticsPanel({ simState }) {
  const containerRef = useRef(null);

  // Generate simulated history tracks directly influenced by current simState baseline to appear truly live
  const data = useMemo(() => {
    let baseLoad = (simState.inflow + simState.emergency) / 2;
    return [
      { time: '08:00', occupancy: Math.min(100, Math.max(30, baseLoad - 20)), trauma: Math.max(10, simState.emergency - 30) },
      { time: '09:00', occupancy: Math.min(100, Math.max(30, baseLoad - 15)), trauma: Math.max(10, simState.emergency - 20) },
      { time: '10:00', occupancy: Math.min(100, Math.max(30, baseLoad - 10)), trauma: Math.max(10, simState.emergency - 15) },
      { time: '11:00', occupancy: Math.min(100, Math.max(30, baseLoad - 5)), trauma: Math.max(10, simState.emergency - 10) },
      { time: '12:00', occupancy: Math.min(100, Math.max(30, baseLoad)), trauma: Math.max(10, simState.emergency - 5) },
      { time: '13:00 (Live)', occupancy: Math.min(100, Math.max(30, baseLoad + 5)), trauma: simState.emergency },
    ];
  }, [simState.inflow, simState.emergency]);

  const barData = useMemo(() => {
    return [
      { name: 'Surgery 1', staff: 80, equip: 60 },
      { name: 'ICU 1', staff: Math.min(100, simState.inflow + 10), equip: Math.min(100, simState.emergency + 20) },
      { name: 'ER', staff: Math.min(100, simState.emergency + 10), equip: Math.min(100, simState.emergency + 30) },
      { name: 'Gen Ward', staff: Math.min(100, simState.inflow), equip: Math.min(100, simState.inflow + 5) }
    ]
  }, [simState]);

  useEffect(() => {
    if(containerRef.current) {
        gsap.fromTo(containerRef.current.children, 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power2.out' }
        );
    }
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ 
          background: 'var(--bg-secondary)', 
          border: '1px solid var(--border-glass)', 
          padding: '0.85rem 1rem', 
          borderRadius: 'var(--radius-md)', 
          boxShadow: 'var(--shadow-lg)' 
        }}>
          <p style={{ margin: '0 0 0.4rem 0', fontWeight: 600, color: 'var(--text-main)', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.3rem', fontSize: '0.85rem' }}>{label}</p>
          {payload.map((entry, idx) => (
             <p key={idx} style={{ margin: '0.2rem 0', color: entry.color, fontSize: '0.82rem', fontWeight: 600 }}>{entry.name}: {entry.value}%</p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1, minHeight: 0 }}>
      {/* Top Graphic Panel */}
      <div className="glass-panel" style={{ flex: 1.5, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Live Core Analytics: Occupancy vs Trauma Influx</h3>
        <div style={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOcc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorTrauma" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent-alert)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--accent-alert)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
              <XAxis dataKey="time" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
              <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36}/>
              <Area type="monotone" dataKey="occupancy" name="Global Ward Occupancy" stroke="var(--accent-primary)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOcc)" animationDuration={800} />
              <Area type="monotone" dataKey="trauma" name="Emergency Trauma Flow" stroke="var(--accent-alert)" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTrauma)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two sub panels */}
      <div style={{ display: 'flex', gap: '1.25rem', flex: 1, minHeight: 0 }}>
        
        {/* Left Sub Panel (Bar Chart) */}
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Resource Allocation Matrix</h3>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <YAxis stroke="var(--text-muted)" tick={{fill: 'var(--text-muted)', fontSize: 12}} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--accent-primary-light)'}} />
                  <Bar dataKey="staff" name="Staff Active %" fill="var(--accent-green)" radius={[4, 4, 0, 0]} animationDuration={800} />
                  <Bar dataKey="equip" name="Core Equipment %" fill="var(--accent-yellow)" radius={[4, 4, 0, 0]} animationDuration={800} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </div>

        {/* Right Sub Panel (Numeric Percentages) */}
        <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.25rem' }}>
          
           <div style={{ 
             width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
             padding: '1.25rem 1.5rem', background: 'var(--accent-primary-light)', 
             borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', 
             position: 'relative', overflow: 'hidden' 
           }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-primary)', borderRadius: '4px 0 0 4px' }}></div>
             <div>
               <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Aggregate System Load</p>
               <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '2.25rem', color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.03em' }}>
                 {Math.floor((simState.inflow + simState.emergency) / 2)}
                 <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 500 }}>%</span>
               </h2>
             </div>
             <div style={{ 
               width: '52px', height: '52px', borderRadius: '50%', 
               border: '3px solid var(--accent-primary)', 
               display: 'grid', placeItems: 'center',
               background: 'var(--accent-primary-light)'
             }}>
               <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
             </div>
           </div>

           <div style={{ 
             width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
             padding: '1.25rem 1.5rem', background: 'var(--accent-alert-light)', 
             borderRadius: 'var(--radius-md)', border: '1px solid var(--border-glass)', 
             position: 'relative', overflow: 'hidden' 
           }}>
             <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'var(--accent-alert)', borderRadius: '4px 0 0 4px' }}></div>
             <div>
               <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>Critical Path Overload</p>
               <h2 style={{ margin: '0.2rem 0 0 0', fontSize: '2.25rem', color: 'var(--text-main)', fontWeight: 700 }}>
                 {simState.emergency > 80 ? 'HIGH' : simState.emergency > 50 ? 'MED' : 'LOW'}
               </h2>
             </div>
             <div style={{ 
               width: '52px', height: '52px', borderRadius: '50%', 
               border: '3px solid var(--accent-alert)', 
               display: 'grid', placeItems: 'center',
               background: 'var(--accent-alert-light)'
             }}>
               <span style={{ fontSize: '0.65rem', color: 'var(--accent-alert)', fontWeight: 700, letterSpacing: '0.03em' }}>AI LOG</span>
             </div>
           </div>

        </div>
      </div>
    </div>
  );
}
