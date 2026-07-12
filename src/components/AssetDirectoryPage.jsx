// AssetDirectoryPage.jsx
// Directory list is the default view. Clicking "+ Register asset" opens a
// slide-in drawer with the registration form. Clicking a row opens a
// detail drawer with full allocation + maintenance history.
// All data is live from StateContext — no mock data.

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
  Available:           { bg: '#E7F5EF', text: '#1F7A5C' },
  Allocated:           { bg: '#E7EFFC', text: '#4C8DFF' },
  Reserved:            { bg: '#FCEFDE', text: '#B5721F' },
  'Under Maintenance': { bg: '#EEEBFB', text: '#6B5FCF' },
  Lost:                { bg: '#FBEAE4', text: '#C1502E' },
  Retired:             { bg: '#EEF1F5', text: '#8A96A8' },
  Disposed:            { bg: '#EEF1F5', text: '#8A96A8' },
};

const STATUSES = ['All statuses', 'Available', 'Allocated', 'Reserved', 'Under Maintenance', 'Lost', 'Retired', 'Disposed'];

// ── Blank form state ─────────────────────────────────────────────
const blankForm = {
  name: '', serial: '', acqDate: '', acqCost: '',
  condition: 'Good', location: '', shared: false, category: '',
};

export default function AssetDirectoryPage({ activeNav, setActiveNav }) {
  const {
    assets,
    categories,
    employees,
    allocations,
    maintenance,
    registerAsset,
    updateAsset,
  } = useContext(StateContext);

  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All categories');
  const [statusFilter, setStatusFilter]   = useState('All statuses');
  const [registerOpen, setRegisterOpen]   = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [form, setForm]                   = useState(blankForm);
  const [formError, setFormError]         = useState('');
  const [saving, setSaving]               = useState(false);

  // ── Filter logic ─────────────────────────────────────────────
  const categoryOptions = ['All categories', ...categories.map(c => c.name)];

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const q = search.toLowerCase();
      const matchSearch = !search
        || a.tag?.toLowerCase().includes(q)
        || a.name?.toLowerCase().includes(q)
        || a.serial?.toLowerCase().includes(q);
      const matchCat    = categoryFilter === 'All categories' || a.category === categoryFilter;
      const matchStatus = statusFilter   === 'All statuses'   || a.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [assets, search, categoryFilter, statusFilter]);

  // ── Register form submit ──────────────────────────────────────
  const handleRegister = () => {
    if (!form.name || !form.category || !form.location) {
      setFormError('Name, category, and location are required.');
      return;
    }
    setSaving(true);
    setTimeout(() => {
      registerAsset(
        form.name, form.category, form.serial,
        form.acqDate, form.acqCost, form.condition,
        form.location, form.shared
      );
      setRegisterOpen(false);
      setForm(blankForm);
      setFormError('');
      setSaving(false);
    }, 300);
  };

  // ── Detail helpers ─────────────────────────────────────────────
  const assetAllocHistory = selectedAsset
    ? allocations.filter(al => al.assetId === selectedAsset.id)
    : [];
  const assetMaintHistory = selectedAsset
    ? maintenance.filter(m => m.assetId === selectedAsset.id)
    : [];

  const nextTag = `AF-${String(assets.length + 1).padStart(4, '0')}`;

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Assets</h1>
            <p style={styles.pageSubtitle}>
              {filtered.length} of {assets.length} assets
            </p>
          </div>
          <button style={styles.primaryButton} onClick={() => setRegisterOpen(true)}>
            + Register asset
          </button>
        </div>

        {/* ── Filters ─────────────────────────────────────────── */}
        <div style={styles.filterRow}>
          <input
            type="text"
            placeholder="Search by tag, name or serial number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            {categoryOptions.map(c => <option key={c}>{c}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={styles.filterSelect}
          >
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ── Table ────────────────────────────────────────────── */}
        <div style={styles.tableCard}>
          <div style={styles.tableHeaderRow}>
            <span style={{ ...styles.th, flex: '0 0 110px' }}>Tag</span>
            <span style={{ ...styles.th, flex: 2 }}>Name</span>
            <span style={{ ...styles.th, flex: 1 }}>Category</span>
            <span style={{ ...styles.th, flex: 1 }}>Location</span>
            <span style={{ ...styles.th, flex: 1 }}>Department</span>
            <span style={{ ...styles.th, flex: '0 0 160px' }}>Status</span>
          </div>

          {filtered.map(asset => {
            const s = STATUS_STYLES[asset.status] || STATUS_STYLES.Available;
            return (
              <div
                key={asset.id}
                style={styles.tableRow}
                onClick={() => setSelectedAsset(asset)}
              >
                <span style={{ ...styles.tagMono, flex: '0 0 110px' }}>{asset.tag}</span>
                <span style={{ ...styles.td, flex: 2, fontWeight: 500, color: COLORS.navy }}>
                  {asset.name}
                  {asset.shared && <span style={styles.sharedBadge}>Bookable</span>}
                </span>
                <span style={{ ...styles.td, flex: 1 }}>{asset.category}</span>
                <span style={{ ...styles.td, flex: 1 }}>{asset.location || '—'}</span>
                <span style={{ ...styles.td, flex: 1 }}>{asset.department || '—'}</span>
                <span style={{ flex: '0 0 160px' }}>
                  <span style={{ ...styles.statusPill, background: s.bg, color: s.text }}>
                    {asset.status}
                  </span>
                </span>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={styles.emptyState}>No assets match your search.</div>
          )}
        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════
          REGISTER DRAWER
      ══════════════════════════════════════════════════════════ */}
      {registerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setRegisterOpen(false); setForm(blankForm); setFormError(''); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Register asset</p>
                <p style={styles.drawerSubtitle}>
                  Tag: <span style={styles.tagMono}>{nextTag}</span> (auto-generated)
                </p>
              </div>
              <button style={styles.closeBtn} onClick={() => { setRegisterOpen(false); setForm(blankForm); setFormError(''); }}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {formError && (
                <div style={styles.errorBox}>{formError}</div>
              )}

              <label style={styles.label}>Name *</label>
              <input
                style={styles.input}
                placeholder="e.g. Dell Latitude 5420"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />

              <label style={styles.label}>Category *</label>
              <select
                style={styles.input}
                value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value="">Select category…</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>

              <label style={styles.label}>Serial number</label>
              <input
                style={styles.input}
                placeholder="Manufacturer serial number"
                value={form.serial}
                onChange={e => setForm(f => ({ ...f, serial: e.target.value }))}
              />

              <div style={styles.inlineFields}>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Acquisition date</label>
                  <input
                    type="date"
                    style={styles.input}
                    value={form.acqDate}
                    onChange={e => setForm(f => ({ ...f, acqDate: e.target.value }))}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Acquisition cost (₹)</label>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="0"
                    value={form.acqCost}
                    onChange={e => setForm(f => ({ ...f, acqCost: e.target.value }))}
                  />
                </div>
              </div>

              <label style={styles.label}>Condition</label>
              <select
                style={styles.input}
                value={form.condition}
                onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}
              >
                {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
              </select>

              <label style={styles.label}>Location *</label>
              <input
                style={styles.input}
                placeholder="e.g. Mumbai HQ, 4th floor"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />

              <label style={styles.toggleRow}>
                <input
                  type="checkbox"
                  style={{ width: 15, height: 15 }}
                  checked={form.shared}
                  onChange={e => setForm(f => ({ ...f, shared: e.target.checked }))}
                />
                <span style={{ fontSize: 13, color: COLORS.navy }}>
                  Shared / bookable resource
                </span>
              </label>

              <label style={styles.label}>Photo / documents</label>
              <div style={styles.uploadBox}>Drop a file here or click to upload</div>
            </div>

            <div style={styles.drawerFooter}>
              <button
                style={styles.secondaryButton}
                onClick={() => { setRegisterOpen(false); setForm(blankForm); setFormError(''); }}
              >
                Cancel
              </button>
              <button
                style={{ ...styles.primaryButton, opacity: saving ? 0.7 : 1 }}
                onClick={handleRegister}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Save asset'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          DETAIL DRAWER
      ══════════════════════════════════════════════════════════ */}
      {selectedAsset && (
        <>
          <div style={styles.overlay} onClick={() => setSelectedAsset(null)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>{selectedAsset.name}</p>
                <p style={styles.drawerSubtitle}>
                  <span style={styles.tagMono}>{selectedAsset.tag}</span>
                </p>
              </div>
              <button style={styles.closeBtn} onClick={() => setSelectedAsset(null)}>✕</button>
            </div>

            <div style={styles.drawerBody}>
              {/* ── Status pill ─── */}
              {(() => {
                const s = STATUS_STYLES[selectedAsset.status] || STATUS_STYLES.Available;
                return (
                  <span style={{ ...styles.statusPill, background: s.bg, color: s.text, marginBottom: 20, display: 'inline-block' }}>
                    {selectedAsset.status}
                  </span>
                );
              })()}

              {/* ── Detail grid ─── */}
              <div style={styles.detailGrid}>
                <DetailRow label="Category"        value={selectedAsset.category} />
                <DetailRow label="Serial number"   value={selectedAsset.serial || '—'} />
                <DetailRow label="Condition"       value={selectedAsset.condition} />
                <DetailRow label="Location"        value={selectedAsset.location || '—'} />
                <DetailRow label="Department"      value={selectedAsset.department || '—'} />
                <DetailRow label="Acquisition date" value={selectedAsset.acqDate || '—'} />
                <DetailRow label="Cost"            value={selectedAsset.acqCost ? `₹${Number(selectedAsset.acqCost).toLocaleString()}` : '—'} />
                <DetailRow label="Bookable"        value={selectedAsset.shared ? 'Yes' : 'No'} />
              </div>

              {/* ── Allocation history ─── */}
              <p style={styles.sectionTitle}>Allocation history</p>
              {assetAllocHistory.length === 0 ? (
                <p style={styles.emptyText}>No allocation history.</p>
              ) : (
                assetAllocHistory.map(al => {
                  const emp = employees.find(e => e.id === al.employeeId);
                  return (
                    <div key={al.id} style={styles.historyRow}>
                      <div>
                        <span style={styles.rowText}>{emp?.name || 'Unknown'}</span>
                        <p style={styles.rowSub}>{emp?.department} · Since {al.allocationDate}</p>
                      </div>
                      <span style={{
                        ...styles.statusPill,
                        background: al.status === 'Active' ? '#E7EFFC' : '#EEF1F5',
                        color:      al.status === 'Active' ? COLORS.accent : COLORS.textMuted,
                        fontSize: 11,
                      }}>
                        {al.status}
                      </span>
                    </div>
                  );
                })
              )}

              {/* ── Maintenance history ─── */}
              <p style={styles.sectionTitle}>Maintenance history</p>
              {assetMaintHistory.length === 0 ? (
                <p style={styles.emptyText}>No maintenance history.</p>
              ) : (
                assetMaintHistory.map(m => (
                  <div key={m.id} style={{ ...styles.historyRow, background: COLORS.warningBg }}>
                    <div>
                      <span style={styles.rowText}>{m.issueDescription}</span>
                      <p style={styles.rowSub}>{m.priority} priority · {m.reportedDate}</p>
                    </div>
                    <span style={{
                      ...styles.statusPill,
                      background: m.status === 'Resolved' ? COLORS.successBg : COLORS.warningBg,
                      color:      m.status === 'Resolved' ? COLORS.success : COLORS.warning,
                      fontSize: 11, border: `0.5px solid ${COLORS.border}`,
                    }}>
                      {m.status}
                    </span>
                  </div>
                ))
              )}

              {/* ── Lifecycle history ─── */}
              {selectedAsset.history?.length > 0 && (
                <>
                  <p style={styles.sectionTitle}>Lifecycle log</p>
                  {[...selectedAsset.history].reverse().map((h, i) => (
                    <div key={i} style={{ ...styles.historyRow, background: COLORS.bg }}>
                      <div>
                        <span style={{ ...styles.rowText, fontSize: 12 }}>{h.details}</span>
                        <p style={styles.rowSub}>{h.type} · {h.date}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* ── Footer actions ─── */}
            <div style={styles.drawerFooter}>
              {selectedAsset.status !== 'Retired' && (
                <button
                  style={{ ...styles.secondaryButton, color: COLORS.danger, borderColor: COLORS.dangerBg }}
                  onClick={() => {
                    updateAsset(selectedAsset.id, { status: 'Retired' });
                    setSelectedAsset(null);
                  }}
                >
                  Retire asset
                </button>
              )}
              <button style={styles.primaryButton} onClick={() => setSelectedAsset(null)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={styles.detailRow}>
      <span style={styles.detailLabel}>{label}</span>
      <span style={styles.detailValue}>{value}</span>
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
    background: COLORS.accent, color: '#FFF', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  secondaryButton: {
    background: '#FFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  filterRow:    { display: 'flex', gap: 10, marginBottom: '1.25rem', flexWrap: 'wrap' },
  searchInput:  { flex: 1, minWidth: 200, height: 40, padding: '0 14px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy },
  filterSelect: { height: 40, padding: '0 12px', borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFF', fontSize: 13, fontFamily: 'inherit', color: COLORS.navy },
  tableCard:    { background: '#FFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:           { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' },
  tableRow:     {
    display: 'flex', alignItems: 'center', padding: '13px 16px',
    borderBottom: `0.5px solid ${COLORS.border}`, cursor: 'pointer',
    transition: 'background 0.12s',
  },
  td:           { fontSize: 13, color: COLORS.textSecondary },
  tagMono:      { fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: COLORS.navy, fontWeight: 500 },
  sharedBadge:  { marginLeft: 8, fontSize: 10, background: COLORS.purpleBg, color: COLORS.purple, borderRadius: 4, padding: '2px 6px', fontWeight: 500 },
  statusPill:   { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, display: 'inline-block' },
  emptyState:   { padding: '3rem', textAlign: 'center', fontSize: 13, color: COLORS.textMuted },

  overlay: { position: 'fixed', inset: 0, background: 'rgba(22,35,61,0.3)', zIndex: 50 },
  drawer: {
    position: 'fixed', top: 0, right: 0, width: 440, height: '100vh',
    background: '#FFF', zIndex: 51,
    boxShadow: '-6px 0 32px rgba(22,35,61,0.1)',
    display: 'flex', flexDirection: 'column',
  },
  drawerHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '1.5rem', borderBottom: `0.5px solid ${COLORS.border}`,
  },
  drawerTitle:    { fontSize: 17, fontWeight: 500, color: COLORS.navy, margin: 0 },
  drawerSubtitle: { fontSize: 12, color: COLORS.textSecondary, margin: '4px 0 0' },
  closeBtn:       { border: 'none', background: 'transparent', fontSize: 18, color: COLORS.textMuted, cursor: 'pointer', lineHeight: 1 },
  drawerBody:     { padding: '1.5rem', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  drawerFooter:   { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '1.25rem 1.5rem', borderTop: `0.5px solid ${COLORS.border}` },

  label:        { fontSize: 12, color: COLORS.navy, fontWeight: 500, marginTop: 4 },
  input:        { width: '100%', margin: '6px 0 14px', padding: '0 12px', height: 40, borderRadius: 8, border: `0.5px solid ${COLORS.border}`, background: '#FFF', fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box', color: COLORS.navy, display: 'block' },
  inlineFields: { display: 'flex', gap: 12 },
  toggleRow:    { display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 16px', cursor: 'pointer' },
  uploadBox:    { border: `1.5px dashed ${COLORS.border}`, borderRadius: 8, padding: '1.5rem', textAlign: 'center', fontSize: 12, color: COLORS.textMuted, cursor: 'pointer', marginTop: 6 },
  errorBox:     { background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  detailGrid:   { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 4 },
  detailRow:    { display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: `0.5px solid ${COLORS.bg}` },
  detailLabel:  { color: COLORS.textMuted },
  detailValue:  { color: COLORS.navy, fontWeight: 500, textAlign: 'right', maxWidth: '60%' },

  sectionTitle: { fontSize: 13, fontWeight: 600, color: COLORS.navy, margin: '20px 0 8px', letterSpacing: '0.01em' },
  emptyText:    { fontSize: 12, color: COLORS.textMuted, marginBottom: 8 },
  historyRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: COLORS.bg, borderRadius: 8, padding: '10px 12px', marginBottom: 6 },
  rowText:      { fontSize: 13, color: COLORS.navy, fontWeight: 500 },
  rowSub:       { fontSize: 11, color: COLORS.textMuted, margin: '2px 0 0' },
};
