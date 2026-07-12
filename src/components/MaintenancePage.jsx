// MaintenancePage.jsx
// Screen 7 — Maintenance requests must be approved before repair work
// starts. Asset status auto-updates to "Under Maintenance" on approval and
// back to "Available" on resolution (handled by StateContext side effects).
// Wired to live StateContext — zero mock data.

import { useState, useContext, useMemo } from 'react';
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

const STAGES = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

const STAGE_STYLES = {
  Pending:               { bg: '#FCEFDE', text: '#B5721F' },
  Approved:              { bg: '#E7EFFC', text: '#4C8DFF' },
  Rejected:              { bg: '#FBEAE4', text: '#C1502E' },
  'Technician Assigned': { bg: '#EEEBFB', text: '#6B5FCF' },
  'In Progress':         { bg: '#EEEBFB', text: '#6B5FCF' },
  Resolved:              { bg: '#E7F5EF', text: '#1F7A5C' },
};

const PRIORITY_STYLES = {
  Low:    { bg: '#EEF1F5', text: '#5B6B82' },
  Medium: { bg: '#FCEFDE', text: '#B5721F' },
  High:   { bg: '#FBEAE4', text: '#C1502E' },
};

const TECHNICIANS = ['Vendor: CoolFix Electronics', 'Vendor: OfficeCare Repairs', 'In-house: Suresh Patil'];

function nextStage(stage) {
  const idx = STAGES.indexOf(stage);
  return idx >= 0 && idx < STAGES.length - 1 ? STAGES[idx + 1] : null;
}

export default function MaintenancePage({ activeNav, setActiveNav }) {
  const {
    currentUser,
    maintenance,
    assets,
    employees,
    raiseMaintenanceRequest,
    updateMaintenanceStatus,
  } = useContext(StateContext);

  const role = currentUser?.role || 'Employee';

  const [raiseDrawerOpen, setRaiseDrawerOpen] = useState(false);
  const [detailRequest, setDetailRequest]     = useState(null);

  const [formAssetId, setFormAssetId]         = useState('');
  const [formIssue, setFormIssue]             = useState('');
  const [formPriority, setFormPriority]       = useState('Medium');
  const [photoUrl, setPhotoUrl]               = useState('');

  const [formTechnician, setFormTechnician]   = useState('');
  const [formCost, setFormCost]               = useState('');
  const [error, setError]                     = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const requests = useMemo(() => {
    return [...maintenance].reverse().map(m => {
      const asset    = assets.find(a => a.id === m.assetId);
      const reporter = employees.find(e => e.id === m.reportedBy);
      return {
        ...m,
        assetTag:     asset?.tag || '—',
        assetName:    asset?.name || 'Unknown',
        reportedName: reporter ? reporter.name : 'Unknown User',
      };
    });
  }, [maintenance, assets, employees]);

  // Helper values
  const pendingCount = maintenance.filter(r => r.status === 'Pending').length;
  const activeCount  = maintenance.filter(r => r.status !== 'Resolved' && r.status !== 'Rejected').length;

  const handleRaise = async (e) => {
    e.preventDefault();
    if (!formAssetId || !formIssue) {
      setError('Please select an asset and describe the issue.');
      return;
    }

    const res = await raiseMaintenanceRequest(formAssetId, formIssue, formPriority, photoUrl);
    if (res?.success) {
      setRaiseDrawerOpen(false);
      setFormAssetId('');
      setFormIssue('');
      setFormPriority('Medium');
      setPhotoUrl('');
      setError('');
    } else {
      setError(res?.message || 'Error submitting request.');
    }
  };

  const handleApprove = () => {
    updateMaintenanceStatus(detailRequest.id, 'Approved', 'Request approved. Preparing to assign work.');
    setDetailRequest(null);
  };

  const handleReject = () => {
    updateMaintenanceStatus(detailRequest.id, 'Rejected', 'Request rejected by admin/manager.');
    setDetailRequest(null);
  };

  const handleAssignTech = (tech) => {
    updateMaintenanceStatus(detailRequest.id, 'Technician Assigned', `Assigned to ${tech}`, { technician: tech });
    setDetailRequest(null);
    setFormTechnician('');
  };

  const handleAdvanceStage = () => {
    if (!detailRequest) return;
    const current = detailRequest.status;
    const next = nextStage(current);

    if (next === 'Resolved') {
      const parsedCost = Number(formCost) || 0;
      updateMaintenanceStatus(detailRequest.id, 'Resolved', `Work completed. Cost: ₹${parsedCost}`, { cost: parsedCost });
      setFormCost('');
    } else if (next) {
      updateMaintenanceStatus(detailRequest.id, next, `Workflow advanced to ${next}`);
    }
    setDetailRequest(null);
  };

  const isManager = role === 'Admin' || role === 'Asset Manager';

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Maintenance</h1>
            <p style={styles.pageSubtitle}>
              {pendingCount} awaiting approval · {activeCount} active requests
            </p>
          </div>
          <button style={styles.primaryButton} onClick={() => setRaiseDrawerOpen(true)}>
            + Raise request
          </button>
        </div>

        {/* ── Requests Table ──────────────────────────────────── */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderRow}>
            <span style={{ ...styles.th, flex: '0 0 90px' }}>Tag</span>
            <span style={{ ...styles.th, flex: 1.4 }}>Asset</span>
            <span style={{ ...styles.th, flex: 2 }}>Issue Description</span>
            <span style={{ ...styles.th, flex: '0 0 90px' }}>Priority</span>
            <span style={{ ...styles.th, flex: '0 0 160px' }}>Stage</span>
            <span style={{ ...styles.th, flex: '0 0 100px' }}>Reported</span>
          </div>

          {requests.map((r) => {
            const stageStyle = STAGE_STYLES[r.status] || STAGE_STYLES.Pending;
            const priorityStyle = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.Medium;
            return (
              <div key={r.id} style={styles.tableRow} onClick={() => setDetailRequest(r)}>
                <span style={{ ...styles.tagMono, flex: '0 0 90px' }}>{r.assetTag}</span>
                <span style={{ ...styles.td, flex: 1.4, fontWeight: 500, color: COLORS.navy }}>{r.assetName}</span>
                <span style={{ ...styles.td, flex: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 20 }}>
                  {r.issue}
                </span>
                <span style={{ flex: '0 0 90px' }}>
                  <span style={{ ...styles.statusPill, background: priorityStyle.bg, color: priorityStyle.text }}>
                    {r.priority}
                  </span>
                </span>
                <span style={{ flex: '0 0 160px' }}>
                  <span style={{ ...styles.statusPill, background: stageStyle.bg, color: stageStyle.text }}>
                    {r.status}
                  </span>
                </span>
                <span style={{ ...styles.td, flex: '0 0 100px' }}>{r.reportedDate}</span>
              </div>
            );
          })}

          {requests.length === 0 && (
            <div style={styles.emptyState}>No maintenance requests reported.</div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          RAISE DRAWER
      ══════════════════════════════════════════════════════════ */}
      {raiseDrawerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setRaiseDrawerOpen(false); setError(''); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Raise maintenance request</p>
                <p style={styles.drawerSubtitle}>Submits to managers for approval before work starts</p>
              </div>
              <button style={styles.closeButton} onClick={() => { setRaiseDrawerOpen(false); setError(''); }}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {error && <div style={styles.errorBox}>{error}</div>}

              <label style={styles.label}>Select Asset *</label>
              <select
                value={formAssetId}
                onChange={e => setFormAssetId(e.target.value)}
                style={styles.input}
              >
                <option value="">Select asset…</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.tag} — {a.name} ({a.status})</option>
                ))}
              </select>

              <label style={styles.label}>Describe the issue *</label>
              <textarea
                value={formIssue}
                onChange={e => setFormIssue(e.target.value)}
                placeholder="Describe exactly what needs fixing…"
                style={styles.textarea}
              />

              <label style={styles.label}>Priority</label>
              <div style={styles.segmentedRow}>
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    type="button"
                    style={{ ...styles.segmentButton, ...(formPriority === p ? styles.segmentButtonActive : {}) }}
                    onClick={() => setFormPriority(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Photo / attachment (optional)</label>
              <input
                type="file"
                id="photo-upload"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {photoUrl ? (
                <div style={styles.previewContainer}>
                  <img src={photoUrl} alt="Upload preview" style={styles.previewImg} />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    style={styles.removePhotoBtn}
                  >
                    Remove Photo
                  </button>
                </div>
              ) : (
                <div
                  style={styles.uploadBox}
                  onClick={() => document.getElementById('photo-upload').click()}
                >
                  Drop files here or click to upload
                </div>
              )}
            </div>

            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => { setRaiseDrawerOpen(false); setError(''); }}>Cancel</button>
              <button
                style={styles.primaryButton}
                onClick={handleRaise}
                disabled={!formAssetId || !formIssue}
              >
                Submit request
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          DETAIL & ACTION DRAWER
      ══════════════════════════════════════════════════════════ */}
      {detailRequest && (
        <>
          <div style={styles.overlay} onClick={() => setDetailRequest(null)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>{detailRequest.assetName}</p>
                <p style={styles.drawerSubtitle}>
                  <span style={styles.tagMono}>{detailRequest.assetTag}</span> · raised by {detailRequest.reportedName}
                </p>
              </div>
              <button style={styles.closeButton} onClick={() => setDetailRequest(null)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              <p style={styles.issueText}>&ldquo;{detailRequest.issue}&rdquo;</p>

              {detailRequest.photoUrl && (
                <div style={{ marginTop: 14, marginBottom: 18 }}>
                  <p style={styles.label}>ATTACHED PHOTO</p>
                  <div style={styles.detailImageContainer}>
                    <img
                      src={detailRequest.photoUrl}
                      alt="Attachment"
                      style={styles.detailAttachmentImg}
                    />
                  </div>
                </div>
              )}

              {/* Workflow Stepper */}
              <p style={{ ...styles.label, marginTop: 24, marginBottom: 12 }}>WORKFLOW STATUS</p>
              <div style={styles.stepper}>
                {STAGES.map((stage, i) => {
                  const currentIdx = STAGES.indexOf(detailRequest.status);
                  const isDone     = detailRequest.status !== 'Rejected' && i <= currentIdx;
                  return (
                    <div key={stage} style={styles.stepRow}>
                      <span style={{ ...styles.stepDot, ...(isDone ? styles.stepDotDone : {}) }} />
                      <span style={{ ...styles.stepLabel, ...(isDone ? styles.stepLabelDone : {}) }}>
                        {stage}
                      </span>
                    </div>
                  );
                })}
                {detailRequest.status === 'Rejected' && (
                  <div style={styles.stepRow}>
                    <span style={{ ...styles.stepDot, background: COLORS.danger }} />
                    <span style={{ ...styles.stepLabel, color: COLORS.danger, fontWeight: 500 }}>
                      Rejected
                    </span>
                  </div>
                )}
              </div>

              {detailRequest.technician && (
                <div style={styles.techLine}>
                  🛠 Assigned Technician: <strong>{detailRequest.technician}</strong>
                </div>
              )}

              {/* Technician dropdown selection */}
              {isManager && detailRequest.status === 'Approved' && (
                <div style={{ marginTop: 18 }}>
                  <label style={styles.label}>Assign Technician</label>
                  <select
                    style={styles.input}
                    value={formTechnician}
                    onChange={e => {
                      setFormTechnician(e.target.value);
                      if (e.target.value) handleAssignTech(e.target.value);
                    }}
                  >
                    <option value="">Select technician…</option>
                    {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              {/* Cost input for resolving stage */}
              {isManager && (detailRequest.status === 'Technician Assigned' || detailRequest.status === 'In Progress') && nextStage(detailRequest.status) === 'Resolved' && (
                <div style={{ marginTop: 18 }}>
                  <label style={styles.label}>Resolution Cost (₹)</label>
                  <input
                    type="number"
                    placeholder="Enter cost of repair…"
                    value={formCost}
                    onChange={e => setFormCost(e.target.value)}
                    style={styles.input}
                  />
                </div>
              )}
            </div>

            {/* Actions Footer */}
            <div style={styles.drawerFooter}>
              <button style={styles.secondaryButton} onClick={() => setDetailRequest(null)}>Close</button>

              {isManager && detailRequest.status === 'Pending' && (
                <>
                  <button style={styles.dangerButton} onClick={handleReject}>Reject</button>
                  <button style={styles.primaryButton} onClick={handleApprove}>Approve</button>
                </>
              )}

              {isManager && (detailRequest.status === 'Technician Assigned' || detailRequest.status === 'In Progress') && (
                <button
                  style={styles.primaryButton}
                  onClick={handleAdvanceStage}
                  disabled={nextStage(detailRequest.status) === 'Resolved' && !formCost}
                >
                  Mark as {nextStage(detailRequest.status)}
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

  primaryButton: {
    background: COLORS.accent, color: '#FFFFFF', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  secondaryButton: {
    background: '#FFFFFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  dangerButton: {
    background: '#FFFFFF', color: COLORS.danger, border: `0.5px solid ${COLORS.danger}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },

  tableCard:      { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:             { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' },
  tableRow:       { display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: `0.5px solid ${COLORS.border}`, cursor: 'pointer', transition: 'background 0.12s' },
  td:             { fontSize: 13, color: COLORS.textSecondary },
  tagMono:        { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.navy, fontWeight: 500 },
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
  textarea:     { width: '100%', margin: '6px 0 14px', padding: '10px 12px', minHeight: 90, borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy, resize: 'vertical', display: 'block' },
  segmentedRow: { display: 'flex', gap: 6, margin: '6px 0 12px' },
  segmentButton: { flex: 1, padding: '8px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFFFFF', fontSize: 12.5, fontWeight: 500, color: COLORS.textSecondary, cursor: 'pointer', fontFamily: 'inherit' },
  segmentButtonActive: { background: '#E7EFFC', color: COLORS.accent, borderColor: COLORS.accent },
  uploadBox:    { border: `1.5px dashed ${COLORS.border}`, borderRadius: 8, padding: '1.5rem', textAlign: 'center', fontSize: 12, color: COLORS.textMuted, cursor: 'pointer', marginTop: 6 },
  errorBox:     { background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  issueText: { fontSize: 14, color: COLORS.navy, lineHeight: 1.6, background: COLORS.bg, padding: '14px 16px', borderRadius: 8, margin: '0 0 16px' },
  stepper:   { display: 'flex', flexDirection: 'column', gap: 12, paddingLeft: 6 },
  stepRow:   { display: 'flex', alignItems: 'center', gap: 10 },
  stepDot:   { width: 8, height: 8, borderRadius: '50%', background: COLORS.border },
  stepDotDone: { background: COLORS.accent },
  stepLabel: { fontSize: 13, color: COLORS.textMuted },
  stepLabelDone: { color: COLORS.navy, fontWeight: 500 },
  techLine:  { fontSize: 13, color: COLORS.navy, background: COLORS.purpleBg, padding: '10px 12px', borderRadius: 8, marginTop: 18 },

  previewContainer: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6, alignItems: 'flex-start' },
  previewImg: { width: '100%', maxHeight: 150, objectFit: 'contain', borderRadius: 8, border: `1px solid ${COLORS.border}` },
  removePhotoBtn: { background: 'transparent', border: 'none', color: COLORS.danger, fontSize: 12, fontWeight: 600, cursor: 'pointer', padding: '2px 0' },
  detailImageContainer: { width: '100%', borderRadius: 8, border: `1px solid ${COLORS.border}`, overflow: 'hidden', marginTop: 6, background: COLORS.bg },
  detailAttachmentImg: { width: '100%', maxHeight: 200, objectFit: 'contain', display: 'block' },
};
