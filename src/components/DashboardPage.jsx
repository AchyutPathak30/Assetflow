// DashboardPage.jsx
// Full desktop layout: fixed left sidebar + top bar + main content.
// Wired to real StateContext — role, user, and asset data are live.

import { useState, useContext } from 'react';
import { StateContext } from '../context/StateContext';
import Sidebar from './Sidebar';

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

const NAV_ITEMS = [
  { key: 'dashboard',  label: 'Dashboard',        icon: '◧', roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'assets',     label: 'Assets',            icon: '▤', roles: ['Asset Manager', 'Admin'] },
  { key: 'allocation', label: 'Allocation',        icon: '⇄', roles: ['Asset Manager', 'Department Head', 'Admin'] },
  { key: 'booking',    label: 'Resource booking',  icon: '▦', roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'maintenance',label: 'Maintenance',       icon: '🔧', roles: ['Employee', 'Department Head', 'Asset Manager', 'Admin'] },
  { key: 'audit',      label: 'Audit cycles',      icon: '✓',  roles: ['Asset Manager', 'Admin'] },
  { key: 'reports',    label: 'Reports',           icon: '▣',  roles: ['Asset Manager', 'Admin'] },
  { key: 'orgsetup',   label: 'Org setup',         icon: '⚙',  roles: ['Admin'] },
  { key: 'logs',       label: 'Logs',              icon: '≡',  roles: ['Asset Manager', 'Admin'] },
];

const STATUS_STYLES = {
  Available:          { bg: '#E7F5EF', text: '#1F7A5C' },
  Allocated:          { bg: '#E7EFFC', text: '#4C8DFF' },
  Reserved:           { bg: '#FCEFDE', text: '#B5721F' },
  'Under Maintenance':{ bg: '#EEEBFB', text: '#6B5FCF' },
  Lost:               { bg: '#FBEAE4', text: '#C1502E' },
  Retired:            { bg: '#F0F0F0', text: '#8A96A8' },
  Disposed:           { bg: '#F0F0F0', text: '#8A96A8' },
};

export default function DashboardPage({ activeNav, setActiveNav }) {
  const {
    currentUser,
    logoutUser,
    assets,
    allocations,
    bookings,
    maintenance,
    transfers,
    employees,
    notifications,
  } = useContext(StateContext);

  const role = currentUser?.role || 'Employee';

  // ── KPIs (live from state) ─────────────────────────────────────
  const todayStr = new Date().toISOString().substring(0, 10);

  const availableCount    = assets.filter(a => a.status === 'Available').length;
  const allocatedCount    = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount  = assets.filter(a => a.status === 'Under Maintenance').length;
  const activeBookings    = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfers  = (transfers || []).filter(t => t.status === 'Pending').length;
  const myAssets          = assets.filter(a => a.assignedTo === currentUser?.id);
  const myBookings        = bookings.filter(b => b.employeeId === currentUser?.id && (b.status === 'Upcoming' || b.status === 'Ongoing'));

  // Overdue returns
  const overdueAllocations = allocations.filter(al => {
    if (al.status !== 'Active' || !al.expectedReturnDate) return false;
    return new Date(al.expectedReturnDate) < new Date(todayStr);
  }).map(al => {
    const asset  = assets.find(a => a.id === al.assetId);
    const holder = employees.find(e => e.id === al.employeeId);
    return {
      ...al,
      tag:        asset?.tag || 'N/A',
      assetName:  asset?.name || 'Unknown',
      holderName: holder?.name || 'Unknown',
      daysLate:   Math.round((new Date(todayStr) - new Date(al.expectedReturnDate)) / 86400000),
    };
  });

  // Recent 3 assets
  const recentAssets = [...assets].slice(-3).reverse();

  // Donut breakdown
  const total     = assets.length || 1;
  const pctAvail  = Math.round((availableCount / total) * 100);
  const pctAlloc  = Math.round((allocatedCount / total) * 100);
  const pctMaint  = Math.round((maintenanceCount / total) * 100);
  const pctOther  = 100 - pctAvail - pctAlloc - pctMaint;

  // KPI card sets per role
  const kpis = role === 'Employee'
    ? [
        { label: 'My assets',        value: String(myAssets.length) },
        { label: 'Active bookings',  value: String(myBookings.length) },
        { label: 'Overdue returns',  value: String(overdueAllocations.filter(o => myAssets.find(a => a.id === o.assetId)).length) },
      ]
    : [
        { label: 'Assets available',  value: String(availableCount),   accent: true },
        { label: 'Assets allocated',  value: String(allocatedCount) },
        { label: 'Active bookings',   value: String(activeBookings) },
        { label: 'Pending transfers', value: String(pendingTransfers) },
      ];

  // Sidebar initials
  const initials = currentUser?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AF';

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main style={styles.main}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>
              {role === 'Employee'
                ? 'Your assets and bookings at a glance.'
                : 'Organization-wide snapshot, updated in real time.'}
            </p>
          </div>
          <div style={styles.quickActions}>
            {(role === 'Admin' || role === 'Asset Manager') && (
              <button style={styles.secondaryButton} onClick={() => setActiveNav('assets')}>
                + Register asset
              </button>
            )}
            <button style={styles.primaryButton} onClick={() => setActiveNav('booking')}>
              + Book resource
            </button>
          </div>
        </div>

        {/* Welcome / Onboarding Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #16233D 0%, #2A3F64 100%)',
          color: '#FFFFFF',
          borderRadius: 14,
          padding: '1.75rem 2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 8px 30px rgba(22,35,61,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, letterSpacing: '-0.015em' }}>
              Welcome to the AssetFlow Workspace
            </h2>
            <p style={{ fontSize: 13.5, color: '#B9C6DE', marginTop: 8, lineHeight: 1.5, margin: '8px 0 16px' }}>
              Your real-time system of record for tracking equipment lifecycles, allocations, shared bookings, approvals, and compliance audits across the organization.
            </p>
            
            {assets.length === 0 ? (
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '12px 16px', border: '1px solid rgba(255,255,255,0.12)' }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#EF9E85', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⚠️ Setup Required: No database records found
                </p>
                <ul style={{ paddingLeft: 16, margin: 0, fontSize: 12.5, color: '#D2DCEE', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <li>
                    <strong>Input Seed Data</strong>: Load your <code>seed.sql</code> file (located in your Downloads) directly in the Supabase SQL editor to auto-populate the system with 15 users, assets, and requests.
                  </li>
                  <li>
                    <strong>Add Manually</strong>: Or go to <strong>Org Setup (⚙️)</strong> to define your departments, categories, and begin registering new assets.
                  </li>
                </ul>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 12 }}>
                <span style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>
                  ✓ Core Schema Integrated
                </span>
                <span style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>
                  ✓ Live Supabase Auth Sync
                </span>
                <span style={{ background: 'rgba(255,255,255,0.12)', color: '#FFFFFF', padding: '4px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>
                  ✓ 7 lifecycle states
                </span>
              </div>
            )}
          </div>
        </div>

        {/* KPI cards */}
        <div style={styles.kpiGrid}>
          {kpis.map(kpi => (
            <div
              key={kpi.label}
              style={{ ...styles.kpiCard, background: kpi.accent ? COLORS.navy : '#FFFFFF' }}
            >
              <p style={{ ...styles.kpiLabel, color: kpi.accent ? '#B7C6E0' : COLORS.textMuted }}>
                {kpi.label}
              </p>
              <p style={{ ...styles.kpiValue, color: kpi.accent ? '#FFFFFF' : COLORS.navy }}>
                {kpi.value}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column area */}
        <div style={styles.twoColumn}>
          {/* LEFT */}
          <div style={styles.leftColumn}>
            {/* Overdue returns */}
            {overdueAllocations.length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <p style={styles.cardTitle}>Overdue returns</p>
                  <span style={styles.overdueBadge}>{overdueAllocations.length} overdue</span>
                </div>
                <div style={styles.list}>
                  {overdueAllocations.map(item => (
                    <div key={item.id} style={styles.overdueRow}>
                      <div style={styles.tagNotch} />
                      <div style={styles.rowContent}>
                        <div>
                          <span style={styles.tagMono}>{item.tag}</span>
                          <span style={styles.rowText}> {item.assetName}</span>
                          <p style={styles.rowSub}>Held by {item.holderName}</p>
                        </div>
                        <span style={styles.dangerPill}>{item.daysLate}d late</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent assets */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <p style={styles.cardTitle}>Recent assets</p>
                <button
                  onClick={() => setActiveNav('assets')}
                  style={{ ...styles.secondaryButton, padding: '5px 12px', fontSize: 12 }}
                >
                  View all
                </button>
              </div>
              <div style={styles.list}>
                {recentAssets.map(item => {
                  const s = STATUS_STYLES[item.status] || STATUS_STYLES.Available;
                  return (
                    <div key={item.id} style={styles.assetRow}>
                      <div style={styles.tagNotch} />
                      <div style={styles.rowContent}>
                        <div>
                          <span style={styles.tagMono}>{item.tag}</span>
                          <span style={styles.rowText}> {item.name}</span>
                        </div>
                        <span style={{ ...styles.statusPill, background: s.bg, color: s.text }}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending maintenance (managers) */}
            {(role === 'Admin' || role === 'Asset Manager') && maintenance.filter(m => m.status === 'Pending').length > 0 && (
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <p style={styles.cardTitle}>Pending maintenance approvals</p>
                  <span style={{ ...styles.overdueBadge, background: COLORS.warningBg, color: COLORS.warning }}>
                    {maintenance.filter(m => m.status === 'Pending').length} pending
                  </span>
                </div>
                <div style={styles.list}>
                  {maintenance.filter(m => m.status === 'Pending').map(m => {
                    const asset    = assets.find(a => a.id === m.assetId);
                    const reporter = employees.find(e => e.id === m.reportedBy);
                    return (
                      <div key={m.id} style={{ ...styles.assetRow, background: COLORS.warningBg }}>
                        <div style={styles.tagNotch} />
                        <div style={styles.rowContent}>
                          <div>
                            <span style={styles.tagMono}>{asset?.tag}</span>
                            <span style={styles.rowText}> {asset?.name}</span>
                            <p style={styles.rowSub}>Reported by {reporter?.name} · {m.priority} priority</p>
                          </div>
                          <button
                            style={{ ...styles.secondaryButton, padding: '4px 10px', fontSize: 11 }}
                            onClick={() => setActiveNav('maintenance')}
                          >
                            Review
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — donut chart */}
          <div style={styles.rightColumn}>
            <div style={styles.card}>
              <p style={styles.cardTitle}>Assets by status</p>
              <div style={styles.donutWrap}>
                <div
                  style={{
                    ...styles.donut,
                    background: `conic-gradient(
                      ${COLORS.success} 0% ${pctAvail}%,
                      ${COLORS.accent}  ${pctAvail}% ${pctAvail + pctAlloc}%,
                      ${COLORS.warning} ${pctAvail + pctAlloc}% ${pctAvail + pctAlloc + pctMaint}%,
                      ${COLORS.danger}  ${pctAvail + pctAlloc + pctMaint}% 100%
                    )`,
                  }}
                />
                <div style={styles.donutCenter}>
                  <p style={styles.donutNumber}>{assets.length}</p>
                  <p style={styles.donutLabel}>total assets</p>
                </div>
              </div>
              <div style={styles.legend}>
                <LegendRow color={COLORS.success} label="Available"    value={`${pctAvail}%`} />
                <LegendRow color={COLORS.accent}  label="Allocated"    value={`${pctAlloc}%`} />
                <LegendRow color={COLORS.warning} label="Maintenance"  value={`${pctMaint}%`} />
                <LegendRow color={COLORS.danger}  label="Other"        value={`${pctOther}%`} />
              </div>
            </div>

            {/* Quick upcoming bookings */}
            <div style={{ ...styles.card, marginTop: 16 }}>
              <div style={styles.cardHeader}>
                <p style={styles.cardTitle}>Upcoming bookings</p>
              </div>
              {bookings.filter(b => b.status === 'Upcoming').length === 0 ? (
                <p style={{ fontSize: 13, color: COLORS.textMuted, padding: '8px 0' }}>No upcoming bookings.</p>
              ) : (
                <div style={styles.list}>
                  {bookings.filter(b => b.status === 'Upcoming').slice(0, 3).map(b => {
                    const resource = assets.find(a => a.id === b.resourceId);
                    const booker   = employees.find(e => e.id === b.employeeId);
                    return (
                      <div key={b.id} style={{ ...styles.assetRow, background: '#EAF1FC' }}>
                        <div style={styles.tagNotch} />
                        <div style={styles.rowContent}>
                          <div>
                            <span style={styles.rowText}>{b.title}</span>
                            <p style={styles.rowSub}>{resource?.name} · {b.startTime.substring(11, 16)}–{b.endTime.substring(11, 16)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function LegendRow({ color, label, value }) {
  return (
    <div style={styles.legendRow}>
      <span style={{ ...styles.legendDot, background: color }} />
      <span style={styles.legendLabel}>{label}</span>
      <span style={styles.legendValue}>{value}</span>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    width: '100vw',
    minHeight: '100vh',
    background: COLORS.bg,
    fontFamily: "'IBM Plex Sans', sans-serif",
  },
  sidebar: {
    width: 232,
    background: '#FFFFFF',
    borderRight: `0.5px solid ${COLORS.border}`,
    display: 'flex',
    flexDirection: 'column',
    padding: '1.5rem 1rem',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
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
  sidebarFooter: { display: 'flex', alignItems: 'center', gap: 10, paddingTop: '1rem', borderTop: `0.5px solid ${COLORS.border}` },
  avatarCircle: {
    width: 32, height: 32, borderRadius: '50%', background: '#EAF1FC', color: COLORS.accent, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500,
  },
  userName: { fontSize: 13, fontWeight: 500, color: COLORS.navy, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: COLORS.textMuted, margin: 0 },
  main: { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem' },
  pageTitle: { fontSize: 24, fontWeight: 500, color: COLORS.navy, margin: 0 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' },
  quickActions: { display: 'flex', gap: 10 },
  secondaryButton: {
    background: '#FFFFFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  primaryButton: {
    background: COLORS.accent, color: '#FFFFFF', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: '1.75rem' },
  kpiCard: { borderRadius: 12, padding: '1.1rem 1.25rem', border: `0.5px solid ${COLORS.border}` },
  kpiLabel: { fontSize: 12, margin: 0 },
  kpiValue: { fontSize: 26, fontWeight: 500, margin: '6px 0 0', fontFamily: "'IBM Plex Mono', monospace" },
  twoColumn: { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, alignItems: 'start' },
  leftColumn: { display: 'flex', flexDirection: 'column', gap: 16 },
  rightColumn: {},
  card: { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, padding: '1.25rem' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 500, color: COLORS.navy, margin: 0 },
  overdueBadge: { fontSize: 11, fontWeight: 500, color: COLORS.danger, background: COLORS.dangerBg, padding: '3px 10px', borderRadius: 6 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  overdueRow: { display: 'flex', alignItems: 'center', background: COLORS.dangerBg, borderRadius: 8, overflow: 'hidden' },
  assetRow:   { display: 'flex', alignItems: 'center', background: COLORS.bg, borderRadius: 8, overflow: 'hidden' },
  tagNotch:   { width: 12, height: 12, background: '#FFFFFF', borderRadius: '50%', marginLeft: -6, flexShrink: 0 },
  rowContent: { flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px' },
  tagMono:    { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.navy, fontWeight: 500 },
  rowText:    { fontSize: 13, color: COLORS.navy },
  rowSub:     { fontSize: 11, color: COLORS.textMuted, margin: '2px 0 0' },
  dangerPill: { fontSize: 11, fontWeight: 500, color: COLORS.danger, background: '#FFFFFF', padding: '3px 10px', borderRadius: 6, flexShrink: 0 },
  statusPill: { fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 6, flexShrink: 0 },
  donutWrap:  { position: 'relative', width: 160, height: 160, margin: '1rem auto 1.25rem' },
  donut: {
    width: '100%', height: '100%', borderRadius: '50%',
    WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 24px), #000 calc(100% - 24px))',
    mask:        'radial-gradient(farthest-side, transparent calc(100% - 24px), #000 calc(100% - 24px))',
  },
  donutCenter: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  donutNumber: { fontSize: 22, fontWeight: 500, color: COLORS.navy, margin: 0, fontFamily: "'IBM Plex Mono', monospace" },
  donutLabel:  { fontSize: 11, color: COLORS.textMuted, margin: '2px 0 0' },
  legend:      { display: 'flex', flexDirection: 'column', gap: 10 },
  legendRow:   { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot:   { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  legendLabel: { fontSize: 13, color: COLORS.navy, flex: 1 },
  legendValue: { fontSize: 12, color: COLORS.textMuted, fontFamily: "'IBM Plex Mono', monospace" },
};
