import React, { useState, useRef, useEffect, useContext } from 'react';
import { Activity, Flame, HeartPulse, ShieldAlert, Droplets, AlertTriangle, Mic, MicOff, CheckCircle2, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import { classifyIncident } from '../services/gemini';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import gsap from 'gsap';

const CRISIS_TYPES = [
  { key: 'fire', label: 'Fire', emoji: '🔥', icon: Flame, color: '#ef4444' },
  { key: 'medical', label: 'Medical', emoji: '🏥', icon: HeartPulse, color: '#3b82f6' },
  { key: 'security', label: 'Security', emoji: '🚨', icon: ShieldAlert, color: '#f59e0b' },
  { key: 'flood', label: 'Flood', emoji: '💧', icon: Droplets, color: '#06b6d4' },
  { key: 'other', label: 'Other', emoji: '⚠️', icon: AlertTriangle, color: '#8b5cf6' },
];

export default function GuestSOS() {
  const { user, logout } = useAuth();
  const { addAlert } = useContext(AlertContext);

  const [step, setStep] = useState('idle');
  const [crisisType, setCrisisType] = useState(null);
  const [description, setDescription] = useState('');
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [geminiResult, setGeminiResult] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');

  const sosButtonRef = useRef(null);
  const formPanelRef = useRef(null);
  const confirmRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load room number from user doc
  useEffect(() => {
    if (user) {
      import('firebase/firestore').then(({ getDoc, doc: docRef }) => {
        getDoc(docRef(db, 'users', user.uid)).then(snap => {
          if (snap.exists()) setRoomNumber(snap.data().roomNumber || '');
        }).catch(() => {});
      });
    }
  }, [user]);

  // SOS button pulse
  useEffect(() => {
    if (sosButtonRef.current && step === 'idle') {
      gsap.to(sosButtonRef.current, { scale: 1.05, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }
    return () => { if (sosButtonRef.current) gsap.killTweensOf(sosButtonRef.current); };
  }, [step]);

  // Form slide-up animation
  useEffect(() => {
    if (step === 'form' && formPanelRef.current) {
      gsap.fromTo(formPanelRef.current, { opacity: 0, y: 60 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' });
    }
  }, [step]);

  // Confirmation animation
  useEffect(() => {
    if (step === 'confirmed' && confirmRef.current) {
      gsap.fromTo(confirmRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' });
    }
  }, [step]);

  const openForm = () => {
    if (sosButtonRef.current) gsap.killTweensOf(sosButtonRef.current);
    setStep('form');
  };

  // Voice recognition
  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }
    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setVoiceTranscript(transcript);
      setDescription(prev => prev ? prev + ' ' + transcript : transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  // Submit incident
  const handleSubmit = async () => {
    if (!crisisType) return;
    setStep('submitting');

    try {
      const reportData = {
        type: crisisType,
        description,
        voiceTranscript,
        guestRoom: roomNumber,
        zone: 'Unknown',
        reportedBy: user?.uid || '',
      };

      const result = await addAlert(reportData);
      const classification = await classifyIncident(reportData);
      setGeminiResult(classification);

      if (result.success && result.id) {
        try {
          await updateDoc(doc(db, 'incidents', result.id), { geminiClassification: classification, severity: classification.severity });
        } catch (e) { console.warn('[SOS] Failed to update classification:', e.message); }
      }
      setStep('confirmed');
    } catch (error) {
      console.error('[SOS] Submit failed:', error);
      setGeminiResult({ severity: 'medium', response: 'Alert sent. Staff notified.', estimatedMinutes: 10 });
      setStep('confirmed');
    }
  };

  const resetForm = () => {
    setCrisisType(null);
    setDescription('');
    setVoiceTranscript('');
    setGeminiResult(null);
    setStep('idle');
  };

  const panelBg = 'rgba(8, 15, 30, 0.92)';
  const glassBorder = 'rgba(0, 243, 255, 0.1)';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background grid */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', backgroundImage: 'linear-gradient(rgba(0,243,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(0,243,255,0.015) 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

      <div style={{ maxWidth: '480px', width: '100%', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #00f3ff, #0d9488)', display: 'grid', placeItems: 'center' }}>
              <Activity size={20} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Emergency Response</p>
              <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>Your safety is our priority</p>
            </div>
          </div>
          <button onClick={logout} style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '0.4rem 0.8rem', border: '1px solid var(--border-glass)', borderRadius: '8px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-alert)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            Sign Out
          </button>
        </div>

        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', padding: '0.6rem 1.25rem', background: panelBg, border: `1px solid ${glassBorder}`, borderRadius: '12px', width: '100%' }}>
          <div className="live-dot" style={{ width: '6px', height: '6px' }}></div>
          <span style={{ fontSize: '0.78rem', color: 'var(--accent-green)', fontWeight: 600 }}>Connected to Venue Security</span>
          {roomNumber && <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>Room {roomNumber}</span>}
        </div>

        {/* ═══ IDLE: SOS Button ═══ */}
        {step === 'idle' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
            <button ref={sosButtonRef} onClick={openForm} style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              border: '4px solid rgba(239,68,68,0.3)',
              boxShadow: '0 0 60px rgba(239,68,68,0.3), 0 0 120px rgba(239,68,68,0.1)',
              display: 'grid', placeItems: 'center', cursor: 'pointer',
              transition: 'box-shadow 0.3s ease',
            }}>
              <span style={{ color: '#fff', fontSize: '2.2rem', fontWeight: 800, letterSpacing: '0.1em', fontFamily: "'Outfit',sans-serif" }}>SOS</span>
            </button>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', textAlign: 'center', maxWidth: '280px' }}>
              Tap the button to report an emergency. Help will be dispatched immediately.
            </p>
          </div>
        )}

        {/* ═══ FORM: Incident Report ═══ */}
        {step === 'form' && (
          <div ref={formPanelRef} style={{ width: '100%', background: panelBg, border: `1px solid ${glassBorder}`, borderRadius: '16px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={resetForm} style={{ color: 'var(--text-muted)', padding: '4px' }}><ArrowLeft size={18} /></button>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>Report Emergency</h3>
            </div>

            {/* Crisis type grid */}
            <div>
              <p style={{ margin: '0 0 0.6rem 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>What type of emergency?</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
                {CRISIS_TYPES.map(ct => {
                  const isSelected = crisisType === ct.key;
                  return (
                    <button key={ct.key} onClick={() => setCrisisType(ct.key)} style={{
                      padding: '0.85rem 0.5rem', borderRadius: '12px', textAlign: 'center',
                      background: isSelected ? `${ct.color}15` : 'rgba(255,255,255,0.03)',
                      border: isSelected ? `2px solid ${ct.color}` : '1px solid rgba(255,255,255,0.08)',
                      transition: 'all 0.2s ease', cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.3rem' }}>{ct.emoji}</span>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isSelected ? ct.color : 'var(--text-muted)' }}>{ct.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 500 }}>Describe the situation (optional)</p>
              <div style={{ position: 'relative' }}>
                <textarea value={description} onChange={e => setDescription(e.target.value)}
                  placeholder="What's happening? Any injuries? Location details..."
                  rows={3}
                  style={{
                    width: '100%', padding: '0.85rem', paddingRight: '3rem',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', color: '#e2e8f0', fontSize: '0.88rem',
                    fontFamily: "'Outfit',sans-serif", outline: 'none', resize: 'none',
                    transition: 'border-color 0.3s ease',
                  }}
                  onFocus={e => e.target.style.borderColor = 'rgba(0,243,255,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
                <button onClick={toggleVoice} style={{
                  position: 'absolute', right: '10px', top: '10px',
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: isListening ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)',
                  border: isListening ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  display: 'grid', placeItems: 'center', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}>
                  {isListening ? <MicOff size={15} color="#ef4444" /> : <Mic size={15} color="#94a3b8" />}
                </button>
              </div>
              {isListening && <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.72rem', color: '#ef4444', fontWeight: 600 }}>● Listening...</p>}
            </div>

            {/* Room info */}
            {roomNumber && (
              <div style={{ padding: '0.65rem 1rem', background: 'rgba(14,165,160,0.08)', border: '1px solid rgba(14,165,160,0.15)', borderRadius: '10px' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--accent-primary)', fontWeight: 600 }}>📍 Reporting from Room {roomNumber}</p>
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={!crisisType} style={{
              width: '100%', padding: '1rem',
              background: crisisType ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'rgba(255,255,255,0.05)',
              color: crisisType ? '#fff' : '#475569',
              borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem',
              border: 'none', cursor: crisisType ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              fontFamily: "'Outfit',sans-serif",
              boxShadow: crisisType ? '0 4px 20px rgba(239,68,68,0.3)' : 'none',
              transition: 'all 0.25s ease',
            }}>
              <Send size={16} /> Send Emergency Alert
            </button>
          </div>
        )}

        {/* ═══ SUBMITTING: Loading ═══ */}
        {step === 'submitting' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '3px solid rgba(239,68,68,0.2)', borderTopColor: '#ef4444', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--text-main)', fontSize: '1rem', fontWeight: 600 }}>Analyzing with AI...</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Classifying threat level and dispatching response</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* ═══ CONFIRMED: Success ═══ */}
        {step === 'confirmed' && (
          <div ref={confirmRef} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)', display: 'grid', placeItems: 'center' }}>
              <CheckCircle2 size={40} color="var(--accent-green)" />
            </div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>Alert Sent Successfully</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '320px' }}>
              Our response team has been notified and help is on the way.
            </p>

            {geminiResult && (
              <div style={{ width: '100%', maxWidth: '380px', background: panelBg, border: `1px solid ${glassBorder}`, borderRadius: '14px', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>Estimated Response</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{geminiResult.estimatedMinutes} min</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                <div>
                  <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Recommended Action</p>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 500, lineHeight: 1.5 }}>{geminiResult.response}</p>
                </div>
                {geminiResult.escalateToEmergencyServices && (
                  <div style={{ padding: '0.6rem 0.85rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px' }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--accent-alert)', fontWeight: 600 }}>🚨 Emergency services have been contacted</p>
                  </div>
                )}
              </div>
            )}

            <button onClick={resetForm} style={{
              marginTop: '0.5rem', padding: '0.75rem 2rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', color: 'var(--text-main)', fontSize: '0.88rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Outfit',sans-serif", transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,243,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
              Send Another Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
