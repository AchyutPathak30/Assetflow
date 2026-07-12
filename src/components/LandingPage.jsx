import React, { useEffect, useRef, useState } from 'react';

const COLORS = {
  bg: '#F3F7FC',
  panel: '#FFFFFF',
  navy: '#16233D',
  accent: '#4C8DFF',
  border: '#E1E9F4',
  textSecondary: '#5B6B82',
  textMuted: '#8A96A8',
  success: '#1F7A5C',
  successBg: '#E7F5EF',
  warning: '#B5721F',
  warningBg: '#FCEFDE',
  danger: '#C1502E',
  dangerBg: '#FBEAE4',
  purple: '#6B5FCF',
  purpleBg: '#EEEBFB',
};

const STATUS_STYLES = {
  'Available': { bg: '#E7F5EF', text: '#1F7A5C' },
  'Allocated': { bg: '#E7EFFC', text: '#4C8DFF' },
  'Reserved': { bg: '#FCEFDE', text: '#B5721F' },
  'Under maintenance': { bg: '#EEEBFB', text: '#6B5FCF' },
  'Lost': { bg: '#FBEAE4', text: '#C1502E' },
};

const LEDGER_DATA = [
  { tag: 'AF-0114', name: 'Dell Latitude 5420', states: ['Allocated', 'Under maintenance', 'Available'] },
  { tag: 'AF-0208', name: 'Conference Room B2', states: ['Reserved', 'Available', 'Reserved'] },
  { tag: 'AF-0301', name: 'MacBook Pro 16"', states: ['Available', 'Allocated', 'Allocated'] },
  { tag: 'AF-0042', name: 'Projector — HR floor', states: ['Under maintenance', 'Available', 'Available'] },
];

const LC_STATES = [
  { label: 'Available', bg: '#E7F5EF', text: '#1F7A5C', hint: 'on register' },
  { label: 'Allocated', bg: '#E7EFFC', text: '#4C8DFF', hint: 'assigned' },
  { label: 'Reserved', bg: '#FCEFDE', text: '#B5721F', hint: 'booked slot' },
  { label: 'Under Maintenance', bg: '#EEEBFB', text: '#6B5FCF', hint: 'approved repair' },
  { label: 'Lost', bg: '#FBEAE4', text: '#C1502E', hint: 'audit flag' },
  { label: 'Retired', bg: '#EEF1F5', text: '#5B6B82', hint: 'end of use' },
  { label: 'Disposed', bg: '#EEF1F5', text: '#8A96A8', hint: 'terminal' },
];

export default function LandingPage({ onLogin, onSignup }) {
  const canvasRef = useRef(null);
  const [ledgerStates, setLedgerStates] = useState([0, 0, 0, 0]);

  // Live Ledger rotation
  useEffect(() => {
    const intervals = LEDGER_DATA.map((item, i) => {
      return setInterval(() => {
        setLedgerStates(prev => {
          const next = [...prev];
          next[i] = (next[i] + 1) % item.states.length;
          return next;
        });
      }, 2600 + i * 900);
    });

    return () => intervals.forEach(clearInterval);
  }, []);

  // Fluid Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const BASE = COLORS.bg;

    let w, h, dpr;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    let target = { x: w / 2, y: h * 0.32 };
    let hasPointer = false;

    const handleMouseMove = (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
      hasPointer = true;
    };
    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        target.x = e.touches[0].clientX;
        target.y = e.touches[0].clientY;
        hasPointer = true;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const blobs = [
      { x: target.x, y: target.y, size: 340, ease: 0.045, color: '76,141,255', alpha: 0.16 },
      { x: target.x, y: target.y, size: 300, ease: 0.030, color: '107,95,207', alpha: 0.14 },
      { x: target.x, y: target.y, size: 260, ease: 0.065, color: '242,169,208', alpha: 0.13 },
      { x: target.x, y: target.y, size: 220, ease: 0.022, color: '138,180,255', alpha: 0.15 },
    ];

    let t = 0;
    let animId;

    function draw() {
      t += 0.006;
      const driftX = hasPointer ? 0 : Math.sin(t) * 60;
      const driftY = hasPointer ? 0 : Math.cos(t * 0.8) * 40;

      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);

      blobs.forEach((b, i) => {
        const tx = target.x + driftX * (i % 2 === 0 ? 1 : -1);
        const ty = target.y + driftY * (i % 2 === 0 ? 1 : -1);
        b.x += (tx - b.x) * b.ease;
        b.y += (ty - b.y) * b.ease;
        const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
        g.addColorStop(0, `rgba(${b.color},${b.alpha})`);
        g.addColorStop(1, `rgba(${b.color},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, g, g); // Drawing gradient
        ctx.fillRect(0, 0, w, h);
      });

      animId = requestAnimationFrame(draw);
    }

    if (reduceMotion) {
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);
    } else {
      draw();
    }

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', background: COLORS.bg, overflowX: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(243,247,252,0.86)', backdropFilter: 'blur(10px)', borderBottom: `0.5px solid ${COLORS.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68, maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, fontWeight: 600, fontSize: 17, color: COLORS.navy }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: COLORS.navy, display: 'flex', alignItems: 'center', justifyContext: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ width: 13, height: 13, background: COLORS.accent, borderRadius: 3, transform: 'rotate(45deg)' }}></span>
            </div>
            <span>AssetFlow</span>
          </div>
          <button onClick={onLogin} style={{ background: COLORS.navy, color: '#fff', borderRadius: 8, padding: '9px 18px', fontSize: '13.5px', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Log in
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header style={{ padding: '5.5rem 0 4.5rem', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '3.5rem', alignItems: 'center' }}>
            <div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 500, color: COLORS.accent, background: '#E7EFFC', border: '0.5px solid #CFE0FC', borderRadius: 20, padding: '6px 12px 6px 10px', letterSpacing: '0.02em' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.success, boxShadow: `0 0 0 3px ${COLORS.successBg}` }} />
                Built for departments, floors & fleets — not one industry
              </span>
              
              <h1 style={{ fontSize: 'clamp(2.4rem, 4.4vw, 3.6rem)', lineHeight: 1.05, fontWeight: 600, letterSpacing: '-0.02em', marginTop: '1rem', color: COLORS.navy }}>
                Stop asking<br />"who has <span style={{ color: COLORS.accent }}>AF-0114</span>?"
              </h1>
              
              <p style={{ marginTop: '1.35rem', fontSize: '16.5px', lineHeight: 1.6, color: COLORS.textSecondary, maxWidth: 480 }}>
                AssetFlow replaces the spreadsheet with a real system of record — asset lifecycle, allocation, shared-resource booking, maintenance approvals and audits, all in one place, for any organization with things to keep track of.
              </p>
              
              <div style={{ display: 'flex', gap: 12, marginTop: '2rem', flexWrap: 'wrap' }}>
                <button onClick={onLogin} style={{ background: COLORS.accent, color: '#fff', padding: '13px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 20px -6px rgba(76,141,255,0.55)' }}>
                  Log in
                </button>
                <a href="#modules" style={{ background: '#fff', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`, padding: '13px 22px', borderRadius: 9, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
                  See the modules
                </a>
              </div>

              <div style={{ display: 'flex', gap: '1.75rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  <strong style={{ display: 'block', fontSize: 19, color: COLORS.navy, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>7</strong>
                  lifecycle states
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  <strong style={{ display: 'block', fontSize: 19, color: COLORS.navy, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>0</strong>
                  double-allocations
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>
                  <strong style={{ display: 'block', fontSize: 19, color: COLORS.navy, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>4</strong>
                  role-based workflows
                </div>
              </div>
            </div>

            {/* Live Ledger Card */}
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 16, boxShadow: '0 24px 60px -20px rgba(22,35,61,0.18)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg }}>
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: COLORS.textMuted, letterSpacing: '0.03em', textTransform: 'uppercase' }}>Asset ledger</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: COLORS.success, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLORS.success, animation: 'blink 1.6s infinite' }} />
                  real-time
                </span>
              </div>

              <div>
                {LEDGER_DATA.map((item, i) => {
                  const stateVal = item.states[ledgerStates[i]];
                  const style = STATUS_STYLES[stateVal] || { bg: '#EEF1F5', text: COLORS.textSecondary };
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: `0.5px solid ${COLORS.border}`, fontSize: 13 }}>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: '12.5px', color: COLORS.navy, width: 76, flexShrink: 0 }}>{item.tag}</span>
                      <span style={{ flex: 1, color: COLORS.navy, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                      <span style={{ fontSize: '10.5px', fontWeight: 600, padding: '4px 10px', borderRadius: 6, background: style.bg, color: style.text, transition: 'all 0.5s ease', flexShrink: 0 }}>{stateVal}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '12px 18px', fontSize: '11.5px', color: COLORS.textMuted, background: COLORS.bg, borderTop: `0.5px solid ${COLORS.border}` }}>
                Status updates propagate to allocation, maintenance & dashboard instantly.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Problem Section */}
      <section style={{ padding: '4.5rem 0', background: COLORS.navy, color: '#fff', borderRadius: 20, margin: '0 2.5rem 4.5rem' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: '#8AB4FF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>The problem</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem', color: '#fff' }}>Spreadsheets don't know where anything actually is.</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.75rem', marginTop: '2.25rem' }}>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: '1rem' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#EF9E85' }}>// no source of truth</div>
              <p style={{ marginTop: 8, fontSize: 14, color: '#C6D1E3', lineHeight: 1.55 }}>A laptop shows "with Priya" in one tab and "returned" in another. Nobody trusts the sheet enough to stop asking around.</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: '1rem' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#EF9E85' }}>// double-bookings</div>
              <p style={{ marginTop: 8, fontSize: 14, color: '#C6D1E3', lineHeight: 1.55 }}>Two teams book Conference Room B2 for the same hour because nothing checks for overlap until someone's standing at the door.</p>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.14)', paddingTop: '1rem' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#EF9E85' }}>// silent repairs</div>
              <p style={{ marginTop: 8, fontSize: 14, color: '#C6D1E3', lineHeight: 1.55 }}>Maintenance starts before anyone approves it, budgets included — and there's no record of who signed off.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: COLORS.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Modules</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem', color: COLORS.navy }}>Ten screens, one shared data model</h2>
          <p style={{ color: COLORS.textSecondary, fontSize: 15, marginTop: '0.9rem', maxWidth: 560, lineHeight: 1.6 }}>Every module reads and writes the same departments, employees, assets and bookings — nothing lives in its own silo.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginTop: '2.75rem' }}>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>ORG SETUP</span>
              <h3 style={{ fontSize: '16.5px', fontWeight: 600, marginTop: 14 }}>Departments & categories</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Admins define departments (with hierarchy), asset categories with custom fields, and the employee directory everything else references.</p>
            </div>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>DIRECTORY</span>
              <h3>Registration & tracking</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Auto-tagged assets (AF-0001…) with acquisition data, condition, and full allocation + maintenance history in one record.</p>
            </div>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>ALLOCATION</span>
              <h3>Allocation & transfer</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Assigning a held asset doesn't fail silently — it shows who has it and offers a transfer request instead of a dead end.</p>
            </div>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>BOOKING</span>
              <h3>Resource booking</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Rooms, vehicles and equipment booked by time slot. A 9:30–10:30 request against a 9:00–10:00 booking is rejected automatically.</p>
            </div>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>MAINTENANCE</span>
              <h3>Approval workflow</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Pending → Approved → Technician assigned → Resolved. The asset only flips to Under Maintenance once approval clears.</p>
            </div>
            <div style={{ background: COLORS.panel, border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.6rem' }}>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, color: COLORS.accent, background: '#E7EFFC', padding: '4px 9px', borderRadius: 6 }}>AUDIT</span>
              <h3>Audit cycles</h3>
              <p style={{ fontSize: '13.5px', color: COLORS.textSecondary, marginTop: 8, lineHeight: 1.55 }}>Scoped audit runs with assigned auditors, per-item Verified/Missing/Damaged marks, and auto-generated discrepancy reports.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Diagram Section */}
      <section id="lifecycle" style={{ padding: '4.5rem 0', background: '#FFFFFF', borderTop: `0.5px solid ${COLORS.border}`, borderBottom: `0.5px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: COLORS.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Lifecycle</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem', color: COLORS.navy }}>Every asset moves through the same states</h2>
          <p style={{ color: COLORS.textSecondary, fontSize: 15, marginTop: '0.9rem', maxWidth: 560, lineHeight: 1.6 }}>Status isn't a free-text field — it's a controlled state machine, so the dashboard, notifications and reports always agree.</p>
          
          <div style={{ marginTop: '3rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 820 }}>
              {LC_STATES.map((s, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flexShrink: 0, width: 132 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, padding: '8px 14px', borderRadius: 8, textAlign: 'center', width: '100%', background: s.bg, color: s.text }}>{s.label}</div>
                    <div style={{ fontSize: '10.5px', color: COLORS.textMuted, textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace" }}>{s.hint}</div>
                  </div>
                  {i < LC_STATES.length - 1 && (
                    <div style={{ flex: '0 0 46px', height: 1, background: COLORS.border, position: 'relative', marginTop: -20, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <span style={{ color: COLORS.textMuted, fontSize: 14, transform: 'translateY(-50%)', position: 'absolute', right: -4 }}>→</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section id="workflow" style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: COLORS.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Workflow</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem', color: COLORS.navy }}>From registration to retirement</h2>
          <div style={{ display: 'flex', gap: 0, marginTop: '2.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200, borderLeft: `2px solid ${COLORS.border}`, padding: '0 1.4rem 1.4rem 1.4rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -6, top: 0, width: 10, height: 10, borderRadius: '50%', background: COLORS.accent, border: '2px solid #fff', boxShadow: `0 0 0 1px ${COLORS.accent}` }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>register</div>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Asset Manager registers it</h5>
              <p style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 6, lineHeight: 1.5 }}>Enters the system Available, with a category, tag and condition.</p>
            </div>
            <div style={{ flex: 1, minWidth: 200, borderLeft: `2px solid ${COLORS.border}`, padding: '0 1.4rem 1.4rem 1.4rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -6, top: 0, width: 10, height: 10, borderRadius: '50%', background: COLORS.accent, border: '2px solid #fff', boxShadow: `0 0 0 1px ${COLORS.accent}` }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>allocate</div>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Allocated or booked</h5>
              <p style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 6, lineHeight: 1.5 }}>Assigned to a person/department, or flagged shared & bookable by time slot.</p>
            </div>
            <div style={{ flex: 1, minWidth: 200, borderLeft: `2px solid ${COLORS.border}`, padding: '0 1.4rem 1.4rem 1.4rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -6, top: 0, width: 10, height: 10, borderRadius: '50%', background: COLORS.accent, border: '2px solid #fff', boxShadow: `0 0 0 1px ${COLORS.accent}` }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>maintain</div>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Repairs go through approval</h5>
              <p style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 6, lineHeight: 1.5 }}>Request → approval → Under Maintenance → Resolved → back to Available.</p>
            </div>
            <div style={{ flex: 1, minWidth: 200, borderLeft: `2px solid ${COLORS.border}`, padding: '0 1.4rem 1.4rem 1.4rem', position: 'relative' }}>
              <span style={{ position: 'absolute', left: -6, top: 0, width: 10, height: 10, borderRadius: '50%', background: COLORS.accent, border: '2px solid #fff', boxShadow: `0 0 0 1px ${COLORS.accent}` }} />
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.accent, fontWeight: 600 }}>audit</div>
              <h5 style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>Verified on a cycle</h5>
              <p style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 6, lineHeight: 1.5 }}>Auditors confirm it's where it should be; discrepancies flip status automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" style={{ padding: '4.5rem 0', background: '#FFFFFF', borderTop: `0.5px solid ${COLORS.border}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: COLORS.accent, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Roles</span>
          <h2 style={{ fontSize: 'clamp(1.7rem, 2.6vw, 2.3rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem', color: COLORS.navy }}>Access follows the org chart, not self-declaration</h2>
          <p style={{ color: COLORS.textSecondary, fontSize: 15, marginTop: '0.9rem', maxWidth: 560, lineHeight: 1.6 }}>Nobody signs up as an admin. Every account starts as Employee — roles are only ever granted from the Employee Directory.</p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.1rem', marginTop: '2.5rem' }}>
            <div style={{ border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.5rem', background: COLORS.panel }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.textMuted }}>01</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Admin</h4>
              <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Departments & categories</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Promotes roles</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Org-wide analytics</li>
              </ul>
            </div>
            <div style={{ border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.5rem', background: COLORS.panel }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.textMuted }}>02</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Asset Manager</h4>
              <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Registers & allocates</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Approves transfers & repairs</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Approves returns</li>
              </ul>
            </div>
            <div style={{ border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.5rem', background: COLORS.panel }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.textMuted }}>03</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Department Head</h4>
              <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Views department assets</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Approves dept. transfers</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Books on team's behalf</li>
              </ul>
            </div>
            <div style={{ border: `0.5px solid ${COLORS.border}`, borderRadius: 14, padding: '1.5rem', background: COLORS.panel }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: COLORS.textMuted }}>04</div>
              <h4 style={{ fontSize: 15, fontWeight: 600, marginTop: 8 }}>Employee</h4>
              <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none' }}>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Views assigned assets</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Books shared resources</li>
                <li style={{ fontSize: '12.5px', color: COLORS.textSecondary, marginTop: 7, paddingLeft: 14, position: 'relative' }}>Raises maintenance requests</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section */}
      <section id="login" style={{ padding: '4.5rem 0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 2.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #16233D 0%, #223458 100%)', borderRadius: 22, padding: '4rem 3rem', textAlign: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '11.5px', fontWeight: 600, color: '#8AB4FF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Get started</span>
            <h2 style={{ fontSize: 'clamp(1.7rem, 3vw, 2.4rem)', fontWeight: 600, letterSpacing: '-0.015em', marginTop: '0.6rem' }}>Bring every asset into one ledger.</h2>
            <p style={{ color: '#B9C6DE', marginTop: '1rem', fontSize: 15, maxWidth: 460, marginLeft: 'auto', marginRight: 'auto' }}>Sign in to register assets, manage allocations, and keep every department accountable.</p>
            
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: '2rem', flexWrap: 'wrap' }}>
              <button onClick={onLogin} style={{ background: '#fff', color: COLORS.navy, padding: '13px 24px', borderRadius: 9, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                Log in
              </button>
              <button onClick={onSignup} style={{ border: '0.5px solid rgba(255,255,255,0.3)', background: 'transparent', color: '#fff', padding: '13px 24px', borderRadius: 9, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>
                Create an account
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2.5rem 0 3rem', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: COLORS.textMuted }}>AssetFlow — Enterprise Asset & Resource Management System</p>
      </footer>
    </div>
  );
}
