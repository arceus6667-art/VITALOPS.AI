import React, { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';

// ─────────────────────────────────────────────
// VitalOps AI — Cinematic Pre-Auth Boot Sequence
// Defense-grade AI hospital system initialization
// ─────────────────────────────────────────────

// Neural network node
class Node {
  constructor(x, y, canvas) {
    this.x = x;
    this.y = y;
    this.originX = x;
    this.originY = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = 1.5 + Math.random() * 2;
    this.baseRadius = this.radius;
    this.glowIntensity = 0;
    this.connections = [];
    this.alpha = 0;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.canvas = canvas;
    this.activated = false;
  }

  update(time) {
    // Gentle drift
    this.x += this.vx;
    this.y += this.vy;

    // Boundary bounce
    const margin = 50;
    if (this.x < margin || this.x > this.canvas.width - margin) this.vx *= -1;
    if (this.y < margin || this.y > this.canvas.height - margin) this.vy *= -1;

    // Pulse
    this.radius = this.baseRadius + Math.sin(time * 2 + this.pulsePhase) * 0.5;
  }

  draw(ctx, globalAlpha) {
    const a = this.alpha * globalAlpha;
    if (a <= 0) return;

    // Glow
    if (this.glowIntensity > 0) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 8);
      gradient.addColorStop(0, `rgba(0, 243, 255, ${0.3 * this.glowIntensity * a})`);
      gradient.addColorStop(1, 'rgba(0, 243, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core
    ctx.fillStyle = `rgba(0, 243, 255, ${a})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright point
    ctx.fillStyle = `rgba(255, 255, 255, ${a * 0.8})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Data pulse traveling along a connection
class Pulse {
  constructor(nodeA, nodeB) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.progress = 0;
    this.speed = 0.008 + Math.random() * 0.012;
    this.alive = true;
    this.size = 2 + Math.random() * 2;
  }

  update() {
    this.progress += this.speed;
    if (this.progress >= 1) {
      this.alive = false;
      // Activate destination node glow
      this.nodeB.glowIntensity = 1;
      gsap.to(this.nodeB, { glowIntensity: 0, duration: 0.8, ease: 'power2.out' });
    }
  }

  draw(ctx, alpha) {
    if (!this.alive) return;
    const x = this.nodeA.x + (this.nodeB.x - this.nodeA.x) * this.progress;
    const y = this.nodeA.y + (this.nodeB.y - this.nodeA.y) * this.progress;

    // Trail
    const trailLen = 0.08;
    const tx = this.nodeA.x + (this.nodeB.x - this.nodeA.x) * Math.max(0, this.progress - trailLen);
    const ty = this.nodeA.y + (this.nodeB.y - this.nodeA.y) * Math.max(0, this.progress - trailLen);
    
    const grad = ctx.createLinearGradient(tx, ty, x, y);
    grad.addColorStop(0, `rgba(0, 243, 255, 0)`);
    grad.addColorStop(1, `rgba(0, 243, 255, ${0.8 * alpha})`);
    ctx.strokeStyle = grad;
    ctx.lineWidth = this.size;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(x, y);
    ctx.stroke();

    // Head
    const glow = ctx.createRadialGradient(x, y, 0, x, y, this.size * 4);
    glow.addColorStop(0, `rgba(0, 243, 255, ${0.9 * alpha})`);
    glow.addColorStop(0.5, `rgba(0, 243, 255, ${0.2 * alpha})`);
    glow.addColorStop(1, 'rgba(0, 243, 255, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, this.size * 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

export default function Preloader({ onComplete }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const hudRef = useRef(null);
  const textRef = useRef(null);
  const logoRef = useRef(null);
  const flashRef = useRef(null);
  const scanlineRef = useRef(null);
  const gridRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const progressBarRef = useRef(null);
  const ecgRef = useRef(null);

  const [phase, setPhase] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [subText, setSubText] = useState('');
  const [nodeCount, setNodeCount] = useState(0);
  const [progress, setProgress] = useState(0);

  const animRef = useRef(null);
  const nodesRef = useRef([]);
  const pulsesRef = useRef([]);
  const connectionsRef = useRef([]);
  const phaseRef = useRef({ networkAlpha: 0, connectionAlpha: 0 });

  // ECG waveform drawing
  const drawECG = useCallback((ctx, cx, cy, radius, time, alpha) => {
    ctx.strokeStyle = `rgba(0, 255, 102, ${0.7 * alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    const points = 120;
    for (let i = 0; i < points; i++) {
      const t = i / points;
      const angle = t * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      
      // Generate ECG-style wave
      let wave = 0;
      const pos = (t + time * 0.3) % 1;
      if (pos > 0.1 && pos < 0.12) wave = 3;
      else if (pos > 0.12 && pos < 0.15) wave = -8;
      else if (pos > 0.15 && pos < 0.2) wave = 15;
      else if (pos > 0.2 && pos < 0.25) wave = -5;
      else if (pos > 0.25 && pos < 0.3) wave = 2;
      else wave = Math.sin(pos * 20) * 0.3;
      
      const y = cy + Math.sin(angle) * radius + wave;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Hi-DPI setup
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => window.innerWidth;
    const H = () => window.innerHeight;

    // Create neural network nodes
    const nodeCount = Math.min(80, Math.floor((W() * H()) / 12000));
    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(new Node(
        100 + Math.random() * (W() - 200),
        100 + Math.random() * (H() - 200),
        { width: W(), height: H() }
      ));
    }
    nodesRef.current = nodes;

    // Build connections (nearest neighbors)
    const connections = [];
    nodes.forEach((node, i) => {
      const distances = nodes
        .map((other, j) => ({ node: other, dist: Math.hypot(node.x - other.x, node.y - other.y), idx: j }))
        .filter(d => d.idx !== i)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 3);
      
      distances.forEach(d => {
        if (d.dist < 250) {
          connections.push({ a: node, b: d.node });
          node.connections.push(d.node);
        }
      });
    });
    connectionsRef.current = connections;

    let pulses = [];
    pulsesRef.current = pulses;

    // ═══════════════════════════════════════
    // GSAP MASTER TIMELINE
    // ═══════════════════════════════════════
    const tl = gsap.timeline({
      onComplete: () => {
        // Final transition
        gsap.to(overlayRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => onComplete && onComplete()
        });
      }
    });

    // ── PHASE 1: System Awakening (0s - 2s) ──
    tl.to(gridRef.current, { opacity: 0.15, duration: 1.5, ease: 'power2.inOut' }, 0);
    tl.to(scanlineRef.current, { opacity: 0.3, duration: 0.5, ease: 'power1.in' }, 0.5);
    tl.to(phaseRef.current, { networkAlpha: 0.4, duration: 2, ease: 'power2.out' }, 0.5);
    tl.call(() => setPhase(1), [], 0);
    tl.call(() => setStatusText('SYSTEM BOOT'), [], 0.3);
    tl.call(() => setSubText('Initializing kernel...'), [], 0.5);
    tl.call(() => setProgress(5), [], 0.5);
    tl.call(() => setProgress(12), [], 1.0);
    tl.call(() => setSubText('Loading neural cores...'), [], 1.5);
    tl.call(() => setProgress(18), [], 1.8);

    // ── PHASE 2: Neural Network Formation (2s - 5s) ──
    tl.call(() => setPhase(2), [], 2);
    tl.call(() => setStatusText('NEURAL MESH SYNCING'), [], 2);
    tl.call(() => setSubText('Establishing node connections...'), [], 2.2);
    
    // Fade in nodes progressively
    nodes.forEach((node, i) => {
      const delay = 2 + (i / nodes.length) * 2;
      tl.to(node, { alpha: 1, duration: 0.5, ease: 'power2.out' }, delay);
      tl.call(() => setNodeCount(c => Math.min(nodes.length, i + 1)), [], delay);
    });
    
    tl.to(phaseRef.current, { networkAlpha: 1, connectionAlpha: 0.6, duration: 1.5, ease: 'power2.inOut' }, 2.5);
    tl.call(() => setProgress(35), [], 2.5);
    tl.call(() => setSubText('Mapping hospital topology...'), [], 3);
    tl.call(() => setProgress(48), [], 3.5);
    tl.call(() => setSubText('Syncing emergency protocols...'), [], 4);
    tl.call(() => setProgress(62), [], 4.5);

    // Start spawning pulses at phase 2
    tl.call(() => {
      const spawnPulses = () => {
        if (pulsesRef.current.length < 15) {
          const conn = connections[Math.floor(Math.random() * connections.length)];
          if (conn) pulsesRef.current.push(new Pulse(conn.a, conn.b));
        }
      };
      const pulseInterval = setInterval(spawnPulses, 200);
      setTimeout(() => clearInterval(pulseInterval), 7000);
    }, [], 2.5);

    // ── PHASE 3: Intelligence Activation (5s - 7s) ──
    tl.call(() => setPhase(3), [], 5);
    tl.call(() => setStatusText('INITIALIZING VITALOPS AI'), [], 5);
    tl.call(() => setSubText('Loading emergency response modules...'), [], 5.2);
    tl.call(() => setProgress(72), [], 5.2);
    tl.to(hudRef.current, { opacity: 1, scale: 1, duration: 1.2, ease: 'back.out(1.2)' }, 5);
    tl.to(ecgRef.current, { opacity: 1, duration: 0.8, ease: 'power2.out' }, 5.5);
    tl.call(() => setSubText('Syncing hospital network nodes...'), [], 6);
    tl.call(() => setProgress(85), [], 6.2);
    tl.call(() => setSubText('Calibrating AI anomaly detection...'), [], 6.5);
    tl.call(() => setProgress(94), [], 6.8);

    // ── PHASE 4: System Ready Transition (7s - 10s) ──
    tl.call(() => setPhase(4), [], 7.5);
    tl.call(() => setStatusText('SYSTEM READY'), [], 7.5);
    tl.call(() => setSubText('All modules operational'), [], 7.5);
    tl.call(() => setProgress(100), [], 7.5);

    // Collapse network to center
    nodes.forEach(node => {
      tl.to(node, { 
        x: W() / 2, y: H() / 2, alpha: 0,
        duration: 1.2, ease: 'power3.in' 
      }, 7.8);
    });

    // Flash
    tl.to(flashRef.current, { opacity: 1, duration: 0.15, ease: 'power4.in' }, 8.5);
    tl.to(flashRef.current, { opacity: 0, duration: 0.6, ease: 'power2.out' }, 8.65);

    // Logo appearance
    tl.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.5)' }, 8.7);
    tl.to(hudRef.current, { opacity: 0, duration: 0.5 }, 8.5);
    tl.to(phaseRef.current, { connectionAlpha: 0, networkAlpha: 0, duration: 0.5 }, 8.5);

    // Hold logo for a moment, then complete
    tl.to(logoRef.current, { opacity: 0, scale: 1.1, duration: 0.6, ease: 'power2.in' }, 9.5);

    // ═══════════════════════════════════════
    // RENDER LOOP
    // ═══════════════════════════════════════
    let startTime = performance.now();
    const render = (now) => {
      const time = (now - startTime) / 1000;
      const w = W();
      const h = H();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // Background
      ctx.fillStyle = '#030712';
      ctx.fillRect(0, 0, w, h);

      // Center glow
      const centerGlow = ctx.createRadialGradient(w/2, h/2, 0, w/2, h/2, w * 0.5);
      centerGlow.addColorStop(0, `rgba(0, 50, 80, ${0.3 * phaseRef.current.networkAlpha})`);
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, w, h);

      // Draw connections
      const ca = phaseRef.current.connectionAlpha;
      if (ca > 0) {
        connections.forEach(conn => {
          const nodeAlpha = Math.min(conn.a.alpha, conn.b.alpha);
          if (nodeAlpha <= 0) return;
          ctx.strokeStyle = `rgba(0, 180, 220, ${0.12 * ca * nodeAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(conn.a.x, conn.a.y);
          ctx.lineTo(conn.b.x, conn.b.y);
          ctx.stroke();
        });
      }

      // Draw pulses
      pulsesRef.current = pulsesRef.current.filter(p => p.alive);
      pulsesRef.current.forEach(pulse => {
        pulse.update();
        pulse.draw(ctx, ca);
      });

      // Draw nodes
      const na = phaseRef.current.networkAlpha;
      nodes.forEach(node => {
        node.canvas = { width: w, height: h };
        node.update(time);
        node.draw(ctx, na);
      });

      // ECG waveform around HUD
      if (hudRef.current && parseFloat(getComputedStyle(hudRef.current).opacity) > 0.1) {
        drawECG(ctx, w/2, h/2, Math.min(w, h) * 0.22, time, phaseRef.current.networkAlpha);
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      tl.kill();
    };
  }, [onComplete, drawECG]);

  return (
    <div ref={overlayRef} style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: '#030712', overflow: 'hidden',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif"
    }}>
      {/* Neural Network Canvas */}
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Grid Overlay */}
      <div ref={gridRef} style={{
        position: 'absolute', inset: 0, opacity: 0,
        backgroundImage: `
          linear-gradient(rgba(0, 243, 255, 0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 243, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none'
      }} />

      {/* Scanline */}
      <div ref={scanlineRef} style={{
        position: 'absolute', left: 0, right: 0, height: '2px', opacity: 0,
        background: 'linear-gradient(90deg, transparent, rgba(0, 243, 255, 0.4), transparent)',
        animation: 'scanline 3s linear infinite',
        pointerEvents: 'none'
      }} />

      {/* HUD Rings */}
      <div ref={hudRef} style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) scale(0.8)',
        opacity: 0,
        pointerEvents: 'none'
      }}>
        {/* Outer Ring */}
        <div style={{
          width: `${Math.min(400, Math.max(250, window.innerWidth * 0.25))}px`,
          height: `${Math.min(400, Math.max(250, window.innerWidth * 0.25))}px`,
          borderRadius: '50%',
          border: '1px solid rgba(0, 243, 255, 0.2)',
          position: 'relative',
          animation: 'rotateRing 12s linear infinite'
        }}>
          {/* Ring markers */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => (
            <div key={angle} style={{
              position: 'absolute',
              top: '50%', left: '50%',
              width: '8px', height: '8px',
              background: 'rgba(0, 243, 255, 0.6)',
              borderRadius: '50%',
              transform: `rotate(${angle}deg) translateX(${Math.min(200, Math.max(125, window.innerWidth * 0.125))}px) translate(-50%, -50%)`,
              boxShadow: '0 0 6px rgba(0, 243, 255, 0.5)'
            }} />
          ))}
        </div>

        {/* Inner Ring */}
        <div style={{
          position: 'absolute', inset: '20%',
          borderRadius: '50%',
          border: '1px dashed rgba(0, 243, 255, 0.15)',
          animation: 'rotateRing 8s linear infinite reverse'
        }} />

        {/* Medical Cross */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: 0.25
        }}>
          <div style={{ width: '3px', height: '30px', background: 'rgba(0, 243, 255, 0.6)', margin: '0 auto' }} />
          <div style={{ width: '30px', height: '3px', background: 'rgba(0, 243, 255, 0.6)', marginTop: '-16px' }} />
        </div>
      </div>

      {/* ECG Ring placeholder */}
      <div ref={ecgRef} style={{ position: 'absolute', inset: 0, opacity: 0, pointerEvents: 'none' }} />

      {/* Flash */}
      <div ref={flashRef} style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(circle, rgba(0, 243, 255, 0.8), rgba(0, 243, 255, 0.1), transparent)',
        opacity: 0,
        pointerEvents: 'none'
      }} />

      {/* Logo */}
      <div ref={logoRef} style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%) scale(0.8)',
        opacity: 0,
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{
          width: '72px', height: '72px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #00f3ff, #0d9488)',
          display: 'grid', placeItems: 'center',
          margin: '0 auto 1.5rem auto',
          boxShadow: '0 0 40px rgba(0, 243, 255, 0.4), 0 0 80px rgba(0, 243, 255, 0.2)'
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h1 style={{
          fontSize: '2.5rem', fontWeight: 800,
          background: 'linear-gradient(135deg, #00f3ff, #2dd4bf)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em', margin: 0
        }}>
          VitalOps AI
        </h1>
        <p style={{
          color: '#94a3b8', fontSize: '0.85rem',
          textTransform: 'uppercase', letterSpacing: '0.25em',
          margin: '0.5rem 0 0 0'
        }}>
          System Ready
        </p>
      </div>

      {/* Bottom Status Panel */}
      <div ref={textRef} style={{
        position: 'absolute',
        bottom: '3rem', left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center',
        width: '100%', maxWidth: '600px',
        padding: '0 2rem'
      }}>
        {/* Status Text */}
        <div style={{
          fontSize: '0.72rem',
          color: '#00f3ff',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textShadow: '0 0 15px rgba(0, 243, 255, 0.5)'
        }}>
          {statusText}
        </div>

        {/* Sub Text */}
        <div style={{
          fontSize: '0.78rem',
          color: '#64748b',
          marginBottom: '1.25rem',
          minHeight: '1.2em'
        }}>
          {subText}
        </div>

        {/* Progress Bar */}
        <div ref={progressBarRef} style={{
          width: '100%', maxWidth: '360px',
          height: '2px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '1px',
          margin: '0 auto 1rem auto',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: 'linear-gradient(90deg, rgba(0, 243, 255, 0.3), #00f3ff)',
            borderRadius: '1px',
            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 0 10px rgba(0, 243, 255, 0.4)'
          }} />
        </div>

        {/* Counter Row */}
        <div ref={counterRef} style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2.5rem',
          fontSize: '0.68rem',
          color: '#475569'
        }}>
          <span>NODES: <span style={{ color: '#00f3ff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{nodeCount}</span></span>
          <span>SYNC: <span style={{ color: '#00f3ff', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{progress}%</span></span>
          <span>LATENCY: <span style={{ color: '#00ff66', fontWeight: 700 }}>8ms</span></span>
        </div>
      </div>

      {/* Top-left system info */}
      <div style={{
        position: 'absolute', top: '2rem', left: '2rem',
        fontSize: '0.65rem', color: '#334155',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        lineHeight: 1.8
      }}>
        <div>VitalOps AI v4.2.1</div>
        <div>Build: <span style={{ color: '#475569' }}>2026.04.28</span></div>
        <div>Protocol: <span style={{ color: '#475569' }}>AES-256-GCM</span></div>
      </div>

      {/* Top-right time */}
      <div style={{
        position: 'absolute', top: '2rem', right: '2rem',
        fontSize: '0.65rem', color: '#334155',
        letterSpacing: '0.08em', textTransform: 'uppercase',
        textAlign: 'right', lineHeight: 1.8
      }}>
        <div>{new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
        <div>Mumbai, India</div>
        <div>Sector: <span style={{ color: '#475569' }}>COOPER-MED</span></div>
      </div>

      <style>{`
        @keyframes scanline {
          from { top: -2px; }
          to { top: 100%; }
        }
        @keyframes rotateRing {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
