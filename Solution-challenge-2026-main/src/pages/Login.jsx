import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity, Mail, Lock, ArrowRight, Eye, EyeOff, Shield, User, DoorOpen, Hotel, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';

// ─────────────────────────────────────────────
// Persistent low-motion neural network background
// ─────────────────────────────────────────────
function NeuralBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Fewer, slower particles
    const nodeCount = Math.min(40, Math.floor((W() * H()) / 25000));
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: 1 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
    }

    const render = (now) => {
      const time = now / 1000;
      const w = W();
      const h = H();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Deep dark gradient bg
      const bg = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.7);
      bg.addColorStop(0, '#050d18');
      bg.addColorStop(1, '#020408');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Mouse parallax glow
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mouseGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 300);
      mouseGlow.addColorStop(0, 'rgba(0, 100, 150, 0.06)');
      mouseGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = mouseGlow;
      ctx.fillRect(0, 0, w, h);

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (dist < 200) {
            ctx.strokeStyle = `rgba(0, 180, 220, ${0.04 * (1 - dist / 200)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        const pulse = 0.5 + Math.sin(time + node.phase) * 0.3;
        ctx.fillStyle = `rgba(0, 200, 240, ${0.25 * pulse})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />;
}

// ─────────────────────────────────────────────
// Main Auth Page
// ─────────────────────────────────────────────
export default function Login() {
  const { login, guestLogin } = useAuth();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const logoRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const modeSelectorRef = useRef(null);
  const formRef = useRef(null);
  const submitRef = useRef(null);
  const footerRef = useRef(null);
  const securityRef = useRef(null);

  const [mode, setMode] = useState('staff'); // 'staff' | 'guest'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [guestName, setGuestName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  // ── GSAP Entry Animation ──
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Card entry
    tl.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.92, rotationX: 5 },
      { opacity: 1, y: 0, scale: 1, rotationX: 0, duration: 1.2, ease: 'expo.out' },
      0.2
    );

    // Logo
    tl.fromTo(logoRef.current,
      { opacity: 0, scale: 0.5, rotation: -15 },
      { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' },
      0.5
    );

    // Title + subtitle
    tl.fromTo(titleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6 },
      0.8
    );
    tl.fromTo(subtitleRef.current,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5 },
      1.0
    );

    // Mode selector
    tl.fromTo(modeSelectorRef.current,
      { opacity: 0, y: 20, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5 },
      1.2
    );

    // Form fields
    tl.fromTo(formRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      1.4
    );

    // Submit button
    if (submitRef.current) {
      tl.fromTo(submitRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5 },
        1.6
      );

      // Continuous button glow pulse
      gsap.to(submitRef.current, {
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.3), 0 4px 20px rgba(0, 243, 255, 0.15)',
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    }

    // Security badge
    tl.fromTo(securityRef.current,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.4 },
      1.8
    );

  }, []);

  // ── Mouse parallax ──
  const handleMouseMove = useCallback((e) => {
    if (!cardRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(cardRef.current, {
      rotationY: x * 3,
      rotationX: -y * 3,
      duration: 0.5,
      ease: 'power2.out'
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.5 });
  }, []);

  // ── Mode switch animation ──
  const switchMode = (newMode) => {
    if (newMode === mode) return;
    setError('');
    gsap.to(formRef.current, {
      opacity: 0, y: 10, duration: 0.2,
      onComplete: () => {
        setMode(newMode);
        gsap.to(formRef.current, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
      }
    });
  };

  // ── Submit handlers ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'staff') {
      if (!email || !password) {
        setError('All fields are required');
        gsap.to(cardRef.current, { x: [-8, 8, -6, 6, -3, 3, 0], duration: 0.5, ease: 'power2.out' });
        return;
      }
      setIsLoading(true);

      gsap.to(submitRef.current, {
        scale: 0.95, duration: 0.1,
        onComplete: async () => {
          const result = await login(email, password);
          if (!result.success) {
            setIsLoading(false);
            setError(result.error || 'Authentication failed');
            gsap.to(submitRef.current, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
            gsap.to(cardRef.current, { x: [-8, 8, -6, 6, -3, 3, 0], duration: 0.5, ease: 'power2.out' });
          } else {
            // Success flash
            gsap.to(cardRef.current, {
              boxShadow: '0 0 60px rgba(0, 255, 102, 0.3)',
              borderColor: 'rgba(0, 255, 102, 0.3)',
              duration: 0.3,
            });
          }
        }
      });
    } else {
      // Guest mode
      if (!guestName || !roomNumber) {
        setError('Please enter your name and room number');
        gsap.to(cardRef.current, { x: [-8, 8, -6, 6, -3, 3, 0], duration: 0.5, ease: 'power2.out' });
        return;
      }
      setIsLoading(true);

      gsap.to(submitRef.current, {
        scale: 0.95, duration: 0.1,
        onComplete: async () => {
          const result = await guestLogin(guestName, roomNumber);
          if (!result.success) {
            setIsLoading(false);
            setError(result.error || 'Connection failed');
            gsap.to(submitRef.current, { scale: 1, duration: 0.3, ease: 'back.out(2)' });
            gsap.to(cardRef.current, { x: [-8, 8, -6, 6, -3, 3, 0], duration: 0.5, ease: 'power2.out' });
          } else {
            gsap.to(cardRef.current, {
              boxShadow: '0 0 60px rgba(0, 255, 102, 0.3)',
              borderColor: 'rgba(0, 255, 102, 0.3)',
              duration: 0.3,
            });
          }
        }
      });
    }
  };

  const inputBaseStyle = {
    width: '100%',
    padding: '0.95rem 1rem 0.95rem 3rem',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    color: '#e2e8f0',
    outline: 'none',
    fontSize: '0.92rem',
    fontFamily: "'Outfit', sans-serif",
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease'
  };

  const inputFocusStyle = {
    borderColor: 'rgba(0, 243, 255, 0.4)',
    boxShadow: '0 0 0 3px rgba(0, 243, 255, 0.08), 0 0 20px rgba(0, 243, 255, 0.05)',
    background: 'rgba(0, 243, 255, 0.02)'
  };

  const modeCardStyle = (isActive) => ({
    flex: 1,
    padding: '1rem 0.75rem',
    background: isActive ? 'rgba(0, 243, 255, 0.06)' : 'rgba(255, 255, 255, 0.03)',
    border: isActive ? '2px solid rgba(0, 243, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '14px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'center',
    fontFamily: "'Outfit', sans-serif",
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        height: '100vh', width: '100vw',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        perspective: '1200px'
      }}
    >
      {/* Animated Neural Background */}
      <NeuralBackground />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(0, 243, 255, 0.015) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 243, 255, 0.015) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px'
      }} />

      {/* Login Card */}
      <div
        ref={cardRef}
        style={{
          width: '480px', maxWidth: '92vw',
          padding: '2.75rem 2.5rem',
          background: 'rgba(8, 15, 30, 0.85)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(0, 243, 255, 0.08)',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 243, 255, 0.05)',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          position: 'relative', zIndex: 1,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Logo */}
        <div ref={logoRef} style={{
          width: '60px', height: '60px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #00f3ff, #0d9488)',
          display: 'grid', placeItems: 'center',
          marginBottom: '1.5rem',
          boxShadow: '0 4px 20px rgba(0, 243, 255, 0.3), 0 0 40px rgba(0, 243, 255, 0.1)'
        }}>
          <Activity size={30} color="#ffffff" />
        </div>

        {/* Title */}
        <h1 ref={titleRef} style={{
          fontSize: '1.75rem', margin: '0 0 0.3rem 0',
          fontWeight: 800, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #e2e8f0, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
        }}>
          VitalOps AI
        </h1>
        <p ref={subtitleRef} style={{
          color: '#64748b', fontSize: '0.82rem', marginBottom: '2rem',
          textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 500
        }}>
          Crisis Response Authorization Platform
        </p>

        {/* Mode Selector */}
        <div ref={modeSelectorRef} style={{
          display: 'flex', gap: '0.75rem', width: '100%', marginBottom: '1.5rem'
        }}>
          <button
            onClick={() => switchMode('guest')}
            style={modeCardStyle(mode === 'guest')}
            onMouseEnter={e => { if (mode !== 'guest') e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (mode !== 'guest') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <Hotel size={22} style={{ color: mode === 'guest' ? '#00f3ff' : '#64748b', marginBottom: '0.4rem' }} />
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: mode === 'guest' ? '#e2e8f0' : '#94a3b8' }}>
              Guest Access
            </p>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: '#64748b' }}>
              Report an emergency
            </p>
          </button>

          <button
            onClick={() => switchMode('staff')}
            style={modeCardStyle(mode === 'staff')}
            onMouseEnter={e => { if (mode !== 'staff') e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={e => { if (mode !== 'staff') e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
          >
            <KeyRound size={22} style={{ color: mode === 'staff' ? '#00f3ff' : '#64748b', marginBottom: '0.4rem' }} />
            <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: mode === 'staff' ? '#e2e8f0' : '#94a3b8' }}>
              Staff Login
            </p>
            <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.7rem', color: '#64748b' }}>
              Command dashboard
            </p>
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            width: '100%', marginBottom: '1rem', padding: '0.65rem 1rem',
            background: 'rgba(255, 51, 102, 0.08)',
            border: '1px solid rgba(255, 51, 102, 0.15)',
            borderRadius: '10px',
            color: '#ff6b8a', fontSize: '0.82rem', fontWeight: 500
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form ref={formRef} onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {mode === 'staff' ? (
            <>
              {/* Email */}
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: focusedField === 'email' ? '#00f3ff' : '#475569',
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type="email"
                  placeholder="Staff Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputBaseStyle,
                    ...(focusedField === 'email' ? inputFocusStyle : {})
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: focusedField === 'password' ? '#00f3ff' : '#475569',
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Authorization Key"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputBaseStyle,
                    paddingRight: '3rem',
                    ...(focusedField === 'password' ? inputFocusStyle : {})
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: '#475569', cursor: 'pointer', padding: '4px',
                    background: 'none', border: 'none'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Guest Name */}
              <div style={{ position: 'relative' }}>
                <User size={16} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: focusedField === 'guestName' ? '#00f3ff' : '#475569',
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type="text"
                  placeholder="Your Name"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                  onFocus={() => setFocusedField('guestName')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputBaseStyle,
                    ...(focusedField === 'guestName' ? inputFocusStyle : {})
                  }}
                />
              </div>

              {/* Room Number */}
              <div style={{ position: 'relative' }}>
                <DoorOpen size={16} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: focusedField === 'roomNumber' ? '#00f3ff' : '#475569',
                  transition: 'color 0.3s ease'
                }} />
                <input
                  type="text"
                  placeholder="Room Number (e.g. 305)"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                  onFocus={() => setFocusedField('roomNumber')}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    ...inputBaseStyle,
                    ...(focusedField === 'roomNumber' ? inputFocusStyle : {})
                  }}
                />
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%', padding: '0.95rem',
              background: mode === 'guest'
                ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                : 'linear-gradient(135deg, #00c4cc, #0d9488)',
              color: '#fff',
              borderRadius: '12px',
              fontWeight: 700,
              fontSize: '0.92rem',
              marginTop: '0.5rem',
              transition: 'all 0.25s ease',
              boxShadow: mode === 'guest'
                ? '0 4px 20px rgba(239, 68, 68, 0.3)'
                : '0 4px 20px rgba(0, 243, 255, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
              cursor: isLoading ? 'wait' : 'pointer',
              border: 'none',
              fontFamily: "'Outfit', sans-serif",
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={e => {
              if (!isLoading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff',
                  animation: 'spin 0.8s linear infinite'
                }} />
                {mode === 'guest' ? 'Connecting...' : 'Authenticating...'}
              </>
            ) : (
              <>
                {mode === 'guest' ? 'Access SOS Panel' : 'Secure Login'} <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        <div ref={securityRef} style={{
          marginTop: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.4rem',
          color: '#334155', fontSize: '0.68rem',
          letterSpacing: '0.06em'
        }}>
          <Shield size={11} />
          AES-256 Encrypted • Firebase Secured • Real-time Protected
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
