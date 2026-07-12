// LoginSignupPage.jsx
// Full desktop web layout (not a mobile card). Split-screen: left = branding +
// particle animation, right = auth form.

import { useState, useContext, useEffect, useRef } from 'react';

// ── Typewriter hook ──────────────────────────────────────────────
// Sequences through an array of strings, typing then pausing.
function useTypewriter(lines, { speed = 38, pause = 1400 } = {}) {
  const [displayed, setDisplayed] = useState('');
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (waiting) {
      const t = setTimeout(() => {
        const next = (lineIdx + 1) % lines.length;
        setLineIdx(next);
        setCharIdx(0);
        setDisplayed('');
        setWaiting(false);
      }, pause);
      return () => clearTimeout(t);
    }

    const currentLine = lines[lineIdx];
    if (charIdx < currentLine.length) {
      const t = setTimeout(() => {
        setDisplayed(currentLine.slice(0, charIdx + 1));
        setCharIdx((c) => c + 1);
      }, speed);
      return () => clearTimeout(t);
    } else {
      // Finished typing this line — pause before next
      if (lines.length > 1) setWaiting(true);
    }
  }, [charIdx, lineIdx, waiting, lines, speed, pause]);

  return displayed;
}
import ParticleBackground from './ParticleBackground';
import { StateContext } from '../context/StateContext';

const COLORS = {
  bg: '#EEF4FB',
  navy: '#16233D',
  accent: '#4C8DFF',
  border: '#D9E4F2',
  textSecondary: '#5B6B82',
  textMuted: '#8A96A8',
};

export default function LoginSignupPage() {
  const { loginUser, signupUser, departments } = useContext(StateContext);

  const [mode, setMode] = useState('login'); // 'login' | 'signup'

  // Typewriter data
  const heroTitle = useTypewriter(
    [
      'Know where everything is.\nAll the time.',
      'One platform.\nEvery asset.',
      'Book resources.\nTrack returns.',
    ],
    { speed: 40, pause: 2000 }
  );

  const subtitle = useTypewriter(
    [
      "Track assets, book shared resources, and manage your organization's equipment in one place.",
    ],
    { speed: 22, pause: 99999 } // types once, stays
  );
  const [showPw, setShowPw] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.name || 'Operations');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'login') {
      const res = loginUser(email, password);
      if (!res.success) {
        setError(res.message);
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill in all fields.');
        return;
      }
      const res = signupUser(name, email, password, selectedDept);
      if (res.success) {
        setSuccess(res.message);
        setMode('login');
        setName('');
        setPassword('');
      } else {
        setError(res.message);
      }
    }
  };

  return (
    <div style={styles.page}>
      {/* LEFT: branding + particle animation panel */}
      <div style={styles.leftPanel}>
        <ParticleBackground />
        <div style={styles.leftContent}>
          <div style={styles.logoRow}>
            <div style={styles.logoMark}>
              <span style={{ color: '#5FA8FF', fontSize: 20 }}>◆</span>
            </div>
            <span style={styles.logoText}>AssetFlow</span>
          </div>

          <h1 style={styles.heroTitle}>
            {heroTitle.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < heroTitle.split('\n').length - 1 && <br />}
              </span>
            ))}
            <span style={styles.cursor}>|</span>
          </h1>
          <p style={styles.heroSubtitle}>
            {subtitle}
            {subtitle.length < "Track assets, book shared resources, and manage your organization's equipment in one place.".length && (
              <span style={styles.cursor}>|</span>
            )}
          </p>

          <div style={styles.statsRow}>
            <div>
              <p style={styles.statNumber}>1,240</p>
              <p style={styles.statLabel}>assets tracked</p>
            </div>
            <div style={styles.statDivider} />
            <div>
              <p style={styles.statNumber}>98%</p>
              <p style={styles.statLabel}>on-time returns</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: auth form panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formWrap}>
          <div style={styles.tabs}>
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              style={{
                ...styles.tabButton,
                background: mode === 'login' ? COLORS.navy : 'transparent',
                color: mode === 'login' ? COLORS.bg : COLORS.textSecondary,
              }}
            >
              Log in
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              style={{
                ...styles.tabButton,
                background: mode === 'signup' ? COLORS.navy : 'transparent',
                color: mode === 'signup' ? COLORS.bg : COLORS.textSecondary,
              }}
            >
              Sign up
            </button>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: 13 }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ padding: '10px 14px', marginBottom: 16, borderRadius: 8, background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#16A34A', fontSize: 13 }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {mode === 'login' ? (
              <>
                <h2 style={styles.formTitle}>Welcome back</h2>
                <p style={styles.formSubtitle}>
                  Log in to track and manage your assets.
                </p>

                <label style={styles.label}>Work email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label style={styles.label}>Password</label>
                <div style={styles.pwWrap}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Enter your password"
                    style={{ ...styles.input, marginBottom: 0, paddingRight: 40 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={styles.pwToggle}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>

                <button type="submit" style={styles.primaryButton}>Log in</button>
              </>
            ) : (
              <>
                <h2 style={styles.formTitle}>Create your account</h2>
                <p style={styles.formSubtitle}>
                  You&apos;ll join as an employee. Roles are assigned by your
                  admin.
                </p>

                <label style={styles.label}>Full name</label>
                <input
                  type="text"
                  placeholder="Priya Shah"
                  style={styles.input}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <label style={styles.label}>Work email</label>
                <input
                  type="email"
                  placeholder="name@company.com"
                  style={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <label style={styles.label}>Department</label>
                <select
                  style={styles.input}
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <label style={styles.label}>Password</label>
                <div style={styles.pwWrap}>
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Create a password"
                    style={{ ...styles.input, marginBottom: 0, paddingRight: 40 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    style={styles.pwToggle}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? '🙈' : '👁'}
                  </button>
                </div>

                <button type="submit" style={styles.primaryButton}>Create account</button>
              </>
            )}
          </form>

          <p style={styles.footnote}>
            Only admins assign roles. New accounts always start as employee.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    width: '100vw',
    minHeight: '100vh',
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  leftPanel: {
    position: 'relative',
    flex: '1 1 58%',
    background: COLORS.bg,
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
  },
  leftContent: {
    position: 'relative',
    zIndex: 1,
    padding: '0 6vw',
    maxWidth: 640,
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: '3rem',
  },
  logoMark: {
    width: 32,
    height: 32,
    background: COLORS.navy,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontWeight: 500,
    fontSize: 17,
    color: COLORS.navy,
  },
  heroTitle: {
    fontSize: 'clamp(28px, 3.2vw, 44px)',
    fontWeight: 500,
    color: COLORS.navy,
    lineHeight: 1.2,
    margin: '0 0 1.25rem',
  },
  heroSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 1.6,
    maxWidth: 440,
    margin: '0 0 2.5rem',
  },
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  statDivider: {
    width: 1,
    height: 36,
    background: COLORS.border,
  },
  statNumber: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: 22,
    fontWeight: 500,
    color: COLORS.navy,
    margin: 0,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    margin: '2px 0 0',
  },
  rightPanel: {
    flex: '1 1 42%',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  formWrap: {
    width: '100%',
    maxWidth: 400,
  },
  tabs: {
    display: 'flex',
    background: '#F3F6FB',
    border: `0.5px solid ${COLORS.border}`,
    borderRadius: 10,
    padding: 4,
    marginBottom: '2rem',
  },
  tabButton: {
    flex: 1,
    border: 'none',
    fontSize: 13,
    fontWeight: 500,
    padding: '10px',
    borderRadius: 7,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 500,
    color: COLORS.navy,
    margin: '0 0 6px',
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    margin: '0 0 1.75rem',
  },
  label: {
    fontSize: 12,
    color: COLORS.navy,
    fontWeight: 500,
  },
  input: {
    width: '100%',
    margin: '6px 0 16px',
    padding: '0 14px',
    height: 44,
    borderRadius: 8,
    border: `0.5px solid ${COLORS.border}`,
    background: '#FFFFFF',
    fontSize: 14,
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    color: COLORS.navy,
  },
  pwWrap: {
    position: 'relative',
    marginBottom: '1.75rem',
  },
  pwToggle: {
    position: 'absolute',
    right: 12,
    top: 10,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    height: 46,
    background: COLORS.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    fontWeight: 500,
    fontSize: 15,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  cursor: {
    display: 'inline-block',
    width: 2,
    background: '#4C8DFF',
    marginLeft: 2,
    animation: 'blink 0.9s step-end infinite',
    verticalAlign: 'text-bottom',
  },
  footnote: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: '1.5rem',
  },
};
