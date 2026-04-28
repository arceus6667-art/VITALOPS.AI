import React, { useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import gsap from 'gsap';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout() {
  const location = useLocation();
  const pageWrapperRef = useRef(null);

  // Trigger GSAP transition on every route change
  useEffect(() => {
    if (pageWrapperRef.current) {
      gsap.fromTo(pageWrapperRef.current,
        { opacity: 0, y: 15, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out', clearProps: 'all' }
      );
    }
  }, [location.pathname]);

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Navbar />
        <main style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '0 1.75rem 1.75rem 1.75rem', 
          display: 'flex', 
          flexDirection: 'column',
        }}>
          {/* GSAP Transition Wrapper */}
          <div ref={pageWrapperRef} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
