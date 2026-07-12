import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const OrgSetupView = () => {
  const {
    departments,
    categories,
    employees,
    addDepartment,
    updateDepartment,
    addCategory,
    updateCategory,
    updateEmployeeRole,
    getActiveRole
  } = useContext(StateContext);

  const activeRole = getActiveRole();
  const [activeSubTab, setActiveSubTab] = useState('departments');

  // Department Modals & Forms
  const [showDepModal, setShowDepModal] = useState(false);
  const [editingDep, setEditingDep] = useState(null);
  const [depName, setDepName] = useState('');
  const [depHead, setDepHead] = useState('');
  const [depParent, setDepParent] = useState('');
  const [depStatus, setDepStatus] = useState('Active');

  // Category Modals & Forms
  const [showCatModal, setShowCatModal] = useState(false);
  const [catName, setCatName] = useState('');
  const [catFields, setCatFields] = useState([]); // [{ name: '', type: 'text', required: false }]

  // Employee promotion
  const [editingEmp, setEditingEmp] = useState(null);
  const [empRole, setEmpRole] = useState('Employee');
  const [empDept, setEmpDept] = useState('');
  const [empStatus, setEmpStatus] = useState('Active');

  if (activeRole !== 'Admin') {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
        <h2 style={{ color: 'var(--color-danger)', marginBottom: '16px' }}>🔒 Access Denied</h2>
        <p>The Organization Setup screen is restricted to Administrators only.</p>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Please use the simulator at the top of the screen to switch to the **Admin** role to view this page.
        </p>
      </div>
    );
  }

  // Handle Department Submit
  const handleDepSubmit = (e) => {
    e.preventDefault();
    if (!depName) return;
    if (editingDep) {
      updateDepartment(editingDep.id, depName, depHead, depParent || null, depStatus);
    } else {
      addDepartment(depName, depHead, depParent || null);
    }
    closeDepModal();
  };

  const openEditDep = (dep) => {
    setEditingDep(dep);
    setDepName(dep.name);
    setDepHead(dep.headId || '');
    setDepParent(dep.parentId || '');
    setDepStatus(dep.status || 'Active');
    setShowDepModal(true);
  };

  const closeDepModal = () => {
    setShowDepModal(false);
    setEditingDep(null);
    setDepName('');
    setDepHead('');
    setDepParent('');
    setDepStatus('Active');
  };

  // Dynamic fields for categories
  const addCategoryField = () => {
    setCatFields([...catFields, { name: '', type: 'text', required: false }]);
  };

  const removeCategoryField = (index) => {
    setCatFields(catFields.filter((_, i) => i !== index));
  };

  const updateCategoryField = (index, key, value) => {
    setCatFields(catFields.map((f, i) => i === index ? { ...f, [key]: value } : f));
  };

  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catName) return;
    addCategory(catName, catFields.filter(f => f.name.trim() !== ''));
    setShowCatModal(false);
    setCatName('');
    setCatFields([]);
  };

  // Employee Save
  const handleEmpSave = (e) => {
    e.preventDefault();
    if (editingEmp) {
      updateEmployeeRole(editingEmp.id, empRole, empDept, empStatus);
      setEditingEmp(null);
    }
  };

  const startEditEmp = (emp) => {
    setEditingEmp(emp);
    setEmpRole(emp.role);
    setEmpDept(emp.department);
    setEmpStatus(emp.status);
  };

  return (
    <div className="org-setup-view">
      <div className="tabs-navigation">
        <button className={`tab-btn ${activeSubTab === 'departments' ? 'active' : ''}`} onClick={() => setActiveSubTab('departments')}>
          🏢 Department Management
        </button>
        <button className={`tab-btn ${activeSubTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveSubTab('categories')}>
          📁 Category Management
        </button>
        <button className={`tab-btn ${activeSubTab === 'employees' ? 'active' : ''}`} onClick={() => setActiveSubTab('employees')}>
          👥 Employee Directory
        </button>
      </div>

      {/* DEPARTMENT MANAGEMENT TAB */}
      {activeSubTab === 'departments' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <h2>Departments</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define organizational structures, heads, and hierarchies.</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowDepModal(true)}>
              ➕ Add Department
            </button>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Department Head</th>
                  <th>Parent Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map(dep => {
                  const head = employees.find(e => e.id === dep.headId);
                  const parent = departments.find(d => d.id === dep.parentId);
                  return (
                    <tr key={dep.id} style={{ opacity: dep.status === 'Inactive' ? 0.6 : 1 }}>
                      <td style={{ fontWeight: 600 }}>{dep.name}</td>
                      <td>{head ? head.name : <span style={{ color: 'var(--text-dark)' }}>Not Assigned</span>}</td>
                      <td>{parent ? parent.name : <span style={{ color: 'var(--text-dark)' }}>None</span>}</td>
                      <td>
                        <span className={`badge ${dep.status === 'Active' ? 'badge-available' : 'badge-retired'}`}>
                          {dep.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openEditDep(dep)}>
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORY MANAGEMENT TAB */}
      {activeSubTab === 'categories' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div>
              <h2>Asset Categories</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Configure asset types and their optional custom attributes (e.g. warranty period for electronics).</p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCatModal(true)}>
              ➕ Add Category
            </button>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Custom Specific Fields</th>
                  <th>Active Assets</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td style={{ fontWeight: 600 }}>{cat.name}</td>
                    <td>
                      {cat.fields.length === 0 ? (
                        <span style={{ color: 'var(--text-dark)' }}>No custom fields</span>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {cat.fields.map(f => (
                            <span key={f.name} className="asset-tag" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)' }}>
                              {f.name} ({f.type}){f.required && '*'}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      {/* Seed mock asset counts */}
                      <span className="badge badge-allocated" style={{ background: 'rgba(99,102,241,0.08)' }}>
                        System Category
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EMPLOYEE DIRECTORY TAB */}
      {activeSubTab === 'employees' && (
        <div className="glass-card">
          <div style={{ marginBottom: '20px' }}>
            <h2>Employee Directory</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage employee accounts, promote employees to Department Heads or Asset Managers.</p>
          </div>

          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>System Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id} style={{ opacity: emp.status === 'Inactive' ? 0.6 : 1 }}>
                    <td style={{ fontWeight: 600 }}>{emp.name}</td>
                    <td>{emp.email}</td>
                    <td>{emp.department}</td>
                    <td>
                      <span className={`badge ${
                        emp.role === 'Admin' ? 'badge-lost' : 
                        emp.role === 'Asset Manager' ? 'badge-undermaintenance' : 
                        emp.role === 'Department Head' ? 'badge-reserved' : 'badge-allocated'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${emp.status === 'Active' ? 'badge-available' : 'badge-retired'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => startEditEmp(emp)}>
                        Promote / Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Modal */}
      {showDepModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingDep ? '🏢 Edit Department' : '🏢 Add Department'}</h3>
              <button className="modal-close" onClick={closeDepModal}>×</button>
            </div>
            <form onSubmit={handleDepSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={depName}
                    onChange={(e) => setDepName(e.target.value)}
                    placeholder="e.g. Sales, Marketing"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department Head</label>
                  <select
                    className="form-control"
                    value={depHead}
                    onChange={(e) => setDepHead(e.target.value)}
                  >
                    <option value="">-- Assign Employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Parent Department (optional)</label>
                  <select
                    className="form-control"
                    value={depParent}
                    onChange={(e) => setDepParent(e.target.value)}
                  >
                    <option value="">-- None --</option>
                    {departments.filter(d => !editingDep || d.id !== editingDep.id).map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {editingDep && (
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      className="form-control"
                      value={depStatus}
                      onChange={(e) => setDepStatus(e.target.value)}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDepModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingDep ? 'Save Changes' : 'Create Department'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>📁 Add Asset Category</h3>
              <button className="modal-close" onClick={() => setShowCatModal(false)}>×</button>
            </div>
            <form onSubmit={handleCatSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="e.g. Laptops, Vehicles"
                    required
                  />
                </div>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category-Specific Fields</label>
                    <button type="button" className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={addCategoryField}>
                      ➕ Add Field
                    </button>
                  </div>

                  {catFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Field name"
                        value={field.name}
                        onChange={(e) => updateCategoryField(idx, 'name', e.target.value)}
                        required
                        style={{ flex: 1.5 }}
                      />
                      <select
                        className="form-control"
                        value={field.type}
                        onChange={(e) => updateCategoryField(idx, 'type', e.target.value)}
                        style={{ flex: 1 }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateCategoryField(idx, 'required', e.target.checked)}
                        />
                        Req
                      </label>
                      <button type="button" className="btn btn-danger" style={{ padding: '6px 10px', fontSize: '0.8rem' }} onClick={() => removeCategoryField(idx)}>
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employee Promotion Modal */}
      {editingEmp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>👥 Edit Employee & Roles</h3>
              <button className="modal-close" onClick={() => setEditingEmp(null)}>×</button>
            </div>
            <form onSubmit={handleEmpSave}>
              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Editing user:</span>
                  <h4 style={{ fontSize: '1.2rem', color: 'white' }}>{editingEmp.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dark)' }}>{editingEmp.email}</span>
                </div>

                <div className="form-group">
                  <label>Assign Department</label>
                  <select
                    className="form-control"
                    value={empDept}
                    onChange={(e) => setEmpDept(e.target.value)}
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Assign System Role</label>
                  <select
                    className="form-control"
                    value={empRole}
                    onChange={(e) => setEmpRole(e.target.value)}
                  >
                    <option value="Employee">Employee (Regular Staff)</option>
                    <option value="Department Head">Department Head</option>
                    <option value="Asset Manager">Asset Manager</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Account Status</label>
                  <select
                    className="form-control"
                    value={empStatus}
                    onChange={(e) => setEmpStatus(e.target.value)}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingEmp(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Role Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgSetupView;
