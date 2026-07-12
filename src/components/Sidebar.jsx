// Sidebar.jsx
// Shared left nav used across all pages.
// Pass the logged-in user's role and which page is active.

import { useContext } from 'react';
import { StateContext } from '../context/StateContext';

const COLORS = {
  navy: '#16233D',
  accent: '#4C8DFF',
  border: '#E1E9F4',
  textSecondary: '#5B6B82',
  textMuted: '#8A96A8',
};

export const NAV_ITEMS = [
  { key: 'dashboard',   label: 'Dashboard',        icon: '◧',  roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'assets',      label: 'Assets',            icon: '▤',  roles: ['Asset Manager', 'Admin'] },
  { key: 'allocation',  label: 'Allocation',        icon: '⇄',  roles: ['Asset Manager', 'Department Head', 'Admin'] },
  { key: 'booking',     label: 'Resource booking',  icon: '▦',  roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'maintenance', label: 'Maintenance',       icon: '🔧', roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'audit',       label: 'Audit cycles',      icon: '✓',  roles: ['Asset Manager', 'Admin'] },
  { key: 'reports',     label: 'Reports',           icon: '▣',  roles: ['Asset Manager', 'Admin'] },
  { key: 'orgsetup',    label: 'Org setup',         icon: '⚙',  roles: ['Admin'] },
  { key: 'logs',        label: 'Logs',              icon: '≡',  roles: ['Asset Manager', 'Admin'] },
];

export default function Sidebar({ activeNav, onNavigate }) {
  const {
    currentUser,
    logoutUser,
    simulatedRole,
    setSimulatedRole,
    getActiveRole,
    getActiveUser
  } = useContext(StateContext);

  const role = getActiveRole();
  const activeUser = getActiveUser();
  const initials = activeUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AF';

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logoRow}>
        <div style={styles.logoMark}>
          <span style={{ color: '#5FA8FF', fontSize: 16 }}>◆</span>
        </div>
        <span style={styles.logoText}>AssetFlow</span>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV_ITEMS.filter(item => item.roles.includes(role)).map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate?.(item.key)}
            style={{
              ...styles.navItem,
              background: activeNav === item.key ? '#EAF1FC' : 'transparent',
              color:      activeNav === item.key ? COLORS.accent : COLORS.textSecondary,
              fontWeight: activeNav === item.key ? 500 : 400,
            }}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>



      {/* User footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.avatarCircle}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={styles.userName}>{activeUser?.name || currentUser?.name}</p>
          <p style={styles.userRole}>{role}</p>
        </div>
        <button
          onClick={logoutUser}
          title="Log out"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: COLORS.textMuted, padding: '4px', flexShrink: 0 }}
        >
          ⏏
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 232,
    background: '#FFFFFF',
    borderRight: `0.5px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    overflowY: 'auto',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '0 0.5rem', marginBottom: '2rem' },
  logoMark: { width: 26, height: 26, background: COLORS.navy, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 500, fontSize: 15, color: COLORS.navy },
  nav: { display: 'flex', flexDirection: 'column', gap: 2, flex: 1 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, border: 'none', textAlign: 'left',
    padding: '10px 12px', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'background 0.15s, color 0.15s',
  },
  navIcon: { fontSize: 15, width: 18, textAlign: 'center' },
  sidebarFooter: {
    display: 'flex', alignItems: 'center', gap: 10,
    paddingTop: '1rem', borderTop: `0.5px solid ${COLORS.border}`,
  },
  avatarCircle: {
    width: 32, height: 32, borderRadius: '50%', background: '#EAF1FC',
    color: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 500, flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 500, color: COLORS.navy, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: COLORS.textMuted, margin: 0 },

  simulatorRow: { display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 6px', background: '#F8FAFC', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, marginBottom: 14 },
  simulatorLabel: { fontSize: 11, fontWeight: 600, color: COLORS.navy, textTransform: 'uppercase', letterSpacing: '0.02em' },
  simulatorSelect: { height: 32, padding: '0 8px', borderRadius: 6, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 12, fontFamily: 'inherit', color: COLORS.navy, cursor: 'pointer' },
};
