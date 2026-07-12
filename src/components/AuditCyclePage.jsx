// AuditCyclePage.jsx
// Screen 8 — Structured audit cycles: create a cycle (scope + date range),
// assign auditors, verify each asset as Verified / Missing / Damaged, then
// close the cycle — which locks it and flips confirmed-missing assets to "Lost"
// (handled via StateContext side effects).
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

const CYCLE_STATUS_STYLES = {
  Active:        { bg: '#E7EFFC', text: '#4C8DFF', label: 'In Progress' },
  Closed:        { bg: '#E7F5EF', text: '#1F7A5C', label: 'Closed' },
};

const VERIFICATION_STYLES = {
  Pending:  { bg: '#EEF1F5', text: '#5B6B82' },
  Verified: { bg: '#E7F5EF', text: '#1F7A5C' },
  Missing:  { bg: '#FBEAE4', text: '#C1502E' },
  Damaged:  { bg: '#FCEFDE', text: '#B5721F' },
};

export default function AuditCyclePage({ activeNav, setActiveNav }) {
  const {
    currentUser,
    audits,
    departments,
    assets,
    employees,
    createAuditCycle,
    recordAuditVerification,
    closeAuditCycle,
  } = useContext(StateContext);

  const role = currentUser?.role || 'Employee';

  const [createDrawerOpen, setCreateDrawerOpen] = useState(false);
  const [detailCycleId, setDetailCycleId]       = useState(null);

  const [formName, setFormName]                 = useState('');
  const [formScopeType, setFormScopeType]       = useState('Department'); // 'Department' | 'Location'
  const [formScope, setFormScope]               = useState('');
  const [formStart, setFormStart]               = useState('');
  const [formEnd, setFormEnd]                   = useState('');
  const [formAuditorIds, setFormAuditorIds]     = useState([]);
  const [error, setError]                       = useState('');

  // Get unique locations from assets dynamically
  const locations = useMemo(() => {
    return Array.from(new Set(assets.map(a => a.location).filter(Boolean)));
  }, [assets]);

  // Find active audit object in view
  const detailCycle = useMemo(() => {
    return audits.find(c => c.id === detailCycleId);
  }, [audits, detailCycleId]);

  // Map auditor names in main table
  const mappedCycles = useMemo(() => {
    return audits.map(c => {
      const auditorNames = c.auditors.map(id => {
        const emp = employees.find(e => e.id === id);
        return emp ? emp.name : 'Unknown Auditor';
      });
      return {
        ...c,
        auditorNamesList: auditorNames.join(', ') || 'No auditors assigned',
        scopeValue: c.department || c.location || 'All assets',
      };
    });
  }, [audits, employees]);

  const toggleAuditor = (id) => {
    setFormAuditorIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!formName || !formScope || !formStart || !formEnd || formAuditorIds.length === 0) {
      setError('Please fill in all fields and assign at least one auditor.');
      return;
    }

    const deptVal = formScopeType === 'Department' ? formScope : '';
    const locVal  = formScopeType === 'Location' ? formScope : '';

    const newAudit = createAuditCycle(formName, deptVal, locVal, formStart, formEnd, formAuditorIds);
    if (newAudit) {
      setCreateDrawerOpen(false);
      setFormName('');
      setFormScope('');
      setFormStart('');
      setFormEnd('');
      setFormAuditorIds([]);
      setError('');
    } else {
      setError('Failed to create audit cycle.');
    }
  };

  const handleVerify = (assetId, result) => {
    if (!detailCycleId) return;
    recordAuditVerification(detailCycleId, assetId, result, 'Verified via audit dashboard');
  };

  const handleCloseCycle = () => {
    if (!detailCycleId) return;
    closeAuditCycle(detailCycleId);
    setDetailCycleId(null);
  };

  const isManager = role === 'Admin' || role === 'Asset Manager';

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Audit Cycles</h1>
            <p style={styles.pageSubtitle}>
              {audits.filter(c => c.status === 'Active').length} active cycle(s) in progress
            </p>
          </div>
          {isManager && (
            <button style={styles.primaryButton} onClick={() => setCreateDrawerOpen(true)}>
              + Create audit cycle
            </button>
          )}
        </div>

        {/* ── Table Card ──────────────────────────────────────── */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderRow}>
            <span style={{ ...styles.th, flex: 1.8 }}>Cycle Name</span>
            <span style={{ ...styles.th, flex: 1.4 }}>Scope</span>
            <span style={{ ...styles.th, flex: 1.2 }}>Date Range</span>
            <span style={{ ...styles.th, flex: 1.4 }}>Auditors</span>
            <span style={{ ...styles.th, flex: '0 0 110px' }}>Status</span>
          </div>

          {mappedCycles.map(c => {
            const s = CYCLE_STATUS_STYLES[c.status] || CYCLE_STATUS_STYLES.Active;
            return (
              <div key={c.id} style={styles.tableRow} onClick={() => setDetailCycleId(c.id)}>
                <span style={{ ...styles.td, flex: 1.8, fontWeight: 500, color: COLORS.navy }}>{c.name}</span>
                <span style={{ ...styles.td, flex: 1.4 }}>
                  {c.scopeValue}
                  <span style={{ color: COLORS.textMuted, marginLeft: 6 }}>
                    ({c.department ? 'Dept' : 'Loc'})
                  </span>
                </span>
                <span style={{ ...styles.td, flex: 1.2 }}>{c.startDate} → {c.endDate}</span>
                <span style={{ ...styles.td, flex: 1.4 }}>{c.auditorNamesList}</span>
                <span style={{ flex: '0 0 110px' }}>
                  <span style={{ ...styles.statusPill, background: s.bg, color: s.text }}>
                    {s.label}
                  </span>
                </span>
              </div>
            );
          })}

          {mappedCycles.length === 0 && (
            <div style={styles.emptyState}>No audit cycles created.</div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          CREATE DRAWER
      ══════════════════════════════════════════════════════════ */}
      {createDrawerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setCreateDrawerOpen(false); setError(''); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Create audit cycle</p>
                <p style={styles.drawerSubtitle}>Define scope, timeframe, and assigned auditors</p>
              </div>
              <button style={styles.closeButton} onClick={() => { setCreateDrawerOpen(false); setError(''); }}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {error && <div style={styles.errorBox}>{error}</div>}

              <label style={styles.label}>Cycle name *</label>
              <input
                type="text"
                placeholder="e.g. Q3 Mumbai Electronics Check"
                value={formName}
                onChange={e => setFormName(e.target.value)}
                style={styles.input}
              />

              <label style={styles.label}>Scope type *</label>
              <div style={styles.segmentedRow}>
                {['Department', 'Location'].map(t => (
                  <button
                    key={t}
                    type="button"
                    style={{ ...styles.segmentButton, ...(formScopeType === t ? styles.segmentButtonActive : {}) }}
                    onClick={() => { setFormScopeType(t); setFormScope(''); }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Scope value *</label>
              <select
                value={formScope}
                onChange={e => setFormScope(e.target.value)}
                style={styles.input}
              >
                <option value="">Select scope value…</option>
                {formScopeType === 'Department' ? (
                  departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)
                ) : (
                  locations.map(l => <option key={l} value={l}>{l}</option>)
                )}
              </select>

              <div style={styles.inlineFields}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Start date *</label>
                  <input
                    type="date"
                    value={formStart}
                    onChange={e => setFormStart(e.target.value)}
                    style={styles.input}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>End date *</label>
                  <input
                    type="date"
                    value={formEnd}
                    onChange={e => setFormEnd(e.target.value)}
                    style={styles.input}
                  />
                </div>
              </div>

              <label style={{ ...styles.label, marginTop: 12 }}>Assign auditors *</label>
              <div style={styles.checklistBox}>
                {employees.map(emp => (
                  <label key={emp.id} style={styles.checkRow}>
                    <input
                      type="checkbox"
                      checked={formAuditorIds.includes(emp.id)}
                      onChange={() => toggleAuditor(emp.id)}
                      style={{ width: 15, height: 15 }}
                    />
                    <span style={{ fontSize: 13, color: COLORS.navy }}>
                      {emp.name} ({emp.department})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => { setCreateDrawerOpen(false); setError(''); }}>Cancel</button>
              <button
                style={styles.primaryButton}
                onClick={handleCreate}
                disabled={!formName || !formScope || !formStart || !formEnd || formAuditorIds.length === 0}
              >
                Create cycle
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          DETAIL DRAWER
      ══════════════════════════════════════════════════════════ */}
      {detailCycle && (
        <>
          <div style={styles.overlay} onClick={() => setDetailCycleId(null)} />
          <div style={styles.drawerWide}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>{detailCycle.name}</p>
                <p style={styles.drawerSubtitle}>
                  {detailCycle.department || detailCycle.location || 'All assets'} · {detailCycle.startDate} → {detailCycle.endDate}
                </p>
              </div>
              <button style={styles.closeButton} onClick={() => setDetailCycleId(null)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              <p style={styles.sectionLabel}>Asset checklist</p>
              {detailCycle.checklist.length === 0 ? (
                <p style={{ fontSize: 13, color: COLORS.textMuted }}>No assets scoped into this cycle.</p>
              ) : (
                <div style={styles.checklistWrap}>
                  {detailCycle.checklist.map(a => {
                    const vs = VERIFICATION_STYLES[a.result] || VERIFICATION_STYLES.Pending;
                    const canVerify = detailCycle.status !== 'Closed';
                    return (
                      <div key={a.assetId} style={styles.checklistRow}>
                        <div>
                          <p style={styles.checklistAssetName}>{a.name}</p>
                          <p style={styles.checklistAssetTag}>{a.tag}</p>
                        </div>
                        <div style={styles.checklistActions}>
                          {canVerify ? (
                            ['Verified', 'Missing', 'Damaged'].map(statusVal => {
                              const activeStyles = VERIFICATION_STYLES[statusVal];
                              const isActive = a.result === statusVal;
                              return (
                                <button
                                  key={statusVal}
                                  style={{
                                    ...styles.verifyButton,
                                    ...(isActive ? { background: activeStyles.bg, color: activeStyles.text, borderColor: activeStyles.text, fontWeight: 600 } : {}),
                                  }}
                                  onClick={() => handleVerify(a.assetId, statusVal)}
                                >
                                  {statusVal}
                                </button>
                              );
                            })
                          ) : (
                            <span style={{ ...styles.statusPill, background: vs.bg, color: vs.text }}>
                              {a.result}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Discrepancy Report */}
              <p style={{ ...styles.sectionLabel, marginTop: 28 }}>
                Discrepancy Report ({detailCycle.discrepancies.length})
              </p>
              {detailCycle.discrepancies.length === 0 ? (
                <p style={{ fontSize: 13, color: COLORS.textMuted }}>No discrepancies flagged.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detailCycle.discrepancies.map(a => {
                    const vs = VERIFICATION_STYLES[a.result] || VERIFICATION_STYLES.Pending;
                    return (
                      <div key={a.assetId} style={styles.discrepancyRow}>
                        <span style={styles.rowText}>
                          <strong>{a.name}</strong> <span style={{ color: COLORS.textMuted }}>({a.tag})</span>
                        </span>
                        <span style={{ ...styles.statusPill, background: vs.bg, color: vs.text }}>
                          {a.result}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => setDetailCycleId(null)}>Close panel</button>
              {isManager && detailCycle.status !== 'Closed' && (
                <button style={styles.primaryButton} onClick={handleCloseCycle}>
                  Close audit cycle
                </button>
              )}
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

  tableCard:      { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:             { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' },
  tableRow:       { display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: `0.5px solid ${COLORS.border}`, cursor: 'pointer', transition: 'background 0.12s' },
  td:             { fontSize: 13, color: COLORS.textSecondary },
  statusPill:     { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, display: 'inline-block' },
  emptyState:     { padding: '3rem', textAlign: 'center', fontSize: 13, color: COLORS.textMuted },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(22,35,61,0.3)', zIndex: 50 },
  drawer: {
    position: 'fixed', top: 0, right: 0, width: 440, height: '100vh',
    background: '#FFFFFF', zIndex: 51,
    boxShadow: '-6px 0 32px rgba(22,35,61,0.1)',
    display: 'flex', flexDirection: 'column',
  },
  drawerWide: {
    position: 'fixed', top: 0, right: 0, width: 520, height: '100vh',
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

  segmentedRow: { display: 'flex', gap: 6, margin: '6px 0 12px' },
  segmentButton: { flex: 1, padding: '8px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 12.5, fontWeight: 500, color: COLORS.textSecondary, cursor: 'pointer', fontFamily: 'inherit' },
  segmentButtonActive: { background: '#E7EFFC', color: COLORS.accent, borderColor: COLORS.accent },
  errorBox:     { background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  checklistBox: { border: `0.5px solid ${COLORS.border}`, borderRadius: 8, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 180, overflowY: 'auto', background: '#FFF', margin: '6px 0 14px' },
  checkRow:     { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' },

  checklistWrap:  { display: 'flex', flexDirection: 'column', gap: 2 },
  checklistRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `0.5px solid ${COLORS.border}` },
  checklistAssetName: { fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: 0 },
  checklistAssetTag:  { fontSize: 11.5, color: COLORS.textMuted, margin: '2px 0 0', fontFamily: "'IBM Plex Mono', monospace" },
  checklistActions:   { display: 'flex', gap: 6 },
  verifyButton: {
    fontSize: 11.5, fontWeight: 500, padding: '6px 10px', borderRadius: 6,
    border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', color: COLORS.textSecondary,
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.1s ease',
  },

  discrepancyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.bg, borderRadius: 8, padding: '10px 12px' },
  rowText:        { fontSize: 13, color: COLORS.navy },
};
