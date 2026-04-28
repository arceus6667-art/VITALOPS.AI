// ═══════════════════════════════════════════════════
// VitalOps AI — AI Insights (Gemini-powered)
// Replaces if-else mock logic with real Gemini calls.
// Debounced, cached, with loading skeletons.
// ═══════════════════════════════════════════════════

import React, { useRef, useEffect, useState } from 'react';
import { Lightbulb, AlertTriangle, ArrowRightCircle, ShieldCheck, Info } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import { getGeminiInsights } from '../services/gemini';
import gsap from 'gsap';

const FALLBACK_INSIGHT = {
  type: 'info',
  text: 'AI analysis temporarily unavailable.',
  action: 'Continue standard monitoring protocols.',
  priority: 3,
};

export default function AiInsights() {
  const containerRef = useRef(null);
  const { activeIncidents, t } = useVenue();
  const [insights, setInsights] = useState([FALLBACK_INSIGHT]);
  const [loading, setLoading] = useState(false);
  const lastIncidentHash = useRef('');

  // ── Fetch insights when activeIncidents change (debounced) ──
  useEffect(() => {
    const hash = JSON.stringify(activeIncidents.map(i => i.id + i.status));
    if (hash === lastIncidentHash.current) return;
    lastIncidentHash.current = hash;

    const fetchInsights = async () => {
      setLoading(true);
      const result = await getGeminiInsights(activeIncidents);
      if (result && Array.isArray(result) && result.length > 0) {
        setInsights(result);
      }
      setLoading(false);
    };

    const timer = setTimeout(fetchInsights, 3000);
    return () => clearTimeout(timer);
  }, [activeIncidents]);

  // ── GSAP animations on insight update ──
  useEffect(() => {
    if (containerRef.current && !loading) {
      gsap.fromTo(containerRef.current,
        { boxShadow: '0 0 20px var(--accent-primary-glow)' },
        { boxShadow: '0 0 0px rgba(0,0,0,0)', duration: 1.5, ease: 'power2.out', clearProps: 'boxShadow' }
      );

      const items = containerRef.current.querySelectorAll('.insight-item');
      if (items.length > 0) {
        gsap.fromTo(items,
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
        );
      }
    }
  }, [insights, loading]);

  const getStyleProps = (type) => {
    switch (type) {
      case 'critical': return { icon: AlertTriangle, color: 'var(--accent-alert)', bg: 'var(--accent-alert-light)' };
      case 'warning': return { icon: Lightbulb, color: 'var(--accent-yellow)', bg: 'var(--accent-yellow-light)' };
      case 'success': return { icon: ShieldCheck, color: 'var(--accent-green)', bg: 'var(--accent-green-light)' };
      default: return { icon: Info, color: 'var(--accent-primary)', bg: 'var(--accent-primary-light)' };
    }
  };

  return (
    <div ref={containerRef} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.85rem' }}>
        <div style={{
          width: '30px', height: '30px',
          background: 'var(--accent-primary-light)',
          borderRadius: 'var(--radius-sm)',
          display: 'grid', placeItems: 'center'
        }}>
          <Lightbulb size={15} color="var(--accent-primary)" />
        </div>
        <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{t('ai.title')}</h3>
        {loading && (
          <div style={{
            marginLeft: 'auto', width: '14px', height: '14px', borderRadius: '50%',
            border: '2px solid var(--bg-subtle)', borderTopColor: 'var(--accent-primary)',
            animation: 'spin 0.8s linear infinite'
          }} />
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {loading ? (
          // ── Skeleton loading cards ──
          [1, 2, 3].map(i => (
            <div key={i} style={{
              background: 'var(--bg-subtle)',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--border-glass)',
              animation: 'breathing 2s ease-in-out infinite',
              animationDelay: `${i * 0.2}s`,
            }}>
              <div style={{ height: '12px', width: '80%', background: 'var(--bg-surface)', borderRadius: '4px', marginBottom: '0.6rem' }} />
              <div style={{ height: '10px', width: '55%', background: 'var(--bg-surface)', borderRadius: '4px' }} />
            </div>
          ))
        ) : (
          // ── Real insight cards ──
          insights.map((insight, idx) => {
            const props = getStyleProps(insight.type);
            return (
              <div
                key={idx}
                className="insight-item"
                style={{
                  background: props.bg,
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${props.color}`,
                  position: 'relative',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: '26px', height: '26px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-secondary)',
                    display: 'grid', placeItems: 'center',
                    flexShrink: 0,
                    marginTop: '1px'
                  }}>
                    <props.icon size={13} color={props.color} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.4 }}>{insight.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
                      <ArrowRightCircle size={11} color={props.color} />
                      <span style={{ fontSize: '0.75rem', color: props.color, fontWeight: 600 }}>{insight.action}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
