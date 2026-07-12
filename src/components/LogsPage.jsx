// LogsPage.jsx
// Screen 10 — Two tabs: Notifications (user alerts — asset assigned,
// maintenance status, booking confirmation, transfer requests, overdue returns,
// and discrepancies) and the full Activity Log (detailed system audit trails).
// Wired to live StateContext — zero mock data.

import { useState, useMemo, useContext } from 'react';
import Sidebar from './Sidebar';
import { StateContext } from '../context/StateContext';

const COLORS = {
  bg: '#F3F7FC',
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

const NOTIF_TYPES = {
  'Asset Allocated':           { bg: '#E7EFFC', text: COLORS.accent, icon: '📦' },
  'Asset Assigned':            { bg: '#E7EFFC', text: COLORS.accent, icon: '📦' },
  'Maintenance Approved':      { bg: '#E7F5EF', text: '#1F7A5C', icon: '🔧' },
  'Maintenance Rejected':      { bg: '#FBEAE4', text: '#C1502E', icon: '🔧' },
  'Booking Confirmed':         { bg: '#E7F5EF', text: '#1F7A5C', icon: '📅' },
  'Booking Cancelled':         { bg: '#EEF1F5', text: COLORS.textSecondary, icon: '📅' },
  'Booking Reminder':          { bg: '#FCEFDE', text: '#B5721F', icon: '⏰' },
  'Transfer Requested':        { bg: '#FCEFDE', text: '#B5721F', icon: '🔁' },
  'Transfer Approved':         { bg: '#E7F5EF', text: '#1F7A5C', icon: '🔁' },
  'Transfer Rejected':         { bg: '#FBEAE4', text: '#C1502E', icon: '🔁' },
  'Overdue Asset Alert':       { bg: '#FBEAE4', text: '#C1502E', icon: '⚠️' },
  'Overdue Return Alert':      { bg: '#FBEAE4', text: '#C1502E', icon: '⚠️' },
  'Audit Discrepancy - Lost Asset': { bg: '#FBEAE4', text: '#C1502E', icon: '⚠️' },
  'Audit Discrepancy Flagged': { bg: '#FCEFDE', text: '#B5721F', icon: '📋' },
  'New Maintenance Request':   { bg: '#EEEBFB', text: '#6B5FCF', icon: '🔔' },
  'New Transfer Request':      { bg: '#EEEBFB', text: '#6B5FCF', icon: '🔔' },
};

const TABS = [
  { key: 'notifications', label: 'Notifications' },
  { key: 'activity',      label: 'Activity log' },
];

export default function LogsPage({ activeNav, setActiveNav }) {
  const {
    currentUser,
    notifications,
    logs,
    employees,
    markNotificationRead,
  } = useContext(StateContext);

  const role = currentUser?.role || 'Employee';

  const [activeTab, setActiveTab]     = useState('notifications');
  const [search, setSearch]           = useState('');
  const [actorFilter, setActorFilter] = useState('All actors');

  // Filter notifications belonging to current user
  const userNotifs = useMemo(() => {
    return notifications.filter(n => n.userId === currentUser?.id);
  }, [notifications, currentUser]);

  const unreadCount = useMemo(() => {
    return userNotifs.filter(n => !n.read).length;
  }, [userNotifs]);

  const markAllRead = () => {
    userNotifs.forEach(n => {
      if (!n.read) markNotificationRead(n.id);
    });
  };

  // Map actors and format logs dynamically
  const mappedLogs = useMemo(() => {
    return logs.map(l => {
      const actorObj = employees.find(e => e.id === l.userId);
      return {
        ...l,
        actorName: actorObj ? actorObj.name : 'System',
        actorRole: actorObj ? actorObj.role : 'System Automated',
      };
    });
  }, [logs, employees]);

  // List of unique actors for filters
  const actorsList = useMemo(() => {
    const names = Array.from(new Set(mappedLogs.map(l => l.actorName)));
    return ['All actors', ...names];
  }, [mappedLogs]);

  // Activity search + actor filter
  const filteredActivity = useMemo(() => {
    return mappedLogs.filter(l => {
      const q = search.toLowerCase();
      const matchSearch = !search
        || l.action?.toLowerCase().includes(q)
        || l.details?.toLowerCase().includes(q)
        || l.actorName?.toLowerCase().includes(q);
      const matchActor  = actorFilter === 'All actors' || l.actorName === actorFilter;
      return matchSearch && matchActor;
    });
  }, [mappedLogs, search, actorFilter]);

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Logs</h1>
            <p style={styles.pageSubtitle}>
              {unreadCount} unread alert{unreadCount !== 1 ? 's' : ''} · full operational trail
            </p>
          </div>
        </div>

        {/* ── Tab Selector ────────────────────────────────────── */}
        <div style={styles.tabRow}>
          {TABS.map(t => (
            <button
              key={t.key}
              style={{ ...styles.tabButton, ...(activeTab === t.key ? styles.tabButtonActive : {}) }}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              {t.key === 'notifications' && unreadCount > 0 && (
                <span style={styles.tabBadge}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Notifications Tab ────────────────────────────────── */}
        {activeTab === 'notifications' && (
          <>
            <div style={styles.filterRow}>
              <span style={{ flex: 1 }} />
              <button
                style={styles.secondaryButton}
                onClick={markAllRead}
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>

            <div style={styles.listCard}>
              {userNotifs.map(n => {
                const meta = NOTIF_TYPES[n.title] || { bg: '#EEF1F5', text: COLORS.textSecondary, icon: '🔔' };
                return (
                  <div
                    key={n.id}
                    style={{ ...styles.notifRow, ...(n.read ? {} : styles.notifRowUnread) }}
                    onClick={() => !n.read && markNotificationRead(n.id)}
                  >
                    <span style={{ ...styles.notifIcon, background: meta.bg, color: meta.text }}>
                      {meta.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={styles.notifType}>{n.title}</p>
                      <p style={styles.notifMessage}>{n.message}</p>
                    </div>
                    <div style={styles.notifRight}>
                      <span style={styles.notifTime}>{n.timestamp?.replace('T', ' ').substring(0, 16)}</span>
                      {!n.read && <span style={styles.unreadDot} />}
                    </div>
                  </div>
                );
              })}

              {userNotifs.length === 0 && (
                <div style={styles.emptyState}>No notifications to show.</div>
              )}
            </div>
          </>
        )}

        {/* ── Activity Tab ────────────────────────────────────── */}
        {activeTab === 'activity' && (
          <>
            <div style={styles.filterRow}>
              <input
                type="text"
                placeholder="Search action details or who performed them…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
              />
              <select
                value={actorFilter}
                onChange={e => setActorFilter(e.target.value)}
                style={styles.filterSelect}
              >
                {actorsList.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderRow}>
                <span style={{ ...styles.th, flex: 1.3 }}>User</span>
                <span style={{ ...styles.th, flex: '0 0 140px' }}>Role</span>
                <span style={{ ...styles.th, flex: 2.6 }}>Action Performed</span>
                <span style={{ ...styles.th, flex: 1 }}>Timestamp</span>
              </div>

              {filteredActivity.map(l => (
                <div key={l.id} style={styles.tableRow}>
                  <span style={{ ...styles.td, flex: 1.3, fontWeight: 500, color: COLORS.navy }}>
                    {l.actorName}
                  </span>
                  <span style={{ flex: '0 0 140px' }}>
                    <span style={styles.rolePill}>{l.actorRole}</span>
                  </span>
                  <span style={{ ...styles.td, flex: 2.6 }}>
                    <strong>{l.action}</strong>: {l.details}
                  </span>
                  <span style={{ ...styles.td, flex: 1, fontSize: 12, color: COLORS.textMuted }}>
                    {l.timestamp?.replace('T', ' ').substring(0, 16)}
                  </span>
                </div>
              ))}

              {filteredActivity.length === 0 && (
                <div style={styles.emptyState}>No activity match found.</div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  page:         { display: 'flex', width: '100vw', minHeight: '100vh', background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif" },
  main:         { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' },
  topBar:       { marginBottom: '1.25rem' },
  pageTitle:    { fontSize: 24, fontWeight: 500, color: COLORS.navy, margin: 0 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' },

  tabRow: { display: 'flex', gap: 4, borderBottom: `0.5px solid ${COLORS.border}`, marginBottom: '1.25rem' },
  tabButton: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 4px', marginRight: 24,
    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
    color: COLORS.textMuted, borderBottom: '2px solid transparent', fontFamily: 'inherit',
  },
  tabButtonActive: { color: COLORS.accent, borderBottom: `2px solid ${COLORS.accent}` },
  tabBadge:        { background: COLORS.danger, color: '#FFFFFF', fontSize: 10, fontWeight: 600, borderRadius: 10, padding: '1px 6px' },

  filterRow:       { display: 'flex', gap: 10, marginBottom: '1.25rem', alignItems: 'center' },
  searchInput:     { flex: 1, height: 40, padding: '0 14px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy },
  filterSelect:    { height: 40, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 13, fontFamily: 'inherit', color: COLORS.navy },
  secondaryButton: {
    background: '#FFFFFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '9px 14px', fontSize: 12.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },

  listCard:       { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  notifRow:       { display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: `0.5px solid ${COLORS.border}`, cursor: 'pointer', transition: 'background 0.1s' },
  notifRowUnread: { background: '#F7FAFF' },
  notifIcon:      { width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 },
  notifType:      { fontSize: 12.5, fontWeight: 600, color: COLORS.navy, margin: 0 },
  notifMessage:   { fontSize: 12.5, color: COLORS.textSecondary, margin: '3px 0 0', lineHeight: 1.5 },
  notifRight:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0, marginLeft: 16 },
  notifTime:      { fontSize: 11, color: COLORS.textMuted, whiteSpace: 'nowrap' },
  unreadDot:      { width: 7, height: 7, borderRadius: '50%', background: COLORS.accent },

  tableCard:      { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:             { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' },
  tableRow:       { display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: `0.5px solid ${COLORS.border}` },
  td:             { fontSize: 13, color: COLORS.textSecondary },
  rolePill:       { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, background: '#EEF1F5', color: COLORS.textSecondary },
  emptyState:     { padding: '2.5rem', textAlign: 'center', fontSize: 13, color: COLORS.textMuted },
};
