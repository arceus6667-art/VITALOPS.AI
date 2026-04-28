import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function AnimatedCharts() {
  const chartRef = useRef(null);
  const barsRef = useRef([]);

  useEffect(() => {
    // Entrance animation
    gsap.fromTo(chartRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out', delay: 0.7 }
    );

    // Initial Bars animation
    gsap.fromTo(barsRef.current,
      { height: 0 },
      { height: (i) => `${20 + Math.random() * 80}%`, duration: 1.2, stagger: 0.05, ease: 'bounce.out', delay: 1 }
    );

    // Continual random pulsing of bars to simulate live data
    const interval = setInterval(() => {
      barsRef.current.forEach((bar) => {
        if (bar && Math.random() > 0.6) {
          gsap.to(bar, { height: `${20 + Math.random() * 80}%`, duration: 0.8, ease: 'power2.inOut' });
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const arr = new Array(20).fill(0);

  return (
    <div ref={chartRef} className="glass-panel" style={{ flex: 2, padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>Vitals Trend Analysis</h3>
        <select style={{ background: 'rgba(10, 14, 23, 0.8)', color: 'var(--text-main)', border: '1px solid var(--border-glass)', padding: '0.25rem 0.5rem', borderRadius: '4px', outline: 'none' }}>
          <option>Last 12 Hours</option>
          <option>Last 24 Hours</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '0 0.5rem' }}>
        {arr.map((_, i) => (
          <div key={i} style={{ flex: 1, height: '100%', background: 'rgba(0, 243, 255, 0.05)', borderRadius: '4px 4px 0 0', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
            <div 
              ref={el => barsRef.current[i] = el}
              style={{
                width: '100%',
                background: `linear-gradient(to top, var(--accent-blue), rgba(0, 243, 255, 0.2))`,
                borderRadius: '4px 4px 0 0',
                boxShadow: '0 -2px 10px rgba(0, 243, 255, 0.2)'
              }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}
