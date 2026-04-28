import React, { useContext, useState, useEffect, useRef } from 'react';
import { 
  User, Shield, Palette, Bell, Globe, LogOut, ChevronRight, Lock,
  Monitor, Moon, Sun, Fingerprint, Mail, MessageSquare, Info,
  ExternalLink, Heart, Code, Activity
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useVenue } from '../context/VenueContext';
import gsap from 'gsap';

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useVenue();
  const [activeTheme, setActiveTheme] = useState('dark');
  const [pushAlerts, setPushAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current.children, 
        { y: 20, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, []);

  const themes = [
    { id: 'light', labelKey: 'settings.light', icon: Sun, gradient: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' },
    { id: 'glass', labelKey: 'settings.glass', icon: Monitor, gradient: 'linear-gradient(135deg, #1e293b, #334155)' },
    { id: 'dark', labelKey: 'settings.dark', icon: Moon, gradient: 'linear-gradient(135deg, #020617, #0f172a)' },
  ];

  const languages = [
    { code: 'en', label: 'English', flag: '🇺🇸', desc: 'Default interface language' },
    { code: 'hi', label: 'हिंदी (Hindi)', flag: '🇮🇳', desc: 'हिंदी भाषा इंटरफ़ेस' },
    { code: 'mr', label: 'मराठी (Marathi)', flag: '🇮🇳', desc: 'मराठी भाषा इंटरफेस' },
  ];

  const handleTheme = (id) => {
    setActiveTheme(id);
    document.documentElement.setAttribute('data-theme', id);
  };

  // Section Card wrapper
  const Section = ({ icon: Icon, title, children, accentColor = 'var(--accent-primary)' }) => (
    <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ 
          width: '34px', height: '34px', borderRadius: 'var(--radius-md)',
          background: `${accentColor}15`, display: 'grid', placeItems: 'center'
        }}>
          <Icon size={17} color={accentColor} />
        </div>
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>{title}</h3>
      </div>
      {children}
    </div>
  );

  // Toggle switch
  const Toggle = ({ enabled, onToggle }) => (
    <button 
      onClick={onToggle}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: enabled ? 'var(--accent-primary)' : 'var(--bg-surface)',
        border: `1px solid ${enabled ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
        position: 'relative', cursor: 'pointer', transition: 'all 0.25s ease', flexShrink: 0
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#fff', position: 'absolute', top: '2px',
        left: enabled ? '22px' : '2px',
        transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
      }} />
    </button>
  );

  // Notif row
  const NotifRow = ({ icon: Icon, title, desc, enabled, onToggle }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 0', borderBottom: '1px solid var(--border-glass)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-surface)', display: 'grid', placeItems: 'center' }}>
          <Icon size={14} color="var(--text-muted)" />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-main)' }}>{title}</p>
          <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{desc}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );

  return (
    <div ref={containerRef} style={{ maxWidth: '760px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.6rem', margin: 0, fontWeight: 700 }}>{t('settings.title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('settings.subtitle')}</p>
      </div>

      {/* ─── Profile ─── */}
      <Section icon={User} title={t('settings.profile')}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
          {user?.avatar ? (
            <img src={user.avatar} alt="Avatar" style={{ width: '64px', height: '64px', borderRadius: '16px', border: '2px solid var(--border-glass)', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--accent-primary), #0d9488)', display: 'grid', placeItems: 'center' }}>
              <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 700 }}>{user?.name?.charAt(0)}</span>
            </div>
          )}
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>{user?.name || 'User'}</h3>
            <p style={{ margin: '0.2rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user?.role || 'Medical Officer'}</p>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Fingerprint size={11} /> {t('settings.network_id')}: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>VO-2026-0428</span>
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Shield size={11} /> {t('settings.clearance')}: <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>ALPHA</span>
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            padding: '0.7rem 1.25rem', borderRadius: 'var(--radius-md)',
            background: 'var(--accent-alert-light)', color: 'var(--accent-alert)',
            fontSize: '0.85rem', fontWeight: 600, border: '1px solid rgba(255,51,102,0.1)',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent-alert)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-alert-light)'; e.currentTarget.style.color = 'var(--accent-alert)'; }}
        >
          <LogOut size={15} /> {t('settings.logout')}
        </button>
      </Section>

      {/* ─── Security ─── */}
      <Section icon={Shield} title={t('settings.security')} accentColor="var(--accent-yellow)">
        <button 
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            padding: '1rem', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-glass)',
            cursor: 'pointer', transition: 'background 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-primary-light)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-surface)'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: 'var(--radius-sm)', background: 'var(--accent-yellow-light)', display: 'grid', placeItems: 'center' }}>
              <Lock size={15} color="var(--accent-yellow)" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-main)' }}>{t('settings.update_key')}</p>
              <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t('settings.update_key_desc')}</p>
            </div>
          </div>
          <ChevronRight size={16} color="var(--text-muted)" />
        </button>
      </Section>

      {/* ─── Theme ─── */}
      <Section icon={Palette} title={t('settings.theme')} accentColor="var(--accent-primary)">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.85rem' }}>
          {themes.map(theme => {
            const isActive = activeTheme === theme.id;
            return (
              <button 
                key={theme.id}
                onClick={() => handleTheme(theme.id)}
                style={{
                  padding: '1rem', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                  background: 'var(--bg-surface)', cursor: 'pointer',
                  transition: 'all 0.2s ease', textAlign: 'center',
                  boxShadow: isActive ? '0 0 20px var(--accent-primary-glow)' : 'none'
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
              >
                <div style={{
                  width: '100%', height: '40px', borderRadius: '8px', marginBottom: '0.75rem',
                  background: theme.gradient, border: '1px solid rgba(255,255,255,0.1)'
                }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                  <theme.icon size={14} color={isActive ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                  <span style={{ fontSize: '0.82rem', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                    {t(theme.labelKey)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ─── Language ─── */}
      <Section icon={Globe} title={t('settings.language')} accentColor="#8b5cf6">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {languages.map(lang => {
            const isActive = language === lang.code;
            return (
              <button 
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isActive ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                  background: isActive ? 'var(--accent-primary-light)' : 'var(--bg-surface)',
                  cursor: 'pointer', transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
                onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.borderColor = 'var(--border-glass)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <span style={{ fontSize: '1.4rem' }}>{lang.flag}</span>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--accent-primary)' : 'var(--text-main)' }}>{lang.label}</p>
                    <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{lang.desc}</p>
                  </div>
                </div>
                {isActive && (
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* ─── Notifications ─── */}
      <Section icon={Bell} title={t('settings.notifications')} accentColor="var(--accent-green)">
        <NotifRow icon={Bell} title={t('settings.push_alerts')} desc={t('settings.push_desc')} enabled={pushAlerts} onToggle={() => setPushAlerts(!pushAlerts)} />
        <NotifRow icon={MessageSquare} title={t('settings.sms')} desc={t('settings.sms_desc')} enabled={smsAlerts} onToggle={() => setSmsAlerts(!smsAlerts)} />
        <NotifRow icon={Mail} title={t('settings.email')} desc={t('settings.email_desc')} enabled={emailAlerts} onToggle={() => setEmailAlerts(!emailAlerts)} />
      </Section>

      {/* ─── About ─── */}
      <Section icon={Info} title={t('settings.about')} accentColor="var(--text-muted)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            { label: t('settings.version'), value: '4.2.1' },
            { label: t('settings.build'), value: '2026.04.28-stable' },
            { label: t('settings.license'), value: 'Enterprise Medical' },
            { label: 'Engine', value: 'React 19 + Three.js R3F' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.label}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 500 }}>{item.value}</span>
            </div>
          ))}
        </div>
        <div style={{ 
          marginTop: '1.25rem', padding: '0.85rem 1rem', 
          background: 'var(--accent-primary-light)', borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(14, 165, 160, 0.1)',
          display: 'flex', alignItems: 'center', gap: '0.75rem'
        }}>
          <Activity size={16} color="var(--accent-primary)" />
          <div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600 }}>VitalOps AI</p>
            <p style={{ margin: '0.1rem 0 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Defense-grade hospital intelligence platform</p>
          </div>
        </div>
      </Section>
    </div>
  );
}
