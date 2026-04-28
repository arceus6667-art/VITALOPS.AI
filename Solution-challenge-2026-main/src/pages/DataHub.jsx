import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Database, FileText, Users, Shield, ArrowRight, HardDrive, Clock, Lock } from 'lucide-react';
import { useVenue } from '../context/VenueContext';

const DATA_MODULES = [
  { title: 'Historical Records', desc: 'Access archived patient matrices and treatment history.', icon: FileText, color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)', records: '24,841', lastSync: '2 min ago' },
  { title: 'Staff Rosters', desc: 'View active HR deployments and shift schedules.', icon: Users, color: 'var(--accent-green)', bg: 'var(--accent-green-light)', records: '342', lastSync: '5 min ago' },
  { title: 'Audit Logs', desc: 'Security access logs and system override history.', icon: Shield, color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)', records: '8,127', lastSync: '1 min ago' },
  { title: 'Medical Imaging', desc: 'DICOM archives, X-rays, MRI, and CT scan data.', icon: HardDrive, color: 'var(--accent-purple)', bg: 'var(--accent-purple-light)', records: '15,920', lastSync: '15 min ago' },
  { title: 'Compliance Reports', desc: 'HIPAA compliance and regulatory documentation.', icon: Lock, color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)', records: '1,204', lastSync: '1 hr ago' },
  { title: 'Research Data', desc: 'Clinical trial data and research publications.', icon: Database, color: 'var(--accent-blue)', bg: 'var(--accent-blue-light)', records: '3,567', lastSync: '30 min ago' },
];

export default function DataHub() {
  const containerRef = useRef(null);
  const { t } = useVenue();

  useEffect(() => {
    gsap.fromTo(containerRef.current.children,
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, stagger: 0.1, duration: 0.6, ease: "back.out(1.2)" }
    );
  }, []);

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700 }}>{t('data.title')}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('data.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {DATA_MODULES.map((mod, i) => (
          <div key={i} className="glass-panel hover-glow" style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '42px', height: '42px', borderRadius: 'var(--radius-md)',
                background: mod.bg, display: 'grid', placeItems: 'center'
              }}>
                <mod.icon size={20} color={mod.color} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                <Clock size={10} /> {mod.lastSync}
              </div>
            </div>
            
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-main)', fontWeight: 600 }}>{mod.title}</h3>
              <p style={{ margin: '0.3rem 0 0 0', fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{mod.desc}</p>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{mod.records} records</span>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '0.3rem', 
                color: mod.color, fontSize: '0.78rem', fontWeight: 600 
              }}>
                Access <ArrowRight size={13} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
