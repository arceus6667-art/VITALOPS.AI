// ═══════════════════════════════════════════════════
// VitalOps AI — Trend Analysis (Hospitality Crisis Data)
// Recharts with hospitality labels + Gemini pattern summary.
// ═══════════════════════════════════════════════════

import React, { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Lightbulb } from 'lucide-react';
import { useVenue } from '../context/VenueContext';
import { getPatternSummary } from '../services/gemini';

// Fallback mock data for charts when Firestore is sparse
const WEEKLY_DATA = [
  { week: 'W1', incidents: 4, fire: 1, medical: 2, security: 1, flood: 0 },
  { week: 'W2', incidents: 7, fire: 0, medical: 3, security: 2, flood: 2 },
  { week: 'W3', incidents: 3, fire: 1, medical: 1, security: 1, flood: 0 },
  { week: 'W4', incidents: 9, fire: 2, medical: 3, security: 3, flood: 1 },
  { week: 'W5', incidents: 5, fire: 0, medical: 2, security: 2, flood: 1 },
  { week: 'W6', incidents: 6, fire: 1, medical: 2, security: 1, flood: 2 },
];

const ZONE_DATA = [
  { zone: 'Lobby', count: 8 },
  { zone: 'Ballroom', count: 5 },
  { zone: 'Conference', count: 4 },
  { zone: 'Guest Rooms', count: 12 },
  { zone: 'Pool', count: 6 },
];

const TYPE_DATA = [
  { name: 'Fire', value: 5, color: '#ef4444' },
  { name: 'Medical', value: 13, color: '#3b82f6' },
  { name: 'Security', value: 10, color: '#f59e0b' },
  { name: 'Flood', value: 6, color: '#06b6d4' },
  { name: 'Other', value: 2, color: '#8b5cf6' },
];

const RESPONSE_DATA = [
  { week: 'W1', avgMin: 8 },
  { week: 'W2', avgMin: 6 },
  { week: 'W3', avgMin: 5 },
  { week: 'W4', avgMin: 7 },
  { week: 'W5', avgMin: 4 },
  { week: 'W6', avgMin: 3 },
];

const CHART_COLORS = {
  primary: '#2dd4bf',
  secondary: '#a78bfa',
  alert: '#f87171',
  yellow: '#fbbf24',
  blue: '#60a5fa',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
      borderRadius: 'var(--radius-md)', padding: '0.65rem 0.85rem',
      backdropFilter: 'blur(12px)', boxShadow: 'var(--shadow-md)',
    }}>
      <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: p.color || 'var(--text-secondary)' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendAnalysis() {
  const containerRef = useRef(null);
  const { activeIncidents, t } = useVenue();
  const [patternText, setPatternText] = useState('');
  const [patternLoading, setPatternLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('frequency');

  useEffect(() => {
    gsap.fromTo('.trend-panel',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out' }
    );
  }, []);

  // Gemini pattern analysis on mount
  useEffect(() => {
    const fetchPattern = async () => {
      setPatternLoading(true);
      const result = await getPatternSummary(activeIncidents);
      setPatternText(result);
      setPatternLoading(false);
    };
    const timer = setTimeout(fetchPattern, 1500);
    return () => clearTimeout(timer);
  }, []);

  const tabs = [
    { key: 'frequency', label: 'Incident Frequency' },
    { key: 'zones', label: 'Zone Activity' },
    { key: 'types', label: 'Type Breakdown' },
    { key: 'response', label: 'Response Time' },
  ];

  return (
    <div ref={containerRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <TrendingUp size={22} /> {t('trends.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>{t('trends.subtitle')}</p>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: 'var(--bg-surface)', borderRadius: 'var(--radius-full)', padding: '3px', border: '1px solid var(--border-glass)', alignSelf: 'flex-start' }}>
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
            padding: '0.5rem 1.25rem', borderRadius: 'var(--radius-full)',
            fontSize: '0.82rem', fontWeight: 600, transition: 'all 0.25s ease',
            background: activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
            color: activeTab === tab.key ? 'var(--accent-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === tab.key ? 'var(--shadow-sm)' : 'none',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="trend-panel glass-panel" style={{ padding: '1.5rem', minHeight: '360px' }}>
        {activeTab === 'frequency' && (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={WEEKLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="incidents" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ r: 4, fill: CHART_COLORS.primary }} name="Total Incidents" />
              <Line type="monotone" dataKey="medical" stroke={CHART_COLORS.blue} strokeWidth={1.5} strokeDasharray="5 5" name="Medical" />
              <Line type="monotone" dataKey="security" stroke={CHART_COLORS.yellow} strokeWidth={1.5} strokeDasharray="5 5" name="Security" />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'zones' && (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={ZONE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="zone" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} name="Incidents" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'types' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem' }}>
            <ResponsiveContainer width="50%" height={320}>
              <PieChart>
                <Pie data={TYPE_DATA} cx="50%" cy="50%" outerRadius={110} innerRadius={60} paddingAngle={3} dataKey="value">
                  {TYPE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {TYPE_DATA.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: t.color }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 700, marginLeft: 'auto' }}>{t.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'response' && (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={RESPONSE_DATA}>
              <defs>
                <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" />
              <XAxis dataKey="week" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} unit="m" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="avgMin" stroke={CHART_COLORS.primary} strokeWidth={2} fill="url(#responseGrad)" name="Avg Minutes" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Gemini Pattern Summary */}
      <div className="trend-panel glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
          background: 'var(--accent-primary-light)', display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Lightbulb size={18} color="var(--accent-primary)" />
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Gemini AI Pattern Analysis
          </h3>
          {patternLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ height: '12px', width: '90%', background: 'var(--bg-subtle)', borderRadius: '4px', animation: 'breathing 2s ease-in-out infinite' }} />
              <div style={{ height: '12px', width: '75%', background: 'var(--bg-subtle)', borderRadius: '4px', animation: 'breathing 2s ease-in-out infinite', animationDelay: '0.2s' }} />
              <div style={{ height: '12px', width: '60%', background: 'var(--bg-subtle)', borderRadius: '4px', animation: 'breathing 2s ease-in-out infinite', animationDelay: '0.4s' }} />
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              {patternText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
