// OrgSetupPage.jsx
// Screen 10 — Administrative settings to define organizational structures
// (departments, parents, heads), asset category templates (adding custom attributes),
// and the Employee Directory for promotion and access privilege controls.
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

const SUB_TABS = [
  { key: 'departments', label: '🏢 Departments' },
  { key: 'categories',  label: '📁 Categories' },
  { key: 'employees',   label: '👥 Employees' },
];

export default function OrgSetupPage({ activeNav, setActiveNav }) {
  const {
    currentUser,
    departments,
    categories,
    employees,
    assets,
    addDepartment,
    updateDepartment,
    addCategory,
    updateCategory,
    updateEmployeeRole,
  } = useContext(StateContext);

  const role = currentUser?.role || 'Employee';

  const [activeSubTab, setActiveSubTab] = useState('departments');

  // Modals & form state
  const [depDrawerOpen, setDepDrawerOpen]   = useState(false);
  const [editingDep, setEditingDep]         = useState(null);
  const [depName, setDepName]               = useState('');
  const [depHead, setDepHead]               = useState('');
  const [depParent, setDepParent]           = useState('');
  const [depStatus, setDepStatus]           = useState('Active');

  const [catDrawerOpen, setCatDrawerOpen]   = useState(false);
  const [editingCat, setEditingCat]         = useState(null);
  const [catName, setCatName]               = useState('');
  const [catFields, setCatFields]           = useState([]); // [{ name: '', type: 'text', required: false }]

  const [empDrawerOpen, setEmpDrawerOpen]   = useState(false);
  const [editingEmp, setEditingEmp]         = useState(null);
  const [empRole, setEmpRole]               = useState('Employee');
  const [empDept, setEmpDept]               = useState('');
  const [empStatus, setEmpStatus]           = useState('Active');

  const [error, setError]                   = useState('');

  // ── Access Protection ──────────────────────────────────────────
  if (role !== 'Admin') {
    return (
      <div style={styles.page}>
        <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />
        <main style={{ ...styles.main, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={styles.accessDeniedCard}>
            <span style={{ fontSize: 40 }}>🔒</span>
            <h2 style={{ color: COLORS.danger, marginTop: 12 }}>Access Denied</h2>
            <p style={{ color: COLORS.textSecondary, fontSize: 14 }}>
              The Organization Setup view is restricted to Administrators only.
            </p>
          </div>
        </main>
      </div>
    );
  }

  // ── Department Submit ──────────────────────────────────────────
  const handleDepSubmit = (e) => {
    e.preventDefault();
    if (!depName) {
      setError('Department name is required.');
      return;
    }

    if (editingDep) {
      updateDepartment(editingDep.id, depName, depHead, depParent || null, depStatus);
    } else {
      addDepartment(depName, depHead, depParent || null);
    }

    setDepDrawerOpen(false);
    resetDepForm();
  };

  const startEditDep = (dep) => {
    setEditingDep(dep);
    setDepName(dep.name);
    setDepHead(dep.headId || '');
    setDepParent(dep.parentId || '');
    setDepStatus(dep.status || 'Active');
    setDepDrawerOpen(true);
  };

  const resetDepForm = () => {
    setEditingDep(null);
    setDepName('');
    setDepHead('');
    setDepParent('');
    setDepStatus('Active');
    setError('');
  };

  // ── Category Submit ────────────────────────────────────────────
  const addCategoryField = () => {
    setCatFields(prev => [...prev, { name: '', type: 'text', required: false }]);
  };

  const removeCategoryField = (idx) => {
    setCatFields(prev => prev.filter((_, i) => i !== idx));
  };

  const updateCategoryField = (idx, key, val) => {
    setCatFields(prev => prev.map((f, i) => i === idx ? { ...f, [key]: val } : f));
  };

  const handleCatSubmit = (e) => {
    e.preventDefault();
    if (!catName) {
      setError('Category name is required.');
      return;
    }

    const fieldsVal = catFields.filter(f => f.name.trim() !== '');

    if (editingCat) {
      updateCategory(editingCat.id, catName, fieldsVal);
    } else {
      addCategory(catName, fieldsVal);
    }

    setCatDrawerOpen(false);
    resetCatForm();
  };

  const startEditCat = (cat) => {
    setEditingCat(cat);
    setCatName(cat.name);
    setCatFields(cat.fields || []);
    setCatDrawerOpen(true);
  };

  const resetCatForm = () => {
    setEditingCat(null);
    setCatName('');
    setCatFields([]);
    setError('');
  };

  // ── Employee Role Updates ──────────────────────────────────────
  const handleEmpSave = (e) => {
    e.preventDefault();
    if (!editingEmp) return;

    updateEmployeeRole(editingEmp.id, empRole, empDept, empStatus);
    setEmpDrawerOpen(false);
    setEditingEmp(null);
  };

  const startEditEmp = (emp) => {
    setEditingEmp(emp);
    setEmpRole(emp.role);
    setEmpDept(emp.department);
    setEmpStatus(emp.status);
    setEmpDrawerOpen(true);
  };

  return (
    <div style={styles.page}>
      <Sidebar activeNav={activeNav} onNavigate={setActiveNav} />

      <main style={styles.main}>
        {/* ── Top Bar ─────────────────────────────────────────── */}
        <div style={styles.topBar}>
          <div>
            <h1 style={styles.pageTitle}>Organization Setup</h1>
            <p style={styles.pageSubtitle}>
              Manage departments, categories, attributes, and user privileges.
            </p>
          </div>
        </div>

        {/* ── Subtab row ──────────────────────────────────────── */}
        <div style={styles.tabRow}>
          {SUB_TABS.map(t => (
            <button
              key={t.key}
              style={{ ...styles.tabButton, ...(activeSubTab === t.key ? styles.tabButtonActive : {}) }}
              onClick={() => setActiveSubTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Departments ────────────────────────────────── */}
        {activeSubTab === 'departments' && (
          <div style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Departments</h3>
                <p style={styles.sectionSubtitle}>Define hierarchy and assign heads of departments.</p>
              </div>
              <button style={styles.primaryButton} onClick={() => setDepDrawerOpen(true)}>
                + Add Department
              </button>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderRow}>
                <span style={{ ...styles.th, flex: 1.5 }}>Name</span>
                <span style={{ ...styles.th, flex: 1.5 }}>Department Head</span>
                <span style={{ ...styles.th, flex: 1.5 }}>Parent Department</span>
                <span style={{ ...styles.th, flex: '0 0 100px' }}>Status</span>
                <span style={{ ...styles.th, flex: '0 0 80px' }}></span>
              </div>

              {departments.map(dep => {
                const head = employees.find(e => e.id === dep.headId);
                const parent = departments.find(d => d.id === dep.parentId);
                const isInactive = dep.status === 'Inactive';
                return (
                  <div key={dep.id} style={{ ...styles.tableRow, opacity: isInactive ? 0.6 : 1 }}>
                    <span style={{ ...styles.td, flex: 1.5, fontWeight: 500, color: COLORS.navy }}>{dep.name}</span>
                    <span style={{ ...styles.td, flex: 1.5 }}>{head ? head.name : '— Not Assigned —'}</span>
                    <span style={{ ...styles.td, flex: 1.5 }}>{parent ? parent.name : '—'}</span>
                    <span style={{ flex: '0 0 100px' }}>
                      <span style={{
                        ...styles.statusPill,
                        background: isInactive ? COLORS.dangerBg : COLORS.successBg,
                        color:      isInactive ? COLORS.danger : COLORS.success,
                      }}>
                        {dep.status || 'Active'}
                      </span>
                    </span>
                    <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                      <button style={styles.linkButton} onClick={() => startEditDep(dep)}>
                        Edit
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Categories ─────────────────────────────────── */}
        {activeSubTab === 'categories' && (
          <div style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Asset Categories</h3>
                <p style={styles.sectionSubtitle}>Manage template categories and add dynamic custom fields.</p>
              </div>
              <button style={styles.primaryButton} onClick={() => setCatDrawerOpen(true)}>
                + Add Category
              </button>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderRow}>
                <span style={{ ...styles.th, flex: 1.5 }}>Category Name</span>
                <span style={{ ...styles.th, flex: 3.5 }}>Custom Template Attributes</span>
                <span style={{ ...styles.th, flex: '0 0 80px' }}></span>
              </div>

              {categories.map(cat => {
                return (
                  <div key={cat.id} style={styles.tableRow}>
                    <span style={{ ...styles.td, flex: 1.5, fontWeight: 500, color: COLORS.navy }}>{cat.name}</span>
                    <span style={{ ...styles.td, flex: 3.5, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {cat.fields?.length === 0 ? (
                        <span style={{ color: COLORS.textMuted, fontSize: 12 }}>No custom fields configured</span>
                      ) : (
                        cat.fields?.map(f => (
                          <span key={f.name} style={styles.attributeBadge}>
                            {f.name} ({f.type}){f.required ? '*' : ''}
                          </span>
                        ))
                      )}
                    </span>
                    <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                      <button style={styles.linkButton} onClick={() => startEditCat(cat)}>
                        Edit
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Tab: Employees ──────────────────────────────────── */}
        {activeSubTab === 'employees' && (
          <div style={styles.contentSection}>
            <div style={styles.sectionHeader}>
              <div>
                <h3 style={styles.sectionTitle}>Employee Accounts</h3>
                <p style={styles.sectionSubtitle}>Promote employees and manage system access.</p>
              </div>
            </div>

            <div style={styles.tableCard}>
              <div style={styles.tableHeaderRow}>
                <span style={{ ...styles.th, flex: 1.5 }}>Name</span>
                <span style={{ ...styles.th, flex: 1.8 }}>Email</span>
                <span style={{ ...styles.th, flex: 1.5 }}>Department</span>
                <span style={{ ...styles.th, flex: 1.2 }}>System Role</span>
                <span style={{ ...styles.th, flex: '0 0 100px' }}>Status</span>
                <span style={{ ...styles.th, flex: '0 0 80px' }}></span>
              </div>

              {employees.map(emp => {
                const isInactive = emp.status === 'Inactive';
                return (
                  <div key={emp.id} style={{ ...styles.tableRow, opacity: isInactive ? 0.6 : 1 }}>
                    <span style={{ ...styles.td, flex: 1.5, fontWeight: 500, color: COLORS.navy }}>{emp.name}</span>
                    <span style={{ ...styles.td, flex: 1.8 }}>{emp.email}</span>
                    <span style={{ ...styles.td, flex: 1.5 }}>{emp.department || '—'}</span>
                    <span style={{ ...styles.td, flex: 1.2 }}>
                      <span style={{
                        ...styles.roleLabel,
                        background: emp.role === 'Admin' ? COLORS.dangerBg :
                                    emp.role === 'Asset Manager' ? COLORS.purpleBg :
                                    emp.role === 'Department Head' ? COLORS.warningBg : '#E7EFFC',
                        color:      emp.role === 'Admin' ? COLORS.danger :
                                    emp.role === 'Asset Manager' ? COLORS.purple :
                                    emp.role === 'Department Head' ? COLORS.warning : COLORS.accent,
                      }}>
                        {emp.role}
                      </span>
                    </span>
                    <span style={{ flex: '0 0 100px' }}>
                      <span style={{
                        ...styles.statusPill,
                        background: isInactive ? COLORS.dangerBg : COLORS.successBg,
                        color:      isInactive ? COLORS.danger : COLORS.success,
                      }}>
                        {emp.status || 'Active'}
                      </span>
                    </span>
                    <span style={{ flex: '0 0 80px', textAlign: 'right' }}>
                      <button style={styles.linkButton} onClick={() => startEditEmp(emp)}>
                        Promote
                      </button>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════
          DEPARTMENT DRAWER
      ══════════════════════════════════════════════════════════ */}
      {depDrawerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setDepDrawerOpen(false); resetDepForm(); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>{editingDep ? 'Edit department' : 'Add department'}</p>
                <p style={styles.drawerSubtitle}>Define hierarchy and choose a head</p>
              </div>
              <button style={styles.closeButton} onClick={() => { setDepDrawerOpen(false); resetDepForm(); }}>✕</button>
            </div>

            <form onSubmit={handleDepSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={styles.drawerBody}>
                {error && <div style={styles.errorBox}>{error}</div>}

                <label style={styles.label}>Department name *</label>
                <input
                  type="text"
                  placeholder="e.g. Frontend Guild"
                  value={depName}
                  onChange={e => setDepName(e.target.value)}
                  style={styles.input}
                />

                <label style={styles.label}>Department Head</label>
                <select
                  value={depHead}
                  onChange={e => setDepHead(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- Assign Employee --</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                  ))}
                </select>

                <label style={styles.label}>Parent Department</label>
                <select
                  value={depParent}
                  onChange={e => setDepParent(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- None --</option>
                  {departments.filter(d => !editingDep || d.id !== editingDep.id).map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                {editingDep && (
                  <>
                    <label style={styles.label}>Status</label>
                    <select
                      value={depStatus}
                      onChange={e => setDepStatus(e.target.value)}
                      style={styles.input}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </>
                )}
              </div>

              <div style={styles.drawerFooter}>
                <button type="button" style={styles.secondaryButton} onClick={() => { setDepDrawerOpen(false); resetDepForm(); }}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  {editingDep ? 'Save Changes' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          CATEGORY DRAWER
      ══════════════════════════════════════════════════════════ */}
      {catDrawerOpen && (
        <>
          <div style={styles.overlay} onClick={() => { setCatDrawerOpen(false); resetCatForm(); }} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>{editingCat ? 'Edit Category' : 'Add Category'}</p>
                <p style={styles.drawerSubtitle}>Define template custom fields for assets</p>
              </div>
              <button style={styles.closeButton} onClick={() => { setCatDrawerOpen(false); resetCatForm(); }}>✕</button>
            </div>

            <form onSubmit={handleCatSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={styles.drawerBody}>
                {error && <div style={styles.errorBox}>{error}</div>}

                <label style={styles.label}>Category name *</label>
                <input
                  type="text"
                  placeholder="e.g. Laptops, Vehicles"
                  value={catName}
                  onChange={e => setCatName(e.target.value)}
                  style={styles.input}
                />

                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={styles.label}>Category-Specific Fields</label>
                    <button type="button" style={styles.fieldAddBtn} onClick={addCategoryField}>
                      + Add Field
                    </button>
                  </div>

                  {catFields.map((field, idx) => (
                    <div key={idx} style={styles.fieldBuilderRow}>
                      <input
                        type="text"
                        placeholder="Field label"
                        value={field.name}
                        onChange={e => updateCategoryField(idx, 'name', e.target.value)}
                        style={styles.builderInput}
                        required
                      />
                      <select
                        value={field.type}
                        onChange={e => updateCategoryField(idx, 'type', e.target.value)}
                        style={styles.builderSelect}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                      </select>
                      <label style={styles.builderCheckboxRow}>
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={e => updateCategoryField(idx, 'required', e.target.checked)}
                          style={{ width: 14, height: 14 }}
                        />
                        Req
                      </label>
                      <button type="button" style={styles.deleteFieldBtn} onClick={() => removeCategoryField(idx)}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.drawerFooter}>
                <button type="button" style={styles.secondaryButton} onClick={() => { setCatDrawerOpen(false); resetCatForm(); }}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  {editingCat ? 'Save Changes' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════
          EMPLOYEE PRIVILEGES DRAWER
      ══════════════════════════════════════════════════════════ */}
      {empDrawerOpen && editingEmp && (
        <>
          <div style={styles.overlay} onClick={() => setEmpDrawerOpen(false)} />
          <div style={styles.drawer}>
            <div style={styles.drawerHeader}>
              <div>
                <p style={styles.drawerTitle}>Promote / Edit Employee</p>
                <p style={styles.drawerSubtitle}>{editingEmp.name}</p>
              </div>
              <button style={styles.closeButton} onClick={() => setEmpDrawerOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleEmpSave} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={styles.drawerBody}>
                <p style={{ fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 }}>
                  Email: <strong>{editingEmp.email}</strong>
                </p>

                <label style={styles.label}>Assign Department</label>
                <select
                  value={empDept}
                  onChange={e => setEmpDept(e.target.value)}
                  style={styles.input}
                >
                  <option value="">-- No Department --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>

                <label style={styles.label}>Assign System Access Role</label>
                <select
                  value={empRole}
                  onChange={e => setEmpRole(e.target.value)}
                  style={styles.input}
                >
                  <option value="Employee">Employee (Regular Staff)</option>
                  <option value="Department Head">Department Head</option>
                  <option value="Asset Manager">Asset Manager</option>
                  <option value="Admin">Administrator</option>
                </select>

                <label style={styles.label}>Account status</label>
                <select
                  value={empStatus}
                  onChange={e => setEmpStatus(e.target.value)}
                  style={styles.input}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={styles.drawerFooter}>
                <button type="button" style={styles.secondaryButton} onClick={() => setEmpDrawerOpen(false)}>
                  Cancel
                </button>
                <button type="submit" style={styles.primaryButton}>
                  Save Settings
                </button>
              </div>
            </form>
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

  tabRow: { display: 'flex', gap: 4, borderBottom: `0.5px solid ${COLORS.border}`, marginBottom: '1.5rem' },
  tabButton: {
    display: 'flex', alignItems: 'center', gap: 6, padding: '10px 4px', marginRight: 24,
    border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
    color: COLORS.textMuted, borderBottom: '2px solid transparent', fontFamily: 'inherit',
  },
  tabButtonActive: { color: COLORS.accent, borderBottom: `2px solid ${COLORS.accent}` },

  contentSection:  { display: 'flex', flexDirection: 'column', gap: 16 },
  sectionHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle:    { fontSize: 15, fontWeight: 600, color: COLORS.navy, margin: 0 },
  sectionSubtitle: { fontSize: 12.5, color: COLORS.textSecondary, margin: '4px 0 0' },

  primaryButton: {
    background: COLORS.accent, color: '#FFFFFF', border: 'none',
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  secondaryButton: {
    background: '#FFFFFF', color: COLORS.navy, border: `0.5px solid ${COLORS.border}`,
    borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
  },
  linkButton: {
    background: 'transparent', border: 'none', color: COLORS.accent,
    fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0,
  },

  tableCard:      { background: '#FFFFFF', borderRadius: 12, border: `0.5px solid ${COLORS.border}`, overflow: 'hidden' },
  tableHeaderRow: { display: 'flex', padding: '10px 16px', borderBottom: `0.5px solid ${COLORS.border}`, background: COLORS.bg },
  th:             { fontSize: 11, fontWeight: 500, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.03em' },
  tableRow:       { display: 'flex', alignItems: 'center', padding: '13px 16px', borderBottom: `0.5px solid ${COLORS.border}` },
  td:             { fontSize: 13, color: COLORS.textSecondary },
  statusPill:     { fontSize: 11, fontWeight: 500, padding: '4px 10px', borderRadius: 6, display: 'inline-block' },
  roleLabel:      { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6, display: 'inline-block' },
  attributeBadge: { fontSize: 11, background: COLORS.bg, color: COLORS.navy, padding: '3px 8px', borderRadius: 6, border: `0.5px solid ${COLORS.border}`, fontWeight: 500 },

  accessDeniedCard: {
    background: '#FFF', padding: '3rem', borderRadius: 16, border: `0.5px solid ${COLORS.border}`,
    textAlign: 'center', maxWidth: 400, boxShadow: '0 4px 20px rgba(22,35,61,0.05)',
  },

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
  errorBox:     { background: COLORS.dangerBg, color: COLORS.danger, borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },

  fieldAddBtn:      { background: 'transparent', border: `0.5px solid ${COLORS.border}`, color: COLORS.accent, borderRadius: 6, padding: '4px 10px', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' },
  fieldBuilderRow:  { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 },
  builderInput:     { flex: 2, height: 36, padding: '0 10px', borderRadius: 6, border: `0.5px solid ${COLORS.border}`, fontSize: 12.5, fontFamily: 'inherit', color: COLORS.navy },
  builderSelect:    { flex: 1.2, height: 36, padding: '0 8px', borderRadius: 6, border: `0.5px solid ${COLORS.border}`, fontSize: 12.5, fontFamily: 'inherit', color: COLORS.navy },
  builderCheckboxRow: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: COLORS.textSecondary },
  deleteFieldBtn:   { border: 'none', background: 'transparent', color: COLORS.danger, fontSize: 15, cursor: 'pointer', padding: '4px' },
};
