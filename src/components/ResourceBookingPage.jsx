// ResourceBookingPage.jsx
// Screen 6 — Book shared/limited resources (rooms, vehicles, equipment) by
// time slot. Core rule: overlapping bookings on the same resource are
// rejected client-side before they'd ever hit the backend.
// Wired to live StateContext — zero mock data.

import { useState, useMemo, useContext, useEffect } from 'react';
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

const STATUS_STYLES = {
  Upcoming:  { bg: '#E7EFFC', text: '#4C8DFF' },
  Ongoing:   { bg: '#E7F5EF', text: '#1F7A5C' },
  Completed: { bg: '#EEF1F5', text: '#8A96A8' },
  Cancelled: { bg: '#FBEAE4', text: '#C1502E' },
};

export default function ResourceBookingPage({ activeNav, setActiveNav }) {
  const {
    assets,
    bookings,
    employees,
    validateBookingOverlap,
    bookResource,
    cancelBooking,
  } = useContext(StateContext);

  const TODAY = '2026-07-12'; // default base date for prototype
  const [selectedResourceId, setSelectedResourceId] = useState('');
  const [date, setDate]                             = useState(TODAY);

  const [drawerOpen, setDrawerOpen]                 = useState(false);
  const [formTitle, setFormTitle]                   = useState('');
  const [formStart, setFormStart]                   = useState('');
  const [formEnd, setFormEnd]                       = useState('');
  const [conflictMessage, setConflictMessage]       = useState('');
  const [okMessage, setOkMessage]                   = useState('');

  // Get bookable assets (shared: true)
  const resources = useMemo(() => assets.filter(a => a.shared), [assets]);

  // Set default selected resource on load
  useEffect(() => {
    if (resources.length > 0 && !selectedResourceId) {
      setSelectedResourceId(resources[0].id);
    }
  }, [resources, selectedResourceId]);

  const selectedResource = useMemo(() => {
    return resources.find(r => r.id === selectedResourceId);
  }, [resources, selectedResourceId]);

  // Filter and sort bookings for this resource and date
  const resourceBookings = useMemo(() => {
    if (!selectedResourceId) return [];
    return bookings
      .filter(b => b.resourceId === selectedResourceId && b.startTime.startsWith(date) && b.status !== 'Cancelled')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(b => {
        const emp = employees.find(e => e.id === b.employeeId);
        return {
          ...b,
          bookedBy: emp ? emp.name : 'Unknown User',
          timeRange: `${b.startTime.substring(11, 16)} – ${b.endTime.substring(11, 16)}`,
        };
      });
  }, [bookings, selectedResourceId, date, employees]);

  // Run overlap checker on input change
  useEffect(() => {
    setConflictMessage('');
    setOkMessage('');
    if (!selectedResourceId || !date || !formStart || !formEnd) return;

    if (formStart >= formEnd) {
      setConflictMessage('End time must be after the start time.');
      return;
    }

    const startISO = `${date}T${formStart}`;
    const endISO = `${date}T${formEnd}`;

    const check = validateBookingOverlap(selectedResourceId, startISO, endISO);
    if (!check.valid) {
      setConflictMessage(check.message || 'Overlaps with an existing booking.');
    } else {
      setOkMessage('This time slot is available.');
    }
  }, [selectedResourceId, date, formStart, formEnd, validateBookingOverlap]);

  const handleBook = (e) => {
    e.preventDefault();
    if (!selectedResourceId || !formTitle || !formStart || !formEnd) return;

    const startISO = `${date}T${formStart}`;
    const endISO = `${date}T${formEnd}`;

    const res = bookResource(selectedResourceId, formTitle, startISO, endISO);
    if (res?.success) {
      setDrawerOpen(false);
      setFormTitle('');
      setFormStart('');
      setFormEnd('');
      setConflictMessage('');
      setOkMessage('');
    } else {
      setConflictMessage(res?.message || 'Failed to book resource.');
    }
  };

  const handleCancel = (bookingId) => {
    cancelBooking(bookingId);
  };

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Resource Booking</h1>
            <p style={styles.pageSubtitle}>
              Book shared rooms, vehicles, and equipment by time slot.
            </p>
          </div>
          <button style={styles.primaryButton} onClick={() => setDrawerOpen(true)}>
            + Book resource
          </button>
        </div>

        {resources.length === 0 ? (
          <div style={styles.emptyState}>No shared resources have been registered yet.</div>
        ) : (
          <div style={styles.layout}>
            {/* ── Left column: Resources List ────────────────────── */}
            <div style={styles.resourceList}>
              {resources.map(r => (
                <button
                  key={r.id}
                  style={{
                    ...styles.resourceItem,
                    ...(selectedResourceId === r.id ? styles.resourceItemActive : {}),
                  }}
                  onClick={() => setSelectedResourceId(r.id)}
                >
                  <p style={styles.resourceName}>{r.name}</p>
                  <p style={styles.resourceMeta}>{r.tag} · {r.location || 'No location'}</p>
                </button>
              ))}
            </div>

            {/* ── Right column: Day Schedule ─────────────────────── */}
            <div style={styles.scheduleCard}>
              <div style={styles.scheduleHeader}>
                <div>
                  <p style={styles.scheduleTitle}>{selectedResource?.name || 'Select Resource'}</p>
                  <p style={styles.resourceMeta}>
                    {resourceBookings.length} booking{resourceBookings.length !== 1 ? 's' : ''} on this day
                  </p>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>

              <div style={styles.scheduleBody}>
                {resourceBookings.length === 0 && (
                  <div style={styles.emptyState}>No bookings for this day — it&apos;s wide open.</div>
                )}
                {resourceBookings.map(b => {
                  const s = STATUS_STYLES[b.status] || STATUS_STYLES.Upcoming;
                  return (
                    <div key={b.id} style={styles.slotRow}>
                      <span style={styles.slotTime}>{b.timeRange}</span>
                      <span style={styles.slotTitle}>{b.title}</span>
                      <span style={styles.slotBookedBy}>Booked by {b.bookedBy}</span>
                      <span style={{ ...styles.statusPill, background: s.bg, color: s.text, marginRight: 16 }}>
                        {b.status}
                      </span>
                      {b.status === 'Upcoming' && (
                        <button style={styles.linkButton} onClick={() => handleCancel(b.id)}>
                          Cancel
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════
          BOOKING DRAWER
      ══════════════════════════════════════════════════════════ */}
      {drawerOpen && selectedResource && (
        <>
          <div style={styles.overlay} onClick={() => setDrawerOpen(false)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Book resource</p>
                <p style={styles.drawerSubtitle}>{selectedResource.name}</p>
              </div>
              <button style={styles.closeButton} onClick={() => setDrawerOpen(false)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              <label style={styles.label}>Purpose / Title *</label>
              <input
                type="text"
                placeholder="e.g. Design review session"
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={styles.input}
              />

              <div style={styles.inlineFields}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Start time</label>
                  <input
                    type="time"
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>End time</label>
                  <input
                    type="time"
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              {conflictMessage && (
                <div style={styles.conflictBanner}>
                  <p style={styles.conflictTitle}>Slot unavailable</p>
                  <p style={styles.conflictText}>{conflictMessage}</p>
                </div>
              )}

              {okMessage && (
                <div style={styles.okBanner}>
                  <p style={styles.okText}>✓ {okMessage}</p>
                </div>
              )}

              <p style={{ ...styles.label, marginTop: 18, marginBottom: 8 }}>
                Existing bookings this day:
              </p>
              {resourceBookings.length === 0 ? (
                <p style={{ ...styles.resourceMeta, fontSize: 13 }}>None yet.</p>
              ) : (
                resourceBookings.map(b => (
                  <p key={b.id} style={styles.existingBookingLine}>
                    • {b.timeRange} : {b.title} ({b.bookedBy})
                  </p>
                ))
              )}
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => setDrawerOpen(false)}>Cancel</button>
              <button
                style={styles.primaryButton}
                onClick={handleBook}
                disabled={!formTitle || !formStart || !formEnd || !!conflictMessage}
              >
                Confirm booking
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  page:         { display: 'flex', width: '100vw', minHeight: '100vh', background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif" },
  main:         { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' },
  topBar:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' },
  pageTitle:    { fontSize: 24, fontWeight: 500, color: COLORS.navy, margin: 0 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' },

  primaryButton: {
    background: COLORS.accent, color: '#FFFFFF', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  secondaryButton: {
    background: '#FFFFFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  linkButton: {
    background: 'transparent', border: 'none', color: COLORS.accent,
    fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
  },

  layout:       { display: 'flex', gap: 20, alignItems: 'stretch' },
  resourceList: { width: 250, display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 },
  resourceItem: {
    textAlign: 'left', background: '#FFFFFF', border: `0.5px solid ${COLORS.border}`,
    borderRadius: 10, padding: '12px 14px', cursor: 'pointer', fontFamily: 'inherit',
    transition: 'border-color 0.15s, background 0.15s',
  },
  resourceItemActive: { borderColor: COLORS.accent, background: '#EEF4FF' },
  resourceName:       { fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: 0 },
  resourceMeta:       { fontSize: 11.5, color: COLORS.textMuted, margin: '3px 0 0' },

  scheduleCard:   { flex: 1, background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  scheduleHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  scheduleTitle:  { fontSize: 14.5, fontWeight: 600, color: COLORS.navy, margin: 0 },
  dateInput:      { height: 36, padding: '0 10px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 12.5, fontFamily: 'inherit', color: COLORS.navy },
  scheduleBody:   { padding: '8px 20px' },
  slotRow:        { display: 'flex', alignItems: 'center', padding: '13px 0', borderBottom: `0.5px solid ${COLORS.border}` },
  slotTime:       { fontSize: 13, fontWeight: 500, color: COLORS.navy, width: 120, fontFamily: "'IBM Plex Mono', monospace" },
  slotTitle:      { fontSize: 13, fontWeight: 500, color: COLORS.navy, flex: 1 },
  slotBookedBy:   { fontSize: 13, color: COLORS.textSecondary, marginRight: 20 },
  statusPill:     { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, display: 'inline-block' },
  emptyState:     { padding: '3rem', textAlign: 'center', fontSize: 13, color: COLORS.textMuted },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(22,35,61,0.3)', zIndex: 50 },
  drawer: {
    position: 'fixed', top: 0, right: 0, width: 440, height: '100vh',
    background: '#FFFFFF', zIndex: 51,
    boxShadow: '-6px 0 32px rgba(22,35,61,0.1)',
    display: 'flex', flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.5rem', borderBottom: `0.5px solid ${COLORS.border}`,
  },
  drawerTitle:    { fontSize: 17, fontWeight: 500, color: COLORS.navy, margin: 0 },
  drawerSubtitle: { fontSize: 12, color: COLORS.textSecondary, margin: '4px 0 0' },
  closeButton:    { border: 'none', background: 'transparent', fontSize: 18, color: COLORS.textMuted, cursor: 'pointer', lineHeight: 1 },
  drawerBody:     { padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  drawerFooter:   { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '1.25rem 1.5rem', borderTop: `0.5px solid ${COLORS.border}` },

  label:        { fontSize: 12, color: COLORS.navy, fontWeight: 500, marginTop: 4 },
  input:        { width: '100%', margin: '6px 0 14px', padding: '0 12px', height: 40, borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy, display: 'block' },
  inlineFields: { display: 'flex', gap: 12 },

  conflictBanner:      { background: COLORS.dangerBg, borderRadius: 8, padding: '12px 14px', margin: '2px 0 14px' },
  conflictTitle:       { fontSize: 12.5, fontWeight: 600, color: COLORS.danger, margin: 0 },
  conflictText:        { fontSize: 12, color: COLORS.danger, margin: '4px 0 0', lineHeight: 1.5 },
  okBanner:            { background: COLORS.successBg, borderRadius: 8, padding: '10px 14px', margin: '2px 0 14px' },
  okText:              { fontSize: 12, color: COLORS.success, margin: 0, fontWeight: 500 },
  existingBookingLine: { fontSize: 12.5, color: COLORS.textSecondary, margin: '4px 0', fontFamily: "'IBM Plex Mono', monospace" },
};
