// AllocationTransferPage.jsx
// Screen 5 — Allocate assets to employees/departments, with the core
// conflict rule: an already-allocated asset can't be re-allocated directly;
// the requester is shown who holds it and offered a Transfer Request instead.
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

const STATUS_STYLES = {
  Active:    { bg: '#E7EFFC', text: '#4C8DFF' },
  Overdue:   { bg: '#FBEAE4', text: '#C1502E' },
  Completed: { bg: '#EEF1F5', text: '#8A96A8' },
  Pending:   { bg: '#FCEFDE', text: '#B5721F' },
  Approved:  { bg: '#E7F5EF', text: '#1F7A5C' },
  Rejected:  { bg: '#FBEAE4', text: '#C1502E' },
};

export default function AllocationTransferPage({ activeNav, setActiveNav }) {
  const {
    assets,
    employees,
    allocations,
    transfers,
    allocateAsset,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
    returnAsset,
  } = useContext(StateContext);

  const [allocateDrawerOpen, setAllocateDrawerOpen] = useState(false);
  const [selectedAssetId, setSelectedAssetId]       = useState('');
  const [targetEmployeeId, setTargetEmployeeId]     = useState('');
  const [expectedReturn, setExpectedReturn]         = useState('');
  const [notes, setNotes]                           = useState('');

  const [returnDrawerFor, setReturnDrawerFor]       = useState(null); // holds the allocation
  const [conditionNote, setConditionNote]           = useState('');
  const [returnCondition, setReturnCondition]       = useState('Good');

  const [error, setError]                           = useState('');

  // Find active holder for conflict banner
  const conflict = useMemo(() => {
    if (!selectedAssetId) return null;
    const asset = assets.find(a => a.id === selectedAssetId);
    if (!asset || asset.status === 'Available') return null;

    // Find who currently holds it
    const activeAlloc = allocations.find(al => al.assetId === selectedAssetId && al.status === 'Active');
    const holder = activeAlloc ? employees.find(e => e.id === activeAlloc.employeeId) : null;
    return {
      asset,
      holderName: holder ? holder.name : 'Unknown Employee',
      department: holder ? holder.department : 'N/A',
    };
  }, [selectedAssetId, assets, allocations, employees]);

  // Compute active & overdue counts
  const activeAllocations = useMemo(() => {
    const today = new Date().toISOString().substring(0, 10);
    return allocations.filter(a => a.status === 'Active').map(al => {
      const asset  = assets.find(a => a.id === al.assetId);
      const emp    = employees.find(e => e.id === al.employeeId);
      const isOverdue = al.expectedReturnDate && al.expectedReturnDate < today;
      return {
        ...al,
        assetTag:   asset?.tag || '—',
        assetName:  asset?.name || 'Unknown',
        holder:     emp?.name || 'Unknown',
        isOverdue,
      };
    });
  }, [allocations, assets, employees]);

  const activeCount  = activeAllocations.length;
  const overdueCount = activeAllocations.filter(a => a.isOverdue).length;

  const pendingTransfers = useMemo(() => {
    return transfers.map(t => {
      const asset = assets.find(a => a.id === t.assetId);
      const from  = employees.find(e => e.id === t.fromId);
      const to    = employees.find(e => e.id === t.toId);
      return {
        ...t,
        assetTag:  asset?.tag || '—',
        assetName: asset?.name || 'Unknown',
        fromName:  from?.name || 'Unknown',
        toName:    to?.name || 'Unknown',
      };
    });
  }, [transfers, assets, employees]);

  const resetForm = () => {
    setSelectedAssetId('');
    setTargetEmployeeId('');
    setExpectedReturn('');
    setNotes('');
    setError('');
  };

  const handleAllocate = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !targetEmployeeId) {
      setError('Please select both an asset and an assignee.');
      return;
    }

    if (conflict) {
      // Create transfer request
      const res = requestTransfer(selectedAssetId, targetEmployeeId);
      if (res?.success) {
        setAllocateDrawerOpen(false);
        resetForm();
      } else {
        setError(res?.message || 'Error requesting transfer.');
      }
    } else {
      // Direct allocation
      const res = allocateAsset(selectedAssetId, targetEmployeeId, expectedReturn, notes);
      if (res?.success) {
        setAllocateDrawerOpen(false);
        resetForm();
      } else {
        setError(res?.message || 'Error allocating asset.');
      }
    }
  };

  const handleReturn = (e) => {
    e.preventDefault();
    if (!returnDrawerFor) return;

    const res = returnAsset(returnDrawerFor.assetId, conditionNote, returnCondition);
    if (res?.success) {
      setReturnDrawerFor(null);
      setConditionNote('');
      setReturnCondition('Good');
    }
  };

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Allocation & Transfer</h1>
            <p style={styles.pageSubtitle}>
              {activeCount} active allocations · {overdueCount} overdue
            </p>
          </div>
          <button style={styles.primaryButton} onClick={() => setAllocateDrawerOpen(true)}>
            + Allocate asset
          </button>
        </div>

        {/* ── Active Allocations Table ────────────────────────── */}
        <p style={styles.sectionLabel}>Current allocations</p>
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderRow}>
            <span style={{ ...styles.th, flex: '0 0 90px' }}>Tag</span>
            <span style={{ ...styles.th, flex: 1.6 }}>Asset</span>
            <span style={{ ...styles.th, flex: 1.4 }}>Held by</span>
            <span style={{ ...styles.th, flex: 1 }}>Allocated</span>
            <span style={{ ...styles.th, flex: 1 }}>Expected return</span>
            <span style={{ ...styles.th, flex: '0 0 100px' }}>Status</span>
            <span style={{ ...styles.th, flex: '0 0 80px' }}></span>
          </div>

          {activeAllocations.map((a) => {
            const statusKey = a.isOverdue ? 'Overdue' : 'Active';
            const s = STATUS_STYLES[statusKey];
            return (
              <div key={a.id} style={styles.tableRow}>
                <span style={{ ...styles.tagMono, flex: '0 0 90px' }}>{a.assetTag}</span>
                <span style={{ ...styles.td, flex: 1.6, fontWeight: 500, color: COLORS.navy }}>{a.assetName}</span>
                <span style={{ ...styles.td, flex: 1.4 }}>{a.holder}</span>
                <span style={{ ...styles.td, flex: 1 }}>{a.allocatedDate}</span>
                <span style={{ ...styles.td, flex: 1 }}>
                  {a.expectedReturnDate || '—'}
                  {a.isOverdue && <span style={styles.overdueLabel}>Overdue</span>}
                </span>
                <span style={{ flex: '0 0 100px' }}>
                  <span style={{ ...styles.statusPill, background: s.bg, color: s.text }}>{statusKey}</span>
                </span>
                <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                  <button style={styles.linkButton} onClick={() => setReturnDrawerFor(a)}>
                    Return
                  </button>
                </span>
              </div>
            );
          })}

          {activeAllocations.length === 0 && (
            <div style={styles.emptyState}>No active allocations. All assets are available.</div>
          )}
        </div>

        {/* ── Transfer Requests Table ─────────────────────────── */}
        <p style={{ ...styles.sectionLabel, marginTop: 28 }}>Transfer requests</p>
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderRow}>
            <span style={{ ...styles.th, flex: '0 0 90px' }}>Tag</span>
            <span style={{ ...styles.th, flex: 1.6 }}>Asset</span>
            <span style={{ ...styles.th, flex: 1 }}>From</span>
            <span style={{ ...styles.th, flex: 1 }}>To</span>
            <span style={{ ...styles.th, flex: 1 }}>Requested</span>
            <span style={{ ...styles.th, flex: '0 0 100px' }}>Status</span>
            <span style={{ ...styles.th, flex: '0 0 130px' }}></span>
          </div>

          {pendingTransfers.map((t) => {
            const s = STATUS_STYLES[t.status] || STATUS_STYLES.Pending;
            return (
              <div key={t.id} style={styles.tableRow}>
                <span style={{ ...styles.tagMono, flex: '0 0 90px' }}>{t.assetTag}</span>
                <span style={{ ...styles.td, flex: 1.6, fontWeight: 500, color: COLORS.navy }}>{t.assetName}</span>
                <span style={{ ...styles.td, flex: 1 }}>{t.fromName}</span>
                <span style={{ ...styles.td, flex: 1 }}>{t.toName}</span>
                <span style={{ ...styles.td, flex: 1 }}>{t.requestDate}</span>
                <span style={{ flex: '0 0 100px' }}>
                  <span style={{ ...styles.statusPill, background: s.bg, color: s.text }}>{t.status}</span>
                </span>
                <span style={{ flex: '0 0 130px', textAlign: 'right', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {t.status === 'Pending' && (
                    <>
                      <button style={{ ...styles.linkButton, color: COLORS.danger }} onClick={() => rejectTransfer(t.id)}>
                        Reject
                      </button>
                      <button style={styles.linkButton} onClick={() => approveTransfer(t.id)}>
                        Approve
                      </button>
                    </>
                  )}
                </span>
              </div>
            );
          })}

          {pendingTransfers.length === 0 && (
            <div style={styles.emptyState}>No transfer requests.</div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          ALLOCATE DRAWER
      ══════════════════════════════════════════════════════════ */}
      {allocateDrawerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setAllocateDrawerOpen(false); resetForm(); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Allocate asset</p>
                <p style={styles.drawerSubtitle}>Assign an asset to an employee</p>
              </div>
              <button style={styles.closeButton} onClick={() => { setAllocateDrawerOpen(false); resetForm(); }}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {error && <div style={styles.errorBox}>{error}</div>}

              <label style={styles.label}>Asset *</label>
              <select value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} style={styles.input}>
                <option value="">Select an asset…</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.tag} — {a.name} ({a.status})</option>
                ))}
              </select>

              {/* Conflict Notification Banner */}
              {conflict && (
                <div style={styles.conflictBanner}>
                  <p style={styles.conflictTitle}>Already allocated</p>
                  <p style={styles.conflictText}>
                    Currently held by <strong>{conflict.holderName}</strong> ({conflict.department}).
                    You cannot allocate directly. Saving this will submit a **Transfer Request** from them instead.
                  </p>
                </div>
              )}

              <label style={styles.label}>Assign to *</label>
              <select value={targetEmployeeId} onChange={e => setTargetEmployeeId(e.target.value)} style={styles.input}>
                <option value="">Select employee…</option>
                {employees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                ))}
              </select>

              {!conflict && (
                <>
                  <label style={styles.label}>Expected return date (optional)</label>
                  <input
                    type="date"
                    value={expectedReturn}
                    onChange={e => setExpectedReturn(e.target.value)}
                    style={styles.input}
                  />

                  <label style={styles.label}>Notes</label>
                  <textarea
                    placeholder="Provide any context for this allocation…"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    style={styles.textarea}
                  />
                </>
              )}
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => { setAllocateDrawerOpen(false); resetForm(); }}>Cancel</button>
              <button
                style={styles.primaryButton}
                onClick={handleAllocate}
                disabled={!selectedAssetId || !targetEmployeeId}
              >
                {conflict ? 'Request transfer' : 'Save allocation'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          RETURN DRAWER
      ══════════════════════════════════════════════════════════ */}
      {returnDrawerFor && (
        <>
          <div style={styles.overlay} onClick={() => setReturnDrawerFor(null)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Mark as returned</p>
                <p style={styles.drawerSubtitle}>
                  {returnDrawerFor.assetName} · <span style={styles.tagMono}>{returnDrawerFor.assetTag}</span>
                </p>
              </div>
              <button style={styles.closeButton} onClick={() => setReturnDrawerFor(null)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              <label style={styles.label}>Returned condition</label>
              <select
                style={styles.input}
                value={returnCondition}
                onChange={e => setReturnCondition(e.target.value)}
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>

              <label style={styles.label}>Condition notes / check-in feedback</label>
              <textarea
                value={conditionNote}
                onChange={e => setConditionNote(e.target.value)}
                placeholder="Describe the asset's physical condition on return…"
                style={styles.textarea}
              />
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => setReturnDrawerFor(null)}>Cancel</button>
              <button style={styles.primaryButton} onClick={handleReturn}>Confirm return</button>
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
  sectionLabel: { fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.02em' },

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
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
  },

  tableCard:      { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden', marginBottom: 16 },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:             { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' },
  tableRow:       { display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: `0.5px solid ${COLORS.border}` },
  td:             { fontSize: 13, color: COLORS.textSecondary },
  tagMono:        { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.navy, fontWeight: 500 },
  overdueLabel:   { marginLeft: 6, fontSize: 10, background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 4, padding: '1px 6px', fontWeight: 600 },
  statusPill:     { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, display: 'inline-block' },
  emptyState:     { padding: '2.5rem', textAlign: 'center', fontSize: 13, color: COLORS.textMuted },

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
  textarea:     { width: '100%', margin: '6px 0 14px', padding: '10px 12px', minHeight: 90, borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy, resize: 'vertical', display: 'block' },
  errorBox:     { background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  conflictBanner: { background: COLORS.dangerBg, borderRadius: 8, padding: '12px 14px', margin: '2px 0 14px' },
  conflictTitle:  { fontSize: 12.5, fontWeight: 600, color: COLORS.danger, margin: 0 },
  conflictText:   { fontSize: 12, color: COLORS.danger, margin: '4px 0 0', lineHeight: 1.5 },
};
