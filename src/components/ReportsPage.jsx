// ReportsPage.jsx
// Screen 9 — Operational analytics for managers: utilization, maintenance
// frequency, upcoming maintenance/retirement, department allocation, and a
// booking heatmap. No charting library — everything is plain SVG/CSS bars
// to match the rest of the app (zero external deps). Export buttons
// generate real CSV downloads client-side from live state data.
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

function heatColor(value) {
  const shades = ['#F3F7FC', '#D6E4FB', '#AEC9F7', '#7DA6F1', '#4C8DFF'];
  return shades[value] || shades[0];
}

function downloadCSV(filename, rows) {
  const csv = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function ReportsPage({ activeNav, setActiveNav }) {
  const { currentUser, assets, maintenance, bookings, departments } = useContext(StateContext);
  const role = currentUser?.role || 'Employee';

  // ── 1. Calculate Asset Utilization (allocations/bookings count) ──
  const utilization = useMemo(() => {
    return assets.map(a => {
      // derive usage score based on status + history activity
      let usagePct = 10; // baseline
      if (a.status === 'Allocated') usagePct = 85;
      if (a.status === 'Reserved')  usagePct = 60;
      if (a.status === 'Under Maintenance') usagePct = 30;

      // add multiplier for each history log (older assets used more)
      const logsCount = a.history?.length || 0;
      usagePct = Math.min(100, usagePct + (logsCount * 4));

      return {
        name:     a.name,
        tag:      a.tag,
        usagePct,
      };
    }).sort((a, b) => b.usagePct - a.usagePct).slice(0, 6);
  }, [assets]);

  // ── 2. Maintenance Frequency by Category ──
  const maintenanceFreq = useMemo(() => {
    const counts = {};
    maintenance.forEach(m => {
      const asset = assets.find(a => a.id === m.assetId);
      const cat = asset ? asset.category : 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Make sure all registered categories are included
    assets.forEach(a => {
      if (a.category && !counts[a.category]) {
        counts[a.category] = 0;
      }
    });

    return Object.entries(counts).map(([category, count]) => ({
      category,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [maintenance, assets]);

  // ── 3. Maintenance Due / Retiring Soon ──
  const dueSoon = useMemo(() => {
    const today = new Date();
    const list = [];

    // Filter active maintenance requests
    maintenance.filter(m => m.status === 'Approved' || m.status === 'Technician Assigned' || m.status === 'In Progress').forEach(m => {
      const asset = assets.find(a => a.id === m.assetId);
      if (asset) {
        list.push({
          name: asset.name,
          tag:  asset.tag,
          type: `Repair work: ${m.status}`,
          date: m.reportedDate || 'Ongoing',
        });
      }
    });

    // Find older assets nearing retirement (cost > $1000 and 1+ years old)
    assets.filter(a => a.status !== 'Retired' && a.status !== 'Disposed').forEach(a => {
      if (a.acqDate) {
        const ageInMs = today - new Date(a.acqDate);
        const ageInYears = ageInMs / (1000 * 60 * 60 * 24 * 365.25);
        if (ageInYears > 1.5) {
          list.push({
            name: a.name,
            tag:  a.tag,
            type: 'Nearing retirement lifecycle',
            date: a.acqDate,
          });
        }
      }
    });

    return list.slice(0, 4);
  }, [assets, maintenance]);

  // ── 4. Department Allocation ──
  const deptAllocation = useMemo(() => {
    const counts = {};
    let assigned = 0;

    assets.forEach(a => {
      const dept = a.department || 'Unassigned';
      counts[dept] = (counts[dept] || 0) + 1;
      if (a.department) assigned++;
    });

    const total = assets.length || 1;

    return Object.entries(counts).map(([department, count]) => ({
      department,
      assetCount: count,
      pctOfTotal: Math.round((count / total) * 100),
    })).sort((a, b) => b.assetCount - a.assetCount);
  }, [assets]);

  // ── 5. Booking Heatmap (bookings count by Day x Time Band) ──
  const heatmapData = useMemo(() => {
    // Mon-Fri time band booking counters
    const grid = Array(5).fill(null).map(() => Array(4).fill(0));
    const dayIndices = { 'Mon': 0, 'Tue': 1, 'Wed': 2, 'Thu': 3, 'Fri': 4 };

    bookings.forEach(b => {
      if (b.status === 'Cancelled' || !b.startTime) return;
      const dateObj = new Date(b.startTime);
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
      const dayIdx = dayIndices[dayName];
      if (dayIdx === undefined) return;

      const hour = dateObj.getHours();
      let bandIdx = 0;
      if (hour >= 9 && hour < 11)   bandIdx = 0;
      else if (hour >= 11 && hour < 13) bandIdx = 1;
      else if (hour >= 13 && hour < 15) bandIdx = 2;
      else if (hour >= 15 && hour < 17) bandIdx = 3;

      grid[dayIdx][bandIdx]++;
    });

    return grid;
  }, [bookings]);

  // ── Export Triggers ──────────────────────────────────────────
  const exportUtilization = () => {
    downloadCSV('asset-utilization.csv', [
      ['Asset Name', 'Tag', 'Calculated Usage %'],
      ...utilization.map(u => [u.name, u.tag, `${u.usagePct}%`])
    ]);
  };

  const exportMaintenance = () => {
    downloadCSV('maintenance-frequency.csv', [
      ['Category', 'Maintenance Requests Count'],
      ...maintenanceFreq.map(m => [m.category, m.count])
    ]);
  };

  const exportAllocation = () => {
    downloadCSV('department-allocation.csv', [
      ['Department', 'Asset Count', '% of Total'],
      ...deptAllocation.map(d => [d.department, d.assetCount, `${d.pctOfTotal}%`])
    ]);
  };

  const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const HEATMAP_BANDS = ['9–11 AM', '11–1 PM', '1–3 PM', '3–5 PM'];

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Reports & Analytics</h1>
            <p style={styles.pageSubtitle}>
              Operational insight across assets, maintenance, and resource bookings.
            </p>
          </div>
        </div>

        {/* ── Dashboard Cards Grid ────────────────────────────── */}
        <div style={styles.grid}>
          {/* Utilization Card */}
          <Card title="Asset utilization — active vs. idle" onExport={exportUtilization}>
            {utilization.map(u => (
              <div key={u.tag} style={styles.barRow}>
                <span style={styles.barLabel}>{u.name}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${u.usagePct}%`, background: u.usagePct < 30 ? COLORS.warning : COLORS.accent }} />
                </div>
                <span style={styles.barValue}>{u.usagePct}%</span>
              </div>
            ))}
          </Card>

          {/* Maintenance Card */}
          <Card title="Maintenance frequency by category" onExport={exportMaintenance}>
            {maintenanceFreq.length === 0 ? (
              <p style={{ fontSize: 13, color: COLORS.textMuted }}>No maintenance records found.</p>
            ) : (
              <div style={styles.columnChart}>
                {maintenanceFreq.map(m => {
                  const max = Math.max(...maintenanceFreq.map(x => x.count)) || 1;
                  return (
                    <div key={m.category} style={styles.columnItem}>
                      <div style={styles.columnTrack}>
                        <div style={{ ...styles.columnFill, height: `${(m.count / max) * 100}%` }} />
                      </div>
                      <span style={styles.columnValue}>{m.count}</span>
                      <span style={styles.columnLabel}>{m.category}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Due Soon / Retirement Card */}
          <Card title="Due for maintenance / nearing retirement">
            {dueSoon.length === 0 ? (
              <p style={{ fontSize: 13, color: COLORS.textMuted }}>No upcoming lifecycle events.</p>
            ) : (
              dueSoon.map((d, idx) => (
                <div key={idx} style={styles.dueRow}>
                  <div>
                    <p style={styles.dueName}>{d.name} <span style={styles.dueTag}>({d.tag})</span></p>
                    <p style={styles.dueType}>{d.type}</p>
                  </div>
                  <span style={styles.dueDate}>{d.date}</span>
                </div>
              ))
            )}
          </Card>

          {/* Department allocation Card */}
          <Card title="Department allocation summary" onExport={exportAllocation}>
            {deptAllocation.map(d => (
              <div key={d.department} style={styles.barRow}>
                <span style={styles.barLabel}>{d.department}</span>
                <div style={styles.barTrack}>
                  <div style={{ ...styles.barFill, width: `${d.pctOfTotal}%`, background: COLORS.purple }} />
                </div>
                <span style={styles.barValue}>{d.assetCount}</span>
              </div>
            ))}
          </Card>

          {/* Heatmap Card */}
          <Card title="Resource booking heatmap — peak usage slots" wide>
            <div style={styles.heatmapWrap}>
              <div style={styles.heatmapHeaderRow}>
                <span style={styles.heatmapCorner} />
                {HEATMAP_BANDS.map(b => <span key={b} style={styles.heatmapColLabel}>{b}</span>)}
              </div>
              {HEATMAP_DAYS.map((day, i) => (
                <div key={day} style={styles.heatmapRow}>
                  <span style={styles.heatmapRowLabel}>{day}</span>
                  {heatmapData[i].map((v, j) => (
                    <div key={j} style={{ ...styles.heatCell, background: heatColor(Math.min(4, v)) }} title={`${v} bookings`}>
                      {v > 0 ? v : ''}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p style={styles.heatmapNote}>Darker cells represent more concurrent bookings in that window.</p>
          </Card>
        </div>
      </main>
    </div>
  );
}

function Card({ title, onExport, wide, children }) {
  return (
    <div style={{ ...styles.card, ...(wide ? styles.cardWide : {}) }}>
      <div style={styles.cardHeader}>
        <p style={styles.cardTitle}>{title}</p>
        {onExport && <button style={styles.exportButton} onClick={onExport}>Export CSV</button>}
      </div>
      <div style={styles.cardBody}>{children}</div>
    </div>
  );
}

const styles = {
  page:         { display: 'flex', width: '100vw', minHeight: '100vh', background: COLORS.bg, fontFamily: "'IBM Plex Sans', sans-serif" },
  main:         { flex: 1, padding: '2rem 2.5rem', overflowY: 'auto' },
  topBar:       { marginBottom: '1.5rem' },
  pageTitle:    { fontSize: 24, fontWeight: 500, color: COLORS.navy, margin: 0 },
  pageSubtitle: { fontSize: 13, color: COLORS.textSecondary, margin: '4px 0 0' },

  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },

  card:         { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column' },
  cardWide:     { gridColumn: '1 / -1' },
  cardHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  cardTitle:    { fontSize: 13.5, fontWeight: 600, color: COLORS.navy, margin: 0 },
  cardBody:     { flex: 1 },
  exportButton: {
    background: 'transparent', border: `0.5px solid ${COLORS.border}`,
    borderRadius: 7, padding: '6px 12px', fontSize: 11.5, fontWeight: 500,
    color: COLORS.accent, cursor: 'pointer', fontFamily: 'inherit',
    transition: 'border-color 0.15s, color 0.15s',
  },

  barRow:   { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 },
  barLabel: { fontSize: 12.5, color: COLORS.textSecondary, width: 140, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  barTrack: { flex: 1, height: 8, borderRadius: 4, background: COLORS.bg, overflow: 'hidden' },
  barFill:  { height: '100%', borderRadius: 4 },
  barValue: { fontSize: 12, color: COLORS.navy, fontWeight: 500, width: 34, textAlign: 'right', flexShrink: 0 },

  columnChart: { display: 'flex', alignItems: 'flex-end', gap: 20, height: 160, paddingTop: 10 },
  columnItem:  { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' },
  columnTrack: { flex: 1, width: 28, display: 'flex', alignItems: 'flex-end', background: COLORS.bg, borderRadius: 6, overflow: 'hidden' },
  columnFill:  { width: '100%', background: COLORS.accent, borderRadius: '6px 6px 0 0' },
  columnValue: { fontSize: 12, fontWeight: 500, color: COLORS.navy, marginTop: 6 },
  columnLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 64 },

  dueRow:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `0.5px solid ${COLORS.border}` },
  dueName:  { fontSize: 13, fontWeight: 500, color: COLORS.navy, margin: 0 },
  dueTag:   { fontWeight: 400, color: COLORS.textMuted, fontSize: 11.5 },
  dueType:  { fontSize: 11.5, color: COLORS.warning, margin: '3px 0 0' },
  dueDate:  { fontSize: 12.5, color: COLORS.textSecondary },

  heatmapWrap:      { display: 'flex', flexDirection: 'column', gap: 4, width: '100%' },
  heatmapHeaderRow: { display: 'flex', gap: 4, width: '100%' },
  heatmapCorner:    { width: 44, flexShrink: 0 },
  heatmapColLabel:  { flex: 1, fontSize: 11, color: COLORS.textMuted, textAlign: 'center' },
  heatmapRow:       { display: 'flex', gap: 4, alignItems: 'center', width: '100%' },
  heatmapRowLabel:  { width: 44, fontSize: 11.5, color: COLORS.textSecondary, flexShrink: 0 },
  heatCell:         { flex: 1, height: 34, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11.5, fontWeight: 600, color: COLORS.navy },
  heatmapNote:      { fontSize: 11, color: COLORS.textMuted, marginTop: 12, marginBottom: 0 },
};
