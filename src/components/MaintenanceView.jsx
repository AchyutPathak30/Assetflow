import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const MaintenanceView = () => {
  const {
    assets,
    maintenance,
    employees,
    raiseMaintenanceRequest,
    updateMaintenanceStatus,
    getActiveRole,
    getActiveUser
  } = useContext(StateContext);

  const activeRole = getActiveRole();
  const activeUser = getActiveUser();

  const [showReqModal, setShowReqModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(null); // Maintenance request object

  // Form state
  const [reqAssetId, setReqAssetId] = useState('');
  const [reqIssue, setReqIssue] = useState('');
  const [reqPriority, setReqPriority] = useState('Medium');

  // Manager action forms
  const [maintTech, setMaintTech] = useState('');
  const [maintCost, setMaintCost] = useState('');
  const [maintNote, setMaintNote] = useState('');

  // Raise Request Submit
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!reqAssetId || !reqIssue) return;
    raiseMaintenanceRequest(reqAssetId, reqIssue, reqPriority);
    setReqAssetId('');
    setReqIssue('');
    setReqPriority('Medium');
    setShowReqModal(false);
  };

  // Manager updates status
  const handleManagerUpdate = (id, newStatus, defaultNote = '') => {
    const additionalData = {};
    if (newStatus === 'Technician Assigned' || newStatus === 'In Progress') {
      if (!maintTech) {
        alert('Please specify a technician.');
        return;
      }
      additionalData.technician = maintTech;
    }
    if (newStatus === 'Resolved') {
      additionalData.cost = Number(maintCost) || 0;
      if (maintTech) additionalData.technician = maintTech;
    }

    updateMaintenanceStatus(id, newStatus, maintNote || defaultNote, additionalData);
    setMaintTech('');
    setMaintCost('');
    setMaintNote('');
    setShowDetailModal(null);
  };

  return (
    <div className="maintenance-view">
      <div style={{ display: 'flex', justify: 'space-between', marginBottom: '24px', alignPage: 'center', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Maintenance Management</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Route repairs, assign technicians, track repair history, and automatically update asset lifecycles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowReqModal(true)}>
          🔧 Raise Maintenance Request
        </button>
      </div>

      {/* Requests table list */}
      <div className="glass-card">
        <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Repair Orders & Requests</h2>
        {maintenance.length === 0 ? (
          <div className="empty-state">No maintenance orders placed.</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Priority</th>
                  <th>Issue Reported</th>
                  <th>Date Raised</th>
                  <th>Current Workflow Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {maintenance.map(m => {
                  const asset = assets.find(a => a.id === m.assetId);
                  
                  return (
                    <tr key={m.id}>
                      <td>
                        <span style={{ fontWeight: 600, display: 'block' }}>{asset ? asset.name : 'N/A'}</span>
                        <span className="asset-tag" style={{ fontSize: '0.7rem' }}>{asset ? asset.tag : 'N/A'}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          m.priority === 'Critical' ? 'badge-lost' : 
                          m.priority === 'High' ? 'badge-undermaintenance' : 
                          m.priority === 'Medium' ? 'badge-allocated' : 'badge-available'
                        }`}>
                          {m.priority}
                        </span>
                      </td>
                      <td>{m.issue}</td>
                      <td>{m.reportedDate}</td>
                      <td>
                        <span className={`badge ${
                          m.status === 'Resolved' ? 'badge-available' : 
                          m.status === 'Pending' ? 'badge-undermaintenance' : 'badge-reserved'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setShowDetailModal(m)}>
                          ✏️ Manage Workflow
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Raise Request Modal */}
      {showReqModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🔧 Raise Maintenance Request</h3>
              <button className="modal-close" onClick={() => setShowReqModal(false)}>×</button>
            </div>
            <form onSubmit={handleRequestSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Affected Asset</label>
                  <select
                    className="form-control"
                    value={reqAssetId}
                    onChange={(e) => setReqAssetId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.tag}) - Condition: {a.condition}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Issue Description</label>
                  <textarea
                    className="form-control"
                    value={reqIssue}
                    onChange={(e) => setReqIssue(e.target.value)}
                    rows={4}
                    placeholder="Describe the failure, hardware/software issues in detail..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={reqPriority}
                    onChange={(e) => setReqPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical (Halting work)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReqModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">File Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail / Manage Workflow Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3>Maintenance Detail: {assets.find(a => a.id === showDetailModal.assetId)?.name}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Reporter</span>
                  <p style={{ fontWeight: 600 }}>{employees.find(e => e.id === showDetailModal.reportedBy)?.name}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date Reported</span>
                  <p style={{ fontWeight: 600 }}>{showDetailModal.reportedDate}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Technician Assigned</span>
                  <p style={{ fontWeight: 600, color: showDetailModal.technician ? 'white' : 'var(--text-dark)' }}>
                    {showDetailModal.technician || 'Not Assigned'}
                  </p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Repair Cost</span>
                  <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>${showDetailModal.cost || 0}</p>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Failure Details</span>
                <p style={{ color: 'white', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid var(--border-color)', marginTop: '4px' }}>
                  "{showDetailModal.issue}"
                </p>
              </div>

              {/* Workflow Status Tracker */}
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Workflow Timeline</span>
                <div className="timeline" style={{ marginTop: '12px' }}>
                  {showDetailModal.history.map((h, idx) => (
                    <div key={idx} className="timeline-item completed">
                      <div className="timeline-date">{h.date}</div>
                      <div className="timeline-title">{h.status}</div>
                      <div className="timeline-desc">{h.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MANAGER ACTIONS PANEL */}
              {(activeRole === 'Admin' || activeRole === 'Asset Manager') && showDetailModal.status !== 'Resolved' && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px' }}>Advance Repair Workflow</h4>
                  
                  {/* Notes fields */}
                  <div className="form-group">
                    <label>Action Notes</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter details of what changes are being made..."
                      value={maintNote}
                      onChange={(e) => setMaintNote(e.target.value)}
                    />
                  </div>

                  {/* Contextual actions */}
                  {showDetailModal.status === 'Pending' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="button" className="btn btn-primary" onClick={() => handleManagerUpdate(showDetailModal.id, 'Under Maintenance', 'Approved by manager')}>
                        ✅ Approve Request
                      </button>
                      <button type="button" className="btn btn-danger" onClick={() => handleManagerUpdate(showDetailModal.id, 'Rejected', 'Rejected by manager')}>
                        ❌ Reject
                      </button>
                    </div>
                  )}

                  {showDetailModal.status === 'Under Maintenance' && (
                    <div>
                      <div className="form-group">
                        <label>Assign Technician Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Alice Cooper (Support Analyst)"
                          value={maintTech}
                          onChange={(e) => setMaintTech(e.target.value)}
                          required
                        />
                      </div>
                      <button type="button" className="btn btn-primary" onClick={() => handleManagerUpdate(showDetailModal.id, 'Technician Assigned', 'Technician assigned to inspect asset')}>
                        🛠️ Assign & Notify
                      </button>
                    </div>
                  )}

                  {showDetailModal.status === 'Technician Assigned' && (
                    <div>
                      <button type="button" className="btn btn-primary" onClick={() => {
                        setMaintTech(showDetailModal.technician);
                        handleManagerUpdate(showDetailModal.id, 'In Progress', 'Repair works initiated');
                      }}>
                        ⚙️ Start Work (In Progress)
                      </button>
                    </div>
                  )}

                  {showDetailModal.status === 'In Progress' && (
                    <div>
                      <div className="form-group">
                        <label>Inspection/Repair Cost ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="e.g. 150"
                          value={maintCost}
                          onChange={(e) => setMaintCost(e.target.value)}
                        />
                      </div>
                      <button type="button" className="btn btn-success" onClick={() => handleManagerUpdate(showDetailModal.id, 'Resolved', 'Repair successful, asset returned to Available status.')}>
                        🏁 Mark Resolved & Return to Available
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceView;
