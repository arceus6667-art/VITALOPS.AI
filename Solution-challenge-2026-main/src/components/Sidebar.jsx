import React, { useEffect, useRef } from 'react';
import { Activity, LayoutDashboard, Users, AlertTriangle, Settings, Building2, Package, TrendingUp, Zap, MapPin } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function Sidebar() {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const { t } = useVenue();

  useEffect(() => {
    gsap.fromTo(sidebarRef.current, 
      { x: -50, opacity: 0 }, 
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, labelKey: 'nav.dashboard', path: '/' },
    { icon: Building2, labelKey: 'nav.venue', path: '/venue' },
    { icon: MapPin, labelKey: 'nav.zones', path: '/zones' },
    { icon: Users, labelKey: 'nav.staff', path: '/staff' },
    { icon: Package, labelKey: 'nav.stocks', path: '/stocks' },
    { icon: AlertTriangle, labelKey: 'nav.alerts', path: '/alerts' },
    { icon: TrendingUp, labelKey: 'nav.trends', path: '/trends' },
    { icon: Settings, labelKey: 'nav.settings', path: '/settings' },
  ];

  return (
    <aside 
      ref={sidebarRef} 
      style={{ 
        width: 'var(--sidebar-width)', 
        height: '100%', 
        padding: '1.75rem 1rem', 
        display: 'flex', 
        flexDirection: 'column', 
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-glass)',
        position: 'relative',
        zIndex: 50
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2.5rem', paddingLeft: '0.75rem' }}>
        <div style={{ 
          width: '36px', height: '36px', 
          borderRadius: 'var(--radius-md)', 
          background: 'linear-gradient(135deg, var(--accent-primary), #0d9488)', 
          display: 'grid', placeItems: 'center',
          boxShadow: '0 2px 8px rgba(14, 165, 160, 0.3)'
        }}>
          <Activity size={20} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.15rem', margin: 0, color: 'var(--text-main)', fontWeight: 700, letterSpacing: '-0.02em' }}>VitalOps AI</h2>
      </div>

      {/* Navigation — uses t() for all labels */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuItems.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              to={item.path}
              key={idx}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.85rem', 
                padding: '0.7rem 1rem', 
                borderRadius: 'var(--radius-md)', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: isActive ? 'var(--accent-primary-light)' : 'transparent',
                color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.color = 'var(--text-main)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-muted)';
                }
              }}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%',
                  transform: 'translateY(-50%)',
                  width: '3px', height: '60%',
                  background: 'var(--accent-primary)',
                  borderRadius: '0 4px 4px 0'
                }} />
              )}
              <item.icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* System Status */}
      <div style={{ 
        padding: '1rem', 
        background: 'var(--accent-green-light)', 
        borderRadius: 'var(--radius-md)', 
        border: '1px solid rgba(16, 185, 129, 0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <Zap size={14} color="var(--accent-green)" />
          <p style={{ color: 'var(--accent-green)', fontSize: '0.78rem', fontWeight: 700, margin: 0 }}>{t('sidebar.system_status')}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="live-dot" style={{ width: '6px', height: '6px' }}></div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('sidebar.ai_active')}</span>
        </div>
      </div>
    </aside>
  );
}
