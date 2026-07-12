import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const DashboardView = ({ setActiveTab }) => {
  const {
    assets,
    allocations,
    bookings,
    maintenance,
    transfersList,
    employees,
    getActiveUser,
    raiseMaintenanceRequest,
    registerAsset,
    categories
  } = useContext(StateContext);

  const activeUser = getActiveUser();
  const [showMaintModal, setShowMaintModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Maintenance form state
  const [maintAssetId, setMaintAssetId] = useState('');
  const [maintIssue, setMaintIssue] = useState('');
  const [maintPriority, setMaintPriority] = useState('Medium');

  // Asset registration form state
  const [regName, setRegName] = useState('');
  const [regCategory, setRegCategory] = useState(categories[0]?.name || '');
  const [regSerial, setRegSerial] = useState('');
  const [regAcqDate, setRegAcqDate] = useState(new Date().toISOString().substring(0, 10));
  const [regCost, setRegCost] = useState('');
  const [regCondition, setRegCondition] = useState('Excellent');
  const [regLocation, setRegLocation] = useState('');
  const [regShared, setRegShared] = useState(false);
  const [regCustomFields, setRegCustomFields] = useState({});

  // Filter categories details
  const selectedCategoryObj = categories.find(c => c.name === regCategory);

  // Compute KPI values
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const maintenanceCount = assets.filter(a => a.status === 'Under Maintenance').length;
  
  const todayStr = new Date().toISOString().substring(0, 10);
  const activeBookingsCount = bookings.filter(b => b.status === 'Upcoming' || b.status === 'Ongoing').length;
  const pendingTransfersCount = transfersList.filter(t => t.status === 'Pending').length;

  // Overdue returns calculation: Active allocations where expectedReturnDate < today
  const overdueAllocations = allocations.filter(al => {
    if (al.status !== 'Active' || !al.expectedReturnDate) return false;
    return new Date(al.expectedReturnDate) < new Date(todayStr);
  }).map(al => {
    const asset = assets.find(a => a.id === al.assetId);
    const holder = employees.find(e => e.id === al.employeeId);
    return {
      ...al,
      assetName: asset ? asset.name : 'Unknown Asset',
      assetTag: asset ? asset.tag : 'N/A',
      holderName: holder ? holder.name : 'Unknown Employee',
      daysOverdue: Math.round((new Date(todayStr) - new Date(al.expectedReturnDate)) / (1000 * 60 * 60 * 24))
    };
  });

  const overdueCount = overdueAllocations.length;

  // Handle Maintenance Submit
  const handleMaintSubmit = (e) => {
    e.preventDefault();
    if (!maintAssetId || !maintIssue) return;
    raiseMaintenanceRequest(maintAssetId, maintIssue, maintPriority);
    setMaintAssetId('');
    setMaintIssue('');
    setMaintPriority('Medium');
    setShowMaintModal(false);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regSerial) return;
    registerAsset(regName, regCategory, regSerial, regAcqDate, regCost, regCondition, regLocation, regShared, regCustomFields);
    setRegName('');
    setRegSerial('');
    setRegCost('');
    setRegLocation('');
    setRegShared(false);
    setRegCustomFields({});
    setShowRegisterModal(false);
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setRegCustomFields(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  return (
    <div className="dashboard-view">
      <div className="header-greeting" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>Welcome back,</h3>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {activeUser?.name}
        </h1>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Role: {activeUser?.role}
        </span>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="glass-card kpi-card kpi-available">
          <div className="kpi-icon">📦</div>
          <div className="kpi-data">
            <span className="kpi-label">Assets Available</span>
            <span className="kpi-value">{availableCount}</span>
          </div>
        </div>

        <div className="glass-card kpi-card kpi-allocated">
          <div className="kpi-icon">👤</div>
          <div className="kpi-data">
            <span className="kpi-label">Assets Allocated</span>
            <span className="kpi-value">{allocatedCount}</span>
          </div>
        </div>

        <div className="glass-card kpi-card kpi-maintenance">
          <div className="kpi-icon">🔧</div>
          <div className="kpi-data">
            <span className="kpi-label">Under Maintenance</span>
            <span className="kpi-value">{maintenanceCount}</span>
          </div>
        </div>

        <div className="glass-card kpi-card kpi-bookings">
          <div className="kpi-icon">📅</div>
          <div className="kpi-data">
            <span className="kpi-label">Active Bookings</span>
            <span className="kpi-value">{activeBookingsCount}</span>
          </div>
        </div>

        <div className="glass-card kpi-card kpi-transfers">
          <div className="kpi-icon">🔄</div>
          <div className="kpi-data">
            <span className="kpi-label">Pending Transfers</span>
            <span className="kpi-value">{pendingTransfersCount}</span>
          </div>
        </div>

        <div className={`glass-card kpi-card kpi-overdue ${overdueCount > 0 ? 'pulse-danger' : ''}`}>
          <div className="kpi-icon">⚠️</div>
          <div className="kpi-data">
            <span className="kpi-label">Overdue Returns</span>
            <span className="kpi-value" style={{ color: overdueCount > 0 ? 'var(--color-danger)' : 'inherit' }}>{overdueCount}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Quick Operations</h3>
        <div className="quick-actions-bar">
          {(activeUser?.role === 'Admin' || activeUser?.role === 'Asset Manager') && (
            <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
              ➕ Register New Asset
            </button>
          )}
          
          <button className="btn btn-secondary" onClick={() => setActiveTab('bookings')}>
            📅 Book Shared Resource
          </button>

          <button className="btn btn-secondary" onClick={() => setShowMaintModal(true)}>
            🔧 Raise Maintenance Request
          </button>
        </div>
      </div>

      {/* Overdue Returns Detail Panel */}
      {overdueCount > 0 && (
        <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.02)', marginBottom: '32px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '16px', display: 'flex', alignPage: 'center', gap: '8px' }}>
            ⚠️ CRITICAL ALERT: Overdue Returns ({overdueCount})
          </h3>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name</th>
                  <th>Assigned Holder</th>
                  <th>Expected Return Date</th>
                  <th>Days Overdue</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {overdueAllocations.map(alloc => (
                  <tr key={alloc.id}>
                    <td className="asset-tag">{alloc.assetTag}</td>
                    <td style={{ fontWeight: 600 }}>{alloc.assetName}</td>
                    <td>{alloc.holderName}</td>
                    <td style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{alloc.expectedReturnDate}</td>
                    <td>
                      <span className="badge badge-lost" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {alloc.daysOverdue} days late
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('allocations')}>
                        Manage Return
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Overview Info / System Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '32px' }}>
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Your Allocated Assets</h3>
          {assets.filter(a => a.assignedTo === activeUser?.id).length === 0 ? (
            <div className="empty-state">You do not hold any allocated assets.</div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {assets.filter(a => a.assignedTo === activeUser?.id).map(a => (
                <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <span style={{ fontWeight: 600, display: 'block' }}>{a.name}</span>
                    <span className="asset-tag" style={{ fontSize: '0.75rem' }}>{a.tag}</span>
                  </div>
                  <span className={`badge badge-${a.status.toLowerCase().replace(' ', '')}`}>{a.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card">
          <h3 style={{ marginBottom: '16px' }}>Pending Approvals</h3>
          {/* List transfer requests or maintenance approvals pending for manager */}
          {activeUser?.role !== 'Asset Manager' && activeUser?.role !== 'Admin' && activeUser?.role !== 'Department Head' ? (
            <div className="empty-state">Only managers and heads have approval actions.</div>
          ) : (
            <div>
              {/* Transfer requests */}
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Transfer Requests</h4>
              {transfersList.filter(t => t.status === 'Pending').length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>No pending transfers.</div>
              ) : (
                <ul style={{ listStyle: 'none', marginBottom: '24px' }}>
                  {transfersList.filter(t => t.status === 'Pending').map(t => {
                    const asset = assets.find(a => a.id === t.assetId);
                    const toUser = employees.find(e => e.id === t.toId);
                    const fromUser = employees.find(e => e.id === t.fromId);
                    return (
                      <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{asset?.name} ({asset?.tag})</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            From {fromUser?.name} ➔ To {toUser?.name}
                          </span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('allocations')}>
                          Review
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* Maintenance approvals */}
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Maintenance Requests</h4>
              {maintenance.filter(m => m.status === 'Pending').length === 0 ? (
                <div className="empty-state" style={{ padding: '16px' }}>No pending maintenance requests.</div>
              ) : (
                <ul style={{ listStyle: 'none' }}>
                  {maintenance.filter(m => m.status === 'Pending').map(m => {
                    const asset = assets.find(a => a.id === m.assetId);
                    const reporter = employees.find(e => e.id === m.reportedBy);
                    return (
                      <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{asset?.name} ({asset?.tag})</span>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Reported by {reporter?.name}: "{m.issue}"
                          </span>
                        </div>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => setActiveTab('maintenance')}>
                          Review
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Raise Maintenance Modal */}
      {showMaintModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>🔧 Raise Maintenance Request</h3>
              <button className="modal-close" onClick={() => setShowMaintModal(false)}>×</button>
            </div>
            <form onSubmit={handleMaintSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="maintAsset">Select Asset</label>
                  <select
                    id="maintAsset"
                    className="form-control"
                    value={maintAssetId}
                    onChange={(e) => setMaintAssetId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.tag}) - Status: {a.status}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="maintIssue">Issue Description</label>
                  <textarea
                    id="maintIssue"
                    className="form-control"
                    value={maintIssue}
                    onChange={(e) => setMaintIssue(e.target.value)}
                    rows={4}
                    placeholder="Describe the problem in detail..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="maintPriority">Priority</label>
                  <select
                    id="maintPriority"
                    className="form-control"
                    value={maintPriority}
                    onChange={(e) => setMaintPriority(e.target.value)}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMaintModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Asset Modal */}
      {showRegisterModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📦 Register New Asset</h3>
              <button className="modal-close" onClick={() => setShowRegisterModal(false)}>×</button>
            </div>
            <form onSubmit={handleRegisterSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Asset Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. MacBook Pro, Conference Chair"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={regCategory}
                    onChange={(e) => {
                      setRegCategory(e.target.value);
                      setRegCustomFields({});
                    }}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={regSerial}
                    onChange={(e) => setRegSerial(e.target.value)}
                    placeholder="e.g. SN1234567"
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Acquisition Date</label>
                    <input
                      type="date"
                      className="form-control"
                      value={regAcqDate}
                      onChange={(e) => setRegAcqDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Acquisition Cost ($)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={regCost}
                      onChange={(e) => setRegCost(e.target.value)}
                      placeholder="e.g. 1200"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <select
                    className="form-control"
                    value={regCondition}
                    onChange={(e) => setRegCondition(e.target.value)}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    className="form-control"
                    value={regLocation}
                    onChange={(e) => setRegLocation(e.target.value)}
                    placeholder="e.g. Headquarters - 3rd Floor"
                    required
                  />
                </div>

                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '8px', padding: '8px 0' }}>
                  <input
                    type="checkbox"
                    id="sharedBookable"
                    checked={regShared}
                    onChange={(e) => setRegShared(e.target.checked)}
                  />
                  <label htmlFor="sharedBookable" style={{ cursor: 'pointer' }}>Mark as Shared / Bookable Resource</label>
                </div>

                {/* Category-specific fields */}
                {selectedCategoryObj && selectedCategoryObj.fields && selectedCategoryObj.fields.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Category Fields ({selectedCategoryObj.name})</h4>
                    {selectedCategoryObj.fields.map(field => (
                      <div className="form-group" key={field.name}>
                        <label>{field.name} {field.required && '*'}</label>
                        <input
                          type={field.type}
                          className="form-control"
                          value={regCustomFields[field.name] || ''}
                          onChange={(e) => handleCustomFieldChange(field.name, e.target.value)}
                          required={field.required}
                          placeholder={`Enter ${field.name.toLowerCase()}...`}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardView;
