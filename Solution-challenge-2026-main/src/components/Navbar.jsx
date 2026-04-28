import React, { useContext, useEffect, useRef, useState } from 'react';
import { Search, Bell, Zap, LogOut, AlertTriangle, AlertCircle, Info, X, Globe } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function Navbar() {
  const navRef = useRef(null);
  const { user, role, logout } = useContext(AuthContext);
  const { unreadCount, alerts, markAllRead, dismissAlert } = useContext(AlertContext);
  const { language, setLanguage, t } = useVenue();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const langDropdownRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );
  }, []);

  const toggleDropdown = () => {
    if (!showDropdown) markAllRead();
    setShowDropdown(!showDropdown);
    setShowLangDropdown(false);
  };

  const toggleLangDropdown = () => {
    setShowLangDropdown(!showLangDropdown);
    setShowDropdown(false);
  };

  useEffect(() => {
    if (showDropdown && dropdownRef.current) {
      gsap.fromTo(dropdownRef.current, { opacity: 0, y: -10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [showDropdown]);

  useEffect(() => {
    if (showLangDropdown && langDropdownRef.current) {
      gsap.fromTo(langDropdownRef.current, { opacity: 0, y: -10, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'power2.out' });
    }
  }, [showLangDropdown]);

  const getStyleProps = (severity) => {
    switch (severity) {
      case 'critical': return { icon: AlertTriangle, color: 'var(--accent-alert)' };
      case 'medium': return { icon: AlertCircle, color: 'var(--accent-yellow)' };
      default: return { icon: Info, color: 'var(--accent-primary)' };
    }
  };

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' }
  ];

  const roleBadge = role === 'guest'
    ? { label: 'Guest', color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' }
    : { label: 'Staff', color: 'var(--accent-green)', bg: 'var(--accent-green-light)' };

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header
      ref={navRef}
      style={{
        position: 'relative', height: 'var(--navbar-height)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 1.75rem',
        borderBottom: '1px solid var(--border-glass)',
        background: 'var(--bg-secondary)',
        zIndex: 100, flexShrink: 0
      }}
    >
      {/* Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <div style={{ position: 'relative', width: '380px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder={t('navbar.search')}
            style={{
              width: '100%', padding: '0.6rem 1rem 0.6rem 2.6rem',
              background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-full)', color: 'var(--text-main)',
              outline: 'none', fontSize: '0.88rem', fontWeight: 400
            }}
          />
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>

        {/* System Online Badge */}
        <div className="status-badge status-badge--active">
          <Zap size={13} />
          <span>{t('navbar.efficiency')}</span>
        </div>

        {/* Language Switcher */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleLangDropdown}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              color: 'var(--text-secondary)', padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-sm)', transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Globe size={16} />
            <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{language.toUpperCase()}</span>
          </button>

          {showLangDropdown && (
            <div
              ref={langDropdownRef}
              style={{
                position: 'absolute', top: '44px', right: 0, width: '170px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 200
              }}
            >
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setShowLangDropdown(false); }}
                  style={{
                    padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                    textAlign: 'left',
                    background: language === lang.code ? 'var(--accent-primary-light)' : 'transparent',
                    color: language === lang.code ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontSize: '0.85rem', fontWeight: language === lang.code ? 600 : 400,
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => { if (language !== lang.code) e.currentTarget.style.background = 'var(--bg-surface)'; }}
                  onMouseLeave={e => { if (language !== lang.code) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={toggleDropdown}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0.45rem', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Bell size={18} color={unreadCount > 0 ? "var(--text-main)" : "var(--text-muted)"} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: 2, right: 2, width: '8px', height: '8px',
                background: 'var(--accent-alert)', borderRadius: '50%', border: '2px solid var(--bg-secondary)'
              }}></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showDropdown && (
            <div
              ref={dropdownRef}
              style={{
                position: 'absolute', top: '44px', right: '-10px', width: '370px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 200
              }}
            >
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-glass)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-main)' }}>{t('navbar.notifications')}</span>
                {unreadCount > 0 && (
                  <span style={{ background: 'var(--accent-alert)', color: '#fff', fontSize: '0.7rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {alerts.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>{t('navbar.no_alerts')}</div>
                ) : (
                  alerts.slice(0, 8).map(alert => {
                    const props = getStyleProps(alert.severity);
                    const isCritical = alert.severity === 'critical';
                    return (
                      <div
                        key={alert.id}
                        style={{
                          display: 'flex', gap: '0.85rem', padding: '1rem 1.25rem',
                          borderBottom: '1px solid var(--border-glass)', position: 'relative',
                          transition: 'background 0.15s ease', cursor: 'pointer'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          marginTop: '2px', width: '28px', height: '28px',
                          borderRadius: 'var(--radius-sm)',
                          background: isCritical ? 'var(--accent-alert-light)' : 'var(--accent-primary-light)',
                          display: 'grid', placeItems: 'center', flexShrink: 0
                        }}>
                          <props.icon size={14} color={props.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{alert.title}</p>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: '0.5rem' }}>{alert.time}</span>
                          </div>
                          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>{alert.suggestion}</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); dismissAlert(alert.id); }} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--text-muted)', padding: '2px' }}>
                          <X size={12} />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
              <div
                style={{
                  padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--border-glass)',
                  fontSize: '0.82rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600,
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {t('navbar.view_all')}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: 'var(--border-glass)' }}></div>

        {/* Profile + Role Badge + Logout */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.88rem', fontWeight: 600, margin: 0, color: 'var(--text-main)' }}>{displayName}</p>
              <span style={{
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                color: roleBadge.color, background: roleBadge.bg,
                padding: '1px 7px', borderRadius: 'var(--radius-full)',
                display: 'inline-block', marginTop: '1px'
              }}>
                {roleBadge.label}
              </span>
            </div>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-primary), #0d9488)',
              display: 'grid', placeItems: 'center'
            }}>
              <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{initial}</span>
            </div>
            {/* Logout */}
            <button
              onClick={logout}
              title="Sign Out"
              style={{
                padding: '0.4rem', borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)', transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-alert-light)'; e.currentTarget.style.color = 'var(--accent-alert)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
