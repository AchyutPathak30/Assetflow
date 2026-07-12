import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const AssetAllocationView = () => {
  const {
    assets,
    allocations,
    employees,
    transfersList,
    approveTransfer,
    rejectTransfer,
    allocateAsset,
    requestTransfer,
    returnAsset,
    getActiveRole,
    getActiveUser
  } = useContext(StateContext);

  const activeRole = getActiveRole();
  const activeUser = getActiveUser();

  const [showAllocModal, setShowAllocModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(null); // Asset object

  // Form states
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

  // Conflict state
  const [conflictData, setConflictData] = useState(null); // { assetId, employeeId, holderName }

  // Submit allocation
  const handleAllocate = (e) => {
    e.preventDefault();
    if (!selectedAssetId || !selectedEmployeeId) return;

    const result = allocateAsset(selectedAssetId, selectedEmployeeId, expectedReturnDate, notes);
    
    if (result.success) {
      resetForm();
    } else if (result.conflict) {
      setConflictData({
        assetId: selectedAssetId,
        employeeId: selectedEmployeeId,
        holderName: result.holderName
      });
    } else {
      alert(result.message);
    }
  };

  const handleCreateTransfer = () => {
    if (!conflictData) return;
    requestTransfer(conflictData.assetId, conflictData.employeeId);
    setConflictData(null);
    resetForm();
  };

  const resetForm = () => {
    setSelectedAssetId('');
    setSelectedEmployeeId('');
    setExpectedReturnDate('');
    setNotes('');
    setShowAllocModal(false);
  };

  // Handle return
  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!showReturnModal) return;
    returnAsset(showReturnModal.id, returnNotes, returnCondition);
    setShowReturnModal(null);
    setReturnNotes('');
    setReturnCondition('Good');
  };

  return (
    <div className="asset-allocation-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Asset Allocation & Transfers</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage assignments, process handovers, and resolve double-booking conflicts.</p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Asset Manager') && (
          <button className="btn btn-primary" onClick={() => setShowAllocModal(true)}>
            ➕ Allocate Asset
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Active Allocations */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Active Allocations</h2>
          {allocations.filter(al => al.status === 'Active').length === 0 ? (
            <div className="empty-state">No active allocations in the system.</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Holder</th>
                    <th>Date Assigned</th>
                    <th>Expected Return</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allocations.filter(al => al.status === 'Active').map(alloc => {
                    const asset = assets.find(a => a.id === alloc.assetId);
                    const holder = employees.find(e => e.id === alloc.employeeId);
                    const isOverdue = alloc.expectedReturnDate && new Date(alloc.expectedReturnDate) < new Date();
                    
                    return (
                      <tr key={alloc.id}>
                        <td>
                          <span style={{ fontWeight: 600, display: 'block' }}>{asset ? asset.name : 'N/A'}</span>
                          <span className="asset-tag" style={{ fontSize: '0.7rem' }}>{asset ? asset.tag : 'N/A'}</span>
                        </td>
                        <td>{holder ? holder.name : 'N/A'}</td>
                        <td>{alloc.allocatedDate}</td>
                        <td style={{ color: isOverdue ? 'var(--color-danger)' : 'inherit', fontWeight: isOverdue ? 700 : 'normal' }}>
                          {alloc.expectedReturnDate || 'N/A'} {isOverdue && '⚠️'}
                        </td>
                        <td>
                          {(activeRole === 'Admin' || activeRole === 'Asset Manager') && asset && (
                            <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setShowReturnModal(asset)}>
                              Return
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Transfer Requests */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Transfer Workflow</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Transfers occur when an asset is assigned to another user, shifting allocation once approved.
          </p>

          {transfersList.length === 0 ? (
            <div className="empty-state">No transfer requests filed.</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>From ➔ To</th>
                    <th>Date Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {transfersList.map(trans => {
                    const asset = assets.find(a => a.id === trans.assetId);
                    const fromEmp = employees.find(e => e.id === trans.fromId);
                    const toEmp = employees.find(e => e.id === trans.toId);
                    
                    return (
                      <tr key={trans.id}>
                        <td>
                          <span style={{ fontWeight: 600, display: 'block' }}>{asset?.name}</span>
                          <span className="asset-tag" style={{ fontSize: '0.7rem' }}>{asset?.tag}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', display: 'block', color: 'white' }}>{fromEmp?.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>➔ {toEmp?.name}</span>
                        </td>
                        <td>{trans.requestDate}</td>
                        <td>
                          <span className={`badge ${
                            trans.status === 'Approved' ? 'badge-available' : 
                            trans.status === 'Pending' ? 'badge-undermaintenance' : 'badge-retired'
                          }`}>
                            {trans.status}
                          </span>
                        </td>
                        <td>
                          {trans.status === 'Pending' && (activeRole === 'Admin' || activeRole === 'Asset Manager') && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button className="btn btn-success" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => approveTransfer(trans.id)}>
                                Approve
                              </button>
                              <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => rejectTransfer(trans.id)}>
                                Deny
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Allocate Modal */}
      {showAllocModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Allocate Asset</h3>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            <form onSubmit={handleAllocate}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Asset</label>
                  <select
                    className="form-control"
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.tag}) - {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign to Employee</label>
                  <select
                    className="form-control"
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose Employee --</option>
                    {employees.filter(e => e.status === 'Active').map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.department})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Expected Return Date (optional)</label>
                  <input
                    type="date"
                    className="form-control"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Allocation Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter context, details, or checkout terms..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Asset</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conflict Handler Modal */}
      {conflictData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', border: '1px solid var(--color-danger)' }}>
            <div className="modal-header">
              <h3 style={{ color: 'var(--color-danger)' }}>⚠️ Allocation Conflict</h3>
              <button className="modal-close" onClick={() => setConflictData(null)}>×</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px' }}>
                This asset cannot be directly allocated. It is currently held by <strong>{conflictData.holderName}</strong>.
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Would you like to initiate a **Transfer Request**? The current holder and manager will be notified to approve the handover.
              </p>
            </div>
            <div className="modal-footer" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setConflictData(null)}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCreateTransfer}>Request Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Return Asset Modal */}
      {showReturnModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Return Asset: {showReturnModal.name}</h3>
              <button className="modal-close" onClick={() => setShowReturnModal(null)}>×</button>
            </div>
            <form onSubmit={handleReturnSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Condition Check-in Status</label>
                  <select
                    className="form-control"
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Needs Repair">Needs Repair</option>
                    <option value="Damaged">Damaged</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Check-in Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter return notes..."
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-success">Approve Return</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetAllocationView;
