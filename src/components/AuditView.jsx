import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const AuditView = () => {
  const {
    audits,
    departments,
    assets,
    employees,
    createAuditCycle,
    recordAuditVerification,
    closeAuditCycle,
    getActiveRole,
    getActiveUser
  } = useContext(StateContext);

  const activeRole = getActiveRole();
  const activeUser = getActiveUser();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeCycleForAuditor, setActiveCycleForAuditor] = useState(null); // Audit object

  // Form states
  const [auditName, setAuditName] = useState('');
  const [auditDept, setAuditDept] = useState('');
  const [auditLoc, setAuditLoc] = useState('');
  const [auditStartDate, setAuditStartDate] = useState(new Date().toISOString().substring(0, 10));
  const [auditEndDate, setAuditEndDate] = useState(new Date().toISOString().substring(0, 10));
  const [selectedAuditors, setSelectedAuditors] = useState([]);

  // Create Cycle Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!auditName || selectedAuditors.length === 0) {
      alert('Please fill name and assign at least one auditor.');
      return;
    }
    createAuditCycle(auditName, auditDept, auditLoc, auditStartDate, auditEndDate, selectedAuditors);
    setAuditName('');
    setAuditDept('');
    setAuditLoc('');
    setSelectedAuditors([]);
    setShowCreateModal(false);
  };

  const handleAuditorCheckbox = (id, checked) => {
    if (checked) {
      setSelectedAuditors([...selectedAuditors, id]);
    } else {
      setSelectedAuditors(selectedAuditors.filter(aId => aId !== id));
    }
  };

  const isUserAssignedAuditor = (audit) => {
    if (activeRole === 'Admin') return true; // Admins can audit everything
    return audit.auditors.includes(activeUser?.id);
  };

  return (
    <div className="audit-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Structured Asset Audits</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Run structured verification cycles, assign auditors, and auto-resolve discrepancies upon closing cycles.</p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Asset Manager') && (
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            ➕ Create Audit Cycle
          </button>
        )}
      </div>

      {/* Grid of Audit Cycles */}
      {activeCycleForAuditor ? (
        // Auditor checklist view
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', marginBottom: '12px', fontSize: '0.8rem' }} onClick={() => setActiveCycleForAuditor(null)}>
                ⬅️ Back to Cycles
              </button>
              <h2>{activeCycleForAuditor.name}</h2>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Scope: {activeCycleForAuditor.department || 'All Departments'} | {activeCycleForAuditor.location || 'All Locations'}
              </span>
            </div>
            {activeCycleForAuditor.status === 'Active' && (activeRole === 'Admin' || activeRole === 'Asset Manager') && (
              <button className="btn btn-danger" onClick={() => {
                closeAuditCycle(activeCycleForAuditor.id);
                setActiveCycleForAuditor(null);
              }}>
                🔒 Close Cycle & Lock Assets
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', alignItems: 'start' }}>
            
            {/* Checklist */}
            <div>
              <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Verification Checklist</h3>
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Verification Status</th>
                      <th>Auditor Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCycleForAuditor.checklist.map(item => (
                      <tr key={item.assetId}>
                        <td>
                          <span style={{ fontWeight: 600, display: 'block' }}>{item.name}</span>
                          <span className="asset-tag" style={{ fontSize: '0.7rem' }}>{item.tag}</span>
                        </td>
                        <td>
                          {activeCycleForAuditor.status === 'Closed' ? (
                            <span className={`badge ${
                              item.result === 'Verified' ? 'badge-available' : 
                              item.result === 'Pending' ? 'badge-undermaintenance' : 'badge-lost'
                            }`}>
                              {item.result}
                            </span>
                          ) : (
                            <select
                              className="form-control"
                              value={item.result}
                              onChange={(e) => recordAuditVerification(activeCycleForAuditor.id, item.assetId, e.target.value, item.notes)}
                              style={{ width: '130px', padding: '6px' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Verified">Verified</option>
                              <option value="Missing">Missing ⚠️</option>
                              <option value="Damaged">Damaged 🔧</option>
                            </select>
                          )}
                        </td>
                        <td>
                          {activeCycleForAuditor.status === 'Closed' ? (
                            <span>{item.notes || '-'}</span>
                          ) : (
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Add notes..."
                              value={item.notes}
                              onChange={(e) => recordAuditVerification(activeCycleForAuditor.id, item.assetId, item.result, e.target.value)}
                              style={{ padding: '6px' }}
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Discrepancy report preview */}
            <div className="glass-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1.1rem', color: 'var(--color-warning)' }}>Live Discrepancy Report</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Assets marked Missing or Damaged display here. Closing the cycle locks this checklist and updates the main asset state.
              </p>
              
              {activeCycleForAuditor.discrepancies.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px' }}>No discrepancies found yet.</div>
              ) : (
                <ul style={{ listStyle: 'none' }}>
                  {activeCycleForAuditor.discrepancies.map(item => (
                    <li key={item.assetId} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div>
                        <span style={{ fontWeight: 600, display: 'block' }}>{item.name}</span>
                        <span className="asset-tag" style={{ fontSize: '0.7rem' }}>{item.tag}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${item.result === 'Missing' ? 'badge-lost' : 'badge-undermaintenance'}`}>
                          {item.result}
                        </span>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-dark)', marginTop: '4px' }}>
                          {item.notes || 'No notes'}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        </div>
      ) : (
        // Main view - list of cycles
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Audit Schedules</h2>
          {audits.length === 0 ? (
            <div className="empty-state">No audit schedules defined.</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Cycle Name</th>
                    <th>Date Range</th>
                    <th>Auditors</th>
                    <th>Assets Scoped</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.map(aud => {
                    const auditorNames = aud.auditors.map(id => employees.find(e => e.id === id)?.name || id).join(', ');
                    const scopedCount = aud.checklist.length;
                    const discrepanciesCount = aud.discrepancies.length;
                    return (
                      <tr key={aud.id}>
                        <td style={{ fontWeight: 600 }}>{aud.name}</td>
                        <td>{aud.startDate} to {aud.endDate}</td>
                        <td>{auditorNames}</td>
                        <td>{scopedCount} assets</td>
                        <td>
                          <span className={`badge ${aud.status === 'Active' ? 'badge-undermaintenance' : 'badge-available'}`}>
                            {aud.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {isUserAssignedAuditor(aud) ? (
                              <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveCycleForAuditor(aud)}>
                                {aud.status === 'Active' ? '✏️ Run Audit' : '👁️ View Results'}
                              </button>
                            ) : (
                              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveCycleForAuditor(aud)}>
                                👁️ View Results
                              </button>
                            )}
                            {aud.status === 'Closed' && discrepanciesCount > 0 && (
                              <span className="badge badge-lost" style={{ display: 'inline-flex', alignItems: 'center' }}>
                                {discrepanciesCount} Discrepancy
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Audit Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Create Audit Cycle</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Audit Cycle Name</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Q3 2026 Operations Audit"
                    value={auditName}
                    onChange={(e) => setAuditName(e.target.value)}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Scope: Department</label>
                    <select
                      className="form-control"
                      value={auditDept}
                      onChange={(e) => setAuditDept(e.target.value)}
                    >
                      <option value="">All Departments</option>
                      {departments.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Scope: Location (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Headquarters"
                      value={auditLoc}
                      onChange={(e) => setAuditLoc(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={auditStartDate}
                      onChange={(e) => setAuditStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={auditEndDate}
                      onChange={(e) => setAuditEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '12px' }}>
                  <label>Assign Auditors</label>
                  <div style={{ maxHeight: '120px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', background: 'rgba(255,255,255,0.01)' }}>
                    {employees.filter(e => e.status === 'Active' && e.role !== 'Employee').map(emp => (
                      <div key={emp.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                        <input
                          type="checkbox"
                          id={`auditor-${emp.id}`}
                          checked={selectedAuditors.includes(emp.id)}
                          onChange={(e) => handleAuditorCheckbox(emp.id, e.target.checked)}
                        />
                        <label htmlFor={`auditor-${emp.id}`} style={{ cursor: 'pointer', fontSize: '0.85rem' }}>
                          {emp.name} ({emp.role})
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Audit Cycle</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditView;
