import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const AssetRegistryView = () => {
  const {
    assets,
    categories,
    departments,
    employees,
    getActiveRole,
    getActiveUser,
    registerAsset,
    updateAsset,
    allocateAsset,
    returnAsset
  } = useContext(StateContext);

  const activeRole = getActiveRole();
  const activeUser = getActiveUser();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');

  // Modals state
  const [showDetailModal, setShowDetailModal] = useState(null); // Asset object when open
  const [showAllocateModal, setShowAllocateModal] = useState(null); // Asset object when open
  const [showReturnModal, setShowReturnModal] = useState(null); // Asset object when open
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Forms state
  const [allocateEmployeeId, setAllocateEmployeeId] = useState('');
  const [allocateExpectedDate, setAllocateExpectedDate] = useState('');
  const [allocateNotes, setAllocateNotes] = useState('');

  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');

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

  const selectedCategoryObj = categories.find(c => c.name === regCategory);

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.serial.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || asset.category === filterCategory;
    const matchesStatus = !filterStatus || asset.status === filterStatus;
    const matchesLocation = !filterLocation || asset.location.toLowerCase().includes(filterLocation.toLowerCase());
    return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
  });

  // Handle Allocation Submit
  const handleAllocateSubmit = (e) => {
    e.preventDefault();
    if (!showAllocateModal || !allocateEmployeeId) return;
    
    const result = allocateAsset(showAllocateModal.id, allocateEmployeeId, allocateExpectedDate, allocateNotes);
    if (result.success) {
      setShowAllocateModal(null);
      setAllocateEmployeeId('');
      setAllocateExpectedDate('');
      setAllocateNotes('');
    } else if (result.conflict) {
      alert(`Conflict: This asset is already allocated to ${result.holderName}. Please request a transfer instead.`);
    } else {
      alert(result.message);
    }
  };

  // Handle Return Submit
  const handleReturnSubmit = (e) => {
    e.preventDefault();
    if (!showReturnModal) return;
    returnAsset(showReturnModal.id, returnNotes, returnCondition);
    setShowReturnModal(null);
    setReturnNotes('');
    setReturnCondition('Good');
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
    <div className="asset-registry-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Asset Directory</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Search, track, and manage physical resources and their lifecycles.</p>
        </div>
        {(activeRole === 'Admin' || activeRole === 'Asset Manager') && (
          <button className="btn btn-primary" onClick={() => setShowRegisterModal(true)}>
            ➕ Register Asset
          </button>
        )}
      </div>

      {/* Directory Filters */}
      <div className="directory-filters">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Search Directory</label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name, tag, serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Category</label>
          <select
            className="form-control"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Status</label>
          <select
            className="form-control"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="Reserved">Reserved</option>
            <option value="Under Maintenance">Under Maintenance</option>
            <option value="Lost">Lost</option>
            <option value="Retired">Retired</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Location</label>
          <input
            type="text"
            className="form-control"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Assets Card Grid */}
      {filteredAssets.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="empty-state">No assets match your search filters.</div>
        </div>
      ) : (
        <div className="assets-grid">
          {filteredAssets.map(asset => {
            const holder = employees.find(e => e.id === asset.assignedTo);
            return (
              <div key={asset.id} className="glass-card asset-card">
                <div>
                  <div className="asset-card-header">
                    <div>
                      <span className="asset-tag">{asset.tag}</span>
                      <h3 className="asset-title" style={{ marginTop: '8px' }}>{asset.name}</h3>
                    </div>
                    <span className={`badge badge-${asset.status.toLowerCase().replace(' ', '')}`}>{asset.status}</span>
                  </div>

                  <div className="asset-meta">
                    <div className="asset-meta-item">
                      <span>Category</span>
                      <strong style={{ color: 'white' }}>{asset.category}</strong>
                    </div>
                    <div className="asset-meta-item">
                      <span>Location</span>
                      <strong>{asset.location}</strong>
                    </div>
                    <div className="asset-meta-item">
                      <span>Condition</span>
                      <strong style={{ color: asset.condition === 'Excellent' || asset.condition === 'Good' ? 'var(--color-success)' : 'var(--color-warning)' }}>
                        {asset.condition}
                      </strong>
                    </div>
                    {asset.status === 'Allocated' && holder && (
                      <div className="asset-meta-item" style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '6px', marginTop: '6px' }}>
                        <span>Holder</span>
                        <strong style={{ color: 'var(--color-primary)' }}>{holder.name}</strong>
                      </div>
                    )}
                    {asset.shared && (
                      <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--color-secondary)', fontWeight: 600 }}>
                        🔄 Shared/Bookable Resource
                      </div>
                    )}
                  </div>
                </div>

                <div className="asset-card-actions">
                  <button className="btn btn-secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setShowDetailModal(asset)}>
                    👁️ Details & History
                  </button>
                  
                  {asset.status === 'Available' && (activeRole === 'Admin' || activeRole === 'Asset Manager') && (
                    <button className="btn btn-primary" style={{ padding: '8px 12px' }} onClick={() => setShowAllocateModal(asset)}>
                      Assign
                    </button>
                  )}

                  {asset.status === 'Allocated' && (activeRole === 'Admin' || activeRole === 'Asset Manager') && (
                    <button className="btn btn-success" style={{ padding: '8px 12px' }} onClick={() => setShowReturnModal(asset)}>
                      Return
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Asset Detail & History Modal */}
      {showDetailModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <div>
                <span className="asset-tag">{showDetailModal.tag}</span>
                <h3 style={{ fontSize: '1.25rem', marginTop: '4px' }}>{showDetailModal.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setShowDetailModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Serial Number</span>
                  <p style={{ fontWeight: 600, color: 'white' }}>{showDetailModal.serial}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status</span>
                  <p style={{ fontWeight: 600 }}><span className={`badge badge-${showDetailModal.status.toLowerCase().replace(' ', '')}`}>{showDetailModal.status}</span></p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acquisition Date</span>
                  <p style={{ fontWeight: 600 }}>{showDetailModal.acqDate}</p>
                </div>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Acquisition Cost</span>
                  <p style={{ fontWeight: 600, color: 'var(--color-success)' }}>${showDetailModal.acqCost}</p>
                </div>
              </div>

              {/* Custom fields (Category-specific) */}
              {showDetailModal.customFields && Object.keys(showDetailModal.customFields).length > 0 && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Category Fields ({showDetailModal.category})</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {Object.entries(showDetailModal.customFields).map(([k, v]) => (
                      <div key={k}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{k}</span>
                        <p style={{ fontWeight: 600, color: 'white' }}>{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Asset History (Allocation + Maintenance) */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Asset Timeline History</h4>
                {showDetailModal.history && showDetailModal.history.length > 0 ? (
                  <div className="timeline">
                    {showDetailModal.history.map((hist, idx) => (
                      <div key={idx} className="timeline-item completed">
                        <div className="timeline-date">{hist.date}</div>
                        <div className="timeline-title">{hist.type}</div>
                        <div className="timeline-desc">{hist.details}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state" style={{ padding: '16px' }}>No timeline logs recorded.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate/Assign Modal */}
      {showAllocateModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '450px' }}>
            <div className="modal-header">
              <h3>Allocate Asset: {showAllocateModal.name}</h3>
              <button className="modal-close" onClick={() => setShowAllocateModal(null)}>×</button>
            </div>
            <form onSubmit={handleAllocateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Assign to Employee</label>
                  <select
                    className="form-control"
                    value={allocateEmployeeId}
                    onChange={(e) => setAllocateEmployeeId(e.target.value)}
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
                    value={allocateExpectedDate}
                    onChange={(e) => setAllocateExpectedDate(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Allocation Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Enter context, details, or checkout terms..."
                    value={allocateNotes}
                    onChange={(e) => setAllocateNotes(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllocateModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Asset</button>
              </div>
            </form>
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
                    placeholder="Enter return notes (e.g. general wear and tear, missing cables...)"
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

export default AssetRegistryView;
