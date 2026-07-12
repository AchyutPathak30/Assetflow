import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const StateContext = createContext();

// ── DEFAULT SEED DATA (FALLBACKS FOR DEMO & TESTING) ────────────────
const DEFAULT_DEPARTMENTS = [
  { id: 'dep-it', name: 'Information Technology', headId: 'emp-2', parentId: null, status: 'Active' },
  { id: 'dep-hr', name: 'Human Resources', headId: 'emp-3', parentId: null, status: 'Active' },
  { id: 'dep-ops', name: 'Operations', headId: 'emp-4', parentId: null, status: 'Active' },
  { id: 'dep-mkt', name: 'Marketing', headId: '', parentId: null, status: 'Active' }
];

const DEFAULT_CATEGORIES = [
  { id: 'cat-elec', name: 'Electronics', fields: [{ name: 'Warranty Period (months)', type: 'number', required: true }] },
  { id: 'cat-furn', name: 'Furniture', fields: [{ name: 'Material', type: 'text', required: false }] },
  { id: 'cat-veh', name: 'Vehicles', fields: [{ name: 'License Plate', type: 'text', required: true }, { name: 'Insurance Expiry', type: 'date', required: false }] },
  { id: 'cat-space', name: 'Shared Spaces', fields: [{ name: 'Capacity', type: 'number', required: false }] }
];

const DEFAULT_EMPLOYEES = [
  { id: 'emp-1', name: 'Admin User', email: 'admin@assetflow.com', department: 'Information Technology', role: 'Admin', status: 'Active' },
  { id: 'emp-2', name: 'Sarah Connor', email: 'manager@assetflow.com', department: 'Information Technology', role: 'Asset Manager', status: 'Active' },
  { id: 'emp-3', name: 'Raj Koothrappali', email: 'head@assetflow.com', department: 'Human Resources', role: 'Department Head', status: 'Active' },
  { id: 'emp-4', name: 'Priya Sen', email: 'staff@assetflow.com', department: 'Operations', role: 'Employee', status: 'Active' },
  { id: 'emp-5', name: 'John Doe', email: 'john@assetflow.com', department: 'Operations', role: 'Employee', status: 'Active' }
];

const DEFAULT_ASSETS = [
  { 
    id: 'asset-1', 
    name: 'Dell XPS 15 Laptop', 
    category: 'Electronics', 
    tag: 'AF-0001', 
    serial: 'MX1234567', 
    acqDate: '2025-01-10', 
    acqCost: 1500, 
    condition: 'Excellent', 
    location: 'Headquarters - 3rd Floor', 
    shared: false, 
    status: 'Allocated',
    department: 'Information Technology',
    assignedTo: 'emp-4',
    customFields: { 'Warranty Period (months)': '24' },
    history: [
      { date: '2025-01-10', type: 'Registration', details: 'Asset registered in system' },
      { date: '2025-01-12', type: 'Allocation', details: 'Allocated to Priya Sen' }
    ]
  },
  { 
    id: 'asset-2', 
    name: 'Conference Room Alpha', 
    category: 'Shared Spaces', 
    tag: 'AF-0003', 
    serial: 'ROOM-A', 
    acqDate: '2024-06-01', 
    acqCost: 0, 
    condition: 'Excellent', 
    location: 'Headquarters - 1st Floor', 
    shared: true, 
    status: 'Available',
    department: 'Operations',
    assignedTo: '',
    customFields: { 'Capacity': '12' },
    history: [{ date: '2024-06-01', type: 'Registration', details: 'Shared space added' }]
  }
];

const DEFAULT_ALLOCATIONS = [];
const DEFAULT_BOOKINGS = [];
const DEFAULT_MAINTENANCE = [];
const DEFAULT_AUDITS = [];
const DEFAULT_LOGS = [];
const DEFAULT_NOTIFICATIONS = [];
const DEFAULT_TRANSFERS = [];

export const StateProvider = ({ children }) => {
  // Try loading from localStorage, fallback to defaults
  const getInitialState = (key, defaultValue) => {
    const saved = localStorage.getItem(`assetflow_${key}`);
    return saved ? JSON.parse(saved) : defaultValue;
  };

  const [departments, setDepartments] = useState(() => getInitialState('departments', DEFAULT_DEPARTMENTS));
  const [categories, setCategories] = useState(() => getInitialState('categories', DEFAULT_CATEGORIES));
  const [employees, setEmployees] = useState(() => getInitialState('employees', DEFAULT_EMPLOYEES));
  const [assets, setAssets] = useState(() => getInitialState('assets', DEFAULT_ASSETS));
  const [allocations, setAllocations] = useState(() => getInitialState('allocations', DEFAULT_ALLOCATIONS));
  const [bookings, setBookings] = useState(() => getInitialState('bookings', DEFAULT_BOOKINGS));
  const [maintenance, setMaintenance] = useState(() => getInitialState('maintenance', DEFAULT_MAINTENANCE));
  const [audits, setAudits] = useState(() => getInitialState('audits', DEFAULT_AUDITS));
  const [logs, setLogs] = useState(() => getInitialState('logs', DEFAULT_LOGS));
  const [notifications, setNotifications] = useState(() => getInitialState('notifications', DEFAULT_NOTIFICATIONS));
  const [transfers, setTransfers] = useState(() => getInitialState('transfers', DEFAULT_TRANSFERS));

  const [currentUser, setCurrentUser] = useState(null);
  const [simulatedRole, setSimulatedRole] = useState(null);
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  // ── Sync to localStorage ───────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('assetflow_departments', JSON.stringify(departments));
  }, [departments]);
  useEffect(() => {
    localStorage.setItem('assetflow_categories', JSON.stringify(categories));
  }, [categories]);
  useEffect(() => {
    localStorage.setItem('assetflow_employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('assetflow_assets', JSON.stringify(assets));
  }, [assets]);
  useEffect(() => {
    localStorage.setItem('assetflow_allocations', JSON.stringify(allocations));
  }, [allocations]);
  useEffect(() => {
    localStorage.setItem('assetflow_bookings', JSON.stringify(bookings));
  }, [bookings]);
  useEffect(() => {
    localStorage.setItem('assetflow_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);
  useEffect(() => {
    localStorage.setItem('assetflow_audits', JSON.stringify(audits));
  }, [audits]);
  useEffect(() => {
    localStorage.setItem('assetflow_logs', JSON.stringify(logs));
  }, [logs]);
  useEffect(() => {
    localStorage.setItem('assetflow_notifications', JSON.stringify(notifications));
  }, [notifications]);
  useEffect(() => {
    localStorage.setItem('assetflow_transfers', JSON.stringify(transfers));
  }, [transfers]);

  // ── FETCH DATABASE FROM SUPABASE ──────────────────────────────────
  const fetchSupabaseData = async () => {
    try {
      const { data: deptData } = await supabase.from('departments').select('*');
      if (deptData) {
        setDepartments(deptData.map(d => ({
          id: d.id,
          name: d.name,
          headId: d.head_employee_id || '',
          parentId: d.parent_dept_id || null,
          status: d.status
        })));
        setSupabaseConnected(true);
      }

      const { data: catData } = await supabase.from('categories').select('*');
      if (catData) {
        setCategories(catData.map(c => ({
          id: c.id,
          name: c.name,
          fields: Array.isArray(c.extra_fields) ? c.extra_fields : Object.values(c.extra_fields || {})
        })));
      }

      const { data: empData } = await supabase.from('employees').select('*, departments(name)');
      if (empData) {
        setEmployees(empData.map(e => ({
          id: e.id,
          name: e.name,
          email: e.email,
          department: e.departments ? e.departments.name : '',
          role: e.role,
          status: e.status
        })));
      }

      const { data: assetsData } = await supabase.from('assets').select('*, categories(name)');
      const { data: allocData } = await supabase.from('allocations').select('*');

      if (assetsData && allocData) {
        setAllocations(allocData.map(al => ({
          id: al.id,
          assetId: al.asset_id,
          employeeId: al.employee_id,
          departmentId: al.department_id,
          allocatedDate: al.allocated_on?.substring(0, 10),
          expectedReturnDate: al.expected_return_date,
          status: al.status,
          notes: al.condition_notes_on_return || ''
        })));

        // Resolve active transfers
        const transferList = [];
        const groupedAlloc = {};
        allocData.forEach(al => {
          if (al.status === 'TransferPending') {
            if (!groupedAlloc[al.asset_id]) groupedAlloc[al.asset_id] = [];
            groupedAlloc[al.asset_id].push(al);
          }
        });
        Object.entries(groupedAlloc).forEach(([assetId, allocs]) => {
          if (allocs.length >= 2) {
            const sorted = allocs.sort((a, b) => a.allocated_on.localeCompare(b.allocated_on));
            transferList.push({
              id: `trans-${assetId}`,
              assetId,
              fromId: sorted[0].employee_id,
              toId: sorted[1].employee_id,
              status: 'Pending',
              requestDate: sorted[1].allocated_on?.substring(0, 10)
            });
          }
        });
        setTransfers(transferList);

        setAssets(assetsData.map(a => {
          const activeAlloc = allocData.find(al => al.asset_id === a.id && al.status === 'Active');
          const emp = activeAlloc ? empData?.find(e => e.id === activeAlloc.employee_id) : null;
          const dept = activeAlloc && !emp ? deptData?.find(d => d.id === activeAlloc.department_id) : null;

          return {
            id: a.id,
            name: a.name,
            category: a.categories ? a.categories.name : '',
            tag: a.tag || '',
            serial: a.serial_number || '',
            acqDate: a.acquisition_date || '',
            acqCost: Number(a.acquisition_cost) || 0,
            condition: a.condition || 'Good',
            location: a.location || '',
            shared: a.is_bookable,
            status: a.status,
            department: emp ? emp.departments?.name : (dept ? dept.name : ''),
            assignedTo: emp ? emp.id : '',
            customFields: {},
            history: [{ date: a.created_at?.substring(0, 10), type: 'Registration', details: 'Asset registered in database' }]
          };
        }));
      }

      const { data: bookData } = await supabase.from('bookings').select('*');
      if (bookData) {
        setBookings(bookData.map(b => ({
          id: b.id,
          resourceId: b.asset_id,
          employeeId: b.booked_by_employee_id,
          title: 'Resource Booking',
          startTime: b.start_time,
          endTime: b.end_time,
          status: b.status
        })));
      }

      // Safe check for newly created tables
      const { data: maintData } = await supabase.from('maintenance').select('*');
      if (maintData) {
        setMaintenance(maintData.map(m => ({
          id: m.id,
          assetId: m.asset_id,
          reportedBy: m.reported_by,
          reportedDate: m.reported_date,
          issue: m.issue,
          priority: m.priority,
          status: m.status,
          technician: m.technician || '',
          photoUrl: m.photo_url || '',
          cost: Number(m.cost) || 0,
          history: m.history || []
        })));
      }

      const { data: auditData } = await supabase.from('audits').select('*');
      if (auditData) {
        setAudits(auditData);
      }

      const { data: logData } = await supabase.from('logs').select('*');
      if (logData) {
        setLogs(logData);
      }

      const { data: notifData } = await supabase.from('notifications').select('*');
      if (notifData) {
        setNotifications(notifData);
      }
    } catch (err) {
      console.warn('Supabase offline/not available. Falling back to local storage.', err);
    }
  };

  useEffect(() => {
    fetchSupabaseData();

    // Bind auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: emp } = await supabase
            .from('employees')
            .select('*, departments(name)')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();

          if (emp) {
            setCurrentUser({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              department: emp.departments ? emp.departments.name : '',
              role: emp.role,
              status: emp.status
            });
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const getActiveRole = () => {
    if (simulatedRole) return simulatedRole;
    return currentUser ? currentUser.role : 'Guest';
  };

  const getActiveUser = () => {
    if (simulatedRole) {
      const match = employees.find(e => e.role === simulatedRole);
      return match || currentUser;
    }
    return currentUser;
  };

  const logActivity = async (action, details, userId = null) => {
    const activeU = getActiveUser();
    const actorId = userId || activeU?.id;
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: actorId,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);

    if (supabaseConnected && actorId) {
      await supabase.from('logs').insert({
        user_id: actorId,
        action,
        details
      });
    }
  };

  const sendNotification = async (userId, title, message) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user_id: userId,
      title,
      message,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    if (supabaseConnected) {
      await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        read: false
      });
    }
  };

  // ── AUTHENTICATION ───────────────────────────────────────────────
  const loginUser = async (email, password, expectedRole) => {
    if (supabaseConnected) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, message: error.message };

      const { data: emp } = await supabase
        .from('employees')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .maybeSingle();

      if (emp) {
        if (emp.status === 'Inactive') {
          await supabase.auth.signOut();
          return { success: false, message: 'Your account is currently deactivated.' };
        }

        const uiRole = emp.role === 'AssetManager' ? 'Asset Manager' : (emp.role === 'DeptHead' ? 'Department Head' : emp.role);
        if (uiRole !== expectedRole) {
          await supabase.auth.signOut();
          return {
            success: false,
            message: `Role mismatch: Registered as "${uiRole}", but logging in as "${expectedRole}".`
          };
        }

        setCurrentUser(emp);
        setSimulatedRole(null);
        return { success: true, user: emp };
      }
    }

    // fallback login for prototype
    const matched = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      if (matched.status === 'Inactive') return { success: false, message: 'Account is deactivated.' };

      if (matched.role !== expectedRole) {
        return {
          success: false,
          message: `Role mismatch: Registered as "${matched.role}", but logging in as "${expectedRole}".`
        };
      }

      setCurrentUser(matched);
      setSimulatedRole(null);
      return { success: true, user: matched };
    }
    return { success: false, message: 'Invalid credentials.' };
  };

  const logoutUser = async () => {
    if (supabaseConnected) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setSimulatedRole(null);
  };

  const signupUser = async (name, email, password, departmentName = 'Operations', chosenRole = 'Employee') => {
    // 1. Validation Checks
    if (chosenRole === 'Admin') {
      const hasAdmin = employees.some(e => e.role === 'Admin');
      if (hasAdmin) {
        return { success: false, message: 'An Administrator already exists. Only one Admin is allowed.' };
      }
    }
    if (chosenRole === 'Department Head') {
      const hasHead = employees.some(e => e.role === 'Department Head' && e.department === departmentName);
      if (hasHead) {
        return { success: false, message: `The department (${departmentName}) already has an assigned Head.` };
      }
    }
    if (chosenRole === 'Asset Manager') {
      const hasManager = employees.some(e => e.role === 'Asset Manager' && e.department === departmentName);
      if (hasManager) {
        return { success: false, message: `The department (${departmentName}) already has an assigned Asset Manager.` };
      }
    }

    if (supabaseConnected) {
      const dbRole = chosenRole === 'Asset Manager' ? 'AssetManager' : (chosenRole === 'Department Head' ? 'DeptHead' : chosenRole);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            name,
            role: dbRole,
            department: departmentName
          } 
        }
      });
      if (error) return { success: false, message: error.message };

      // Try assigning department ID
      const { data: dept } = await supabase.from('departments').select('id').eq('name', departmentName).maybeSingle();
      if (dept && data.user) {
        // trigger handler handle_new_user runs after insert auth.users.
        // Wait a split second and update department_id and role.
        setTimeout(async () => {
          await supabase
            .from('employees')
            .update({ department_id: dept.id, role: dbRole })
            .eq('auth_user_id', data.user.id);
          fetchSupabaseData();
        }, 800);
      }

      return { success: true, message: 'Registration successful! Verification email sent.' };
    }

    // Fallback
    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email is already registered.' };
    }

    const newEmp = {
      id: `emp-${Date.now()}`,
      name,
      email,
      department: departmentName,
      role: chosenRole,
      status: 'Active'
    };
    setEmployees(prev => [...prev, newEmp]);
    return { success: true, message: 'Registration successful! You can now log in.' };
  };

  const updateEmployeeRole = async (empId, newRole, newDepartment = null, newStatus = null) => {
    const targetDept = newDepartment || employees.find(e => e.id === empId)?.department;

    // Validation checks
    if (newRole === 'Admin') {
      const hasAdmin = employees.some(e => e.id !== empId && e.role === 'Admin');
      if (hasAdmin) {
        return { success: false, message: 'An Administrator already exists. Only one Admin is allowed.' };
      }
    }
    if (newRole === 'Department Head') {
      const hasHead = employees.some(e => e.id !== empId && e.role === 'Department Head' && e.department === targetDept);
      if (hasHead) {
        return { success: false, message: `The department (${targetDept}) already has an assigned Head.` };
      }
    }
    if (newRole === 'Asset Manager') {
      const hasManager = employees.some(e => e.id !== empId && e.role === 'Asset Manager' && e.department === targetDept);
      if (hasManager) {
        return { success: false, message: `The department (${targetDept}) already has an assigned Asset Manager.` };
      }
    }

    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          role: newRole,
          department: newDepartment !== null ? newDepartment : emp.department,
          status: newStatus !== null ? newStatus : emp.status
        };
      }
      return emp;
    }));

    if (supabaseConnected) {
      const dbRole = newRole === 'Asset Manager' ? 'AssetManager' : (newRole === 'Department Head' ? 'DeptHead' : newRole);
      const { data: dept } = await supabase.from('departments').select('id').eq('name', newDepartment).maybeSingle();
      await supabase
        .from('employees')
        .update({
          role: dbRole,
          department_id: dept ? dept.id : null,
          status: newStatus !== null ? newStatus : 'Active'
        })
        .eq('id', empId);
      fetchSupabaseData();
    }

    return { success: true };
  };

  // ── DEPARTMENTS & CATEGORIES ─────────────────────────────────────
  const addDepartment = async (name, headId = '', parentId = null) => {
    const newDep = { id: `dep-${Date.now()}`, name, headId, parentId, status: 'Active' };
    setDepartments(prev => [...prev, newDep]);

    if (supabaseConnected) {
      await supabase.from('departments').insert({
        name,
        head_employee_id: headId || null,
        parent_dept_id: parentId || null,
        status: 'Active'
      });
      fetchSupabaseData();
    }
  };

  const updateDepartment = async (id, name, headId, parentId, status) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, name, headId, parentId, status } : d));

    if (supabaseConnected) {
      await supabase.from('departments').update({
        name,
        head_employee_id: headId || null,
        parent_dept_id: parentId || null,
        status
      }).eq('id', id);
      fetchSupabaseData();
    }
  };

  const addCategory = async (name, fields = []) => {
    const newCat = { id: `cat-${Date.now()}`, name, fields };
    setCategories(prev => [...prev, newCat]);

    if (supabaseConnected) {
      await supabase.from('categories').insert({
        name,
        extra_fields: fields
      });
      fetchSupabaseData();
    }
  };

  const updateCategory = async (id, name, fields = []) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name, fields } : c));

    if (supabaseConnected) {
      await supabase.from('categories').update({
        name,
        extra_fields: fields
      }).eq('id', id);
      fetchSupabaseData();
    }
  };

  // ── ASSETS ────────────────────────────────────────────────────────
  const registerAsset = async (name, categoryName, serial, acqDate, acqCost, condition, location, shared, customFields = {}) => {
    const nextTag = `AF-${String(assets.length + 1).padStart(4, '0')}`;
    const newAsset = {
      id: `asset-${Date.now()}`,
      name,
      category: categoryName,
      tag: nextTag,
      serial,
      acqDate,
      acqCost: Number(acqCost),
      condition,
      location,
      shared: !!shared,
      status: 'Available',
      department: '',
      assignedTo: '',
      customFields,
      history: [{ date: new Date().toISOString().substring(0, 10), type: 'Registration', details: 'Registered in database' }]
    };
    setAssets(prev => [...prev, newAsset]);

    if (supabaseConnected) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', categoryName).maybeSingle();
      await supabase.from('assets').insert({
        name,
        category_id: cat ? cat.id : null,
        serial_number: serial,
        acquisition_date: acqDate || null,
        acquisition_cost: Number(acqCost) || null,
        condition,
        location,
        is_bookable: !!shared,
        status: 'Available'
      });
      fetchSupabaseData();
    }
    return newAsset;
  };

  const updateAsset = async (id, updatedFields) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, ...updatedFields } : a));

    if (supabaseConnected) {
      const { data: cat } = await supabase.from('categories').select('id').eq('name', updatedFields.category).maybeSingle();
      const updates = {
        name: updatedFields.name,
        condition: updatedFields.condition,
        location: updatedFields.location,
        is_bookable: updatedFields.shared,
        status: updatedFields.status
      };
      if (cat) updates.category_id = cat.id;

      await supabase.from('assets').update(updates).eq('id', id);
      fetchSupabaseData();
    }
  };

  // ── ALLOCATIONS ──────────────────────────────────────────────────
  const allocateAsset = async (assetId, employeeId, expectedReturnDate = '', notes = '') => {
    if (supabaseConnected) {
      const { data, error } = await supabase.rpc('allocate_asset', {
        p_asset_id: assetId,
        p_employee_id: employeeId || null,
        p_department_id: null,
        p_expected_return_date: expectedReturnDate || null
      });

      if (error || !data?.success) {
        return { success: false, message: error?.message || data?.reason };
      }
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    const asset = assets.find(a => a.id === assetId);
    if (!asset || asset.status !== 'Available') return { success: false, message: 'Not available.' };
    const emp = employees.find(e => e.id === employeeId);

    const newAlloc = {
      id: `alloc-${Date.now()}`,
      assetId,
      employeeId,
      allocatedDate: new Date().toISOString().substring(0, 10),
      expectedReturnDate,
      status: 'Active'
    };
    setAllocations(prev => [...prev, newAlloc]);
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'Allocated', assignedTo: employeeId, department: emp?.department || '' } : a));
    return { success: true };
  };

  const requestTransfer = async (assetId, targetEmployeeId) => {
    if (supabaseConnected) {
      const { data, error } = await supabase.rpc('request_transfer', {
        p_asset_id: assetId,
        p_requested_by_employee_id: targetEmployeeId
      });
      if (error || !data?.success) return { success: false, message: error?.message || data?.reason };
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    const newTrans = {
      id: `trans-${Date.now()}`,
      assetId,
      fromId: assets.find(a => a.id === assetId)?.assignedTo || '',
      toId: targetEmployeeId,
      status: 'Pending',
      requestDate: new Date().toISOString().substring(0, 10)
    };
    setTransfers(prev => [...prev, newTrans]);
    return { success: true };
  };

  const approveTransfer = async (transferId) => {
    const transObj = transfers.find(t => t.id === transferId);
    if (!transObj) return { success: false, message: 'Transfer not found.' };

    if (supabaseConnected) {
      const { data, error } = await supabase.rpc('approve_transfer', {
        p_asset_id: transObj.assetId
      });
      if (error || !data?.success) return { success: false, message: error?.message || data?.reason };
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Approved' } : t));
    setAllocations(prev => prev.map(al => al.assetId === transObj.assetId && al.status === 'Active' ? { ...al, status: 'Completed' } : al));
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      assetId: transObj.assetId,
      employeeId: transObj.toId,
      allocatedDate: new Date().toISOString().substring(0, 10),
      status: 'Active'
    };
    setAllocations(prev => [...prev, newAlloc]);
    setAssets(prev => prev.map(a => a.id === transObj.assetId ? { ...a, assignedTo: transObj.toId } : a));
    return { success: true };
  };

  const rejectTransfer = async (transferId) => {
    setTransfers(prev => prev.map(t => t.id === transferId ? { ...t, status: 'Rejected' } : t));
    return { success: true };
  };

  const returnAsset = async (assetId, checkInNotes = '', condition = 'Good') => {
    const activeAlloc = allocations.find(al => al.assetId === assetId && al.status === 'Active');

    if (supabaseConnected && activeAlloc) {
      const { data, error } = await supabase.rpc('return_asset', {
        p_allocation_id: activeAlloc.id,
        p_condition_notes: checkInNotes
      });
      if (error || !data?.success) return { success: false, message: error?.message || data?.reason };
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    setAllocations(prev => prev.map(al => al.assetId === assetId && al.status === 'Active' ? { ...al, status: 'Completed', notes: checkInNotes } : al));
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, status: 'Available', assignedTo: '', department: '', condition } : a));
    return { success: true };
  };

  // ── BOOKINGS ─────────────────────────────────────────────────────
  const validateBookingOverlap = (resourceId, startTime, endTime) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (start >= end) return { valid: false, message: 'Start must be before end.' };

    const overlap = bookings.some(b => {
      if (b.resourceId !== resourceId) return false;
      if (b.status === 'Cancelled') return false;

      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return start < bEnd && end > bStart;
    });

    if (overlap) return { valid: false, message: 'Time slot overlaps with an existing booking.' };
    return { valid: true };
  };

  const bookResource = async (resourceId, title, startTime, endTime) => {
    const validation = validateBookingOverlap(resourceId, startTime, endTime);
    if (!validation.valid) return validation;

    const activeU = getActiveUser();

    if (supabaseConnected && activeU) {
      const { data, error } = await supabase.rpc('create_booking', {
        p_asset_id: resourceId,
        p_booked_by_employee_id: activeU.id,
        p_start_time: startTime,
        p_end_time: endTime
      });

      if (error || !data?.success) return { success: false, message: error?.message || data?.reason };
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    const newBooking = {
      id: `book-${Date.now()}`,
      resourceId,
      employeeId: activeU?.id || 'unknown',
      title,
      startTime,
      endTime,
      status: 'Upcoming'
    };
    setBookings(prev => [...prev, newBooking]);
    return { success: true };
  };

  const cancelBooking = async (bookingId) => {
    if (supabaseConnected) {
      const { data, error } = await supabase.rpc('cancel_booking', {
        p_booking_id: bookingId
      });
      if (error || !data?.success) return { success: false, message: error?.message || data?.reason };
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' } : b));
    return { success: true };
  };

  // ── MAINTENANCE ──────────────────────────────────────────────────
  const raiseMaintenanceRequest = async (assetId, issue, priority, photoUrl = '') => {
    const activeU = getActiveUser();

    if (supabaseConnected) {
      await supabase.from('maintenance').insert({
        asset_id: assetId,
        reported_by: activeU?.id,
        issue,
        priority,
        status: 'Pending',
        photo_url: photoUrl
      });
      fetchSupabaseData();
      return { success: true };
    }

    // fallback
    const newReq = {
      id: `maint-${Date.now()}`,
      assetId,
      reportedBy: activeU?.id || 'system',
      reportedDate: new Date().toISOString().substring(0, 10),
      issue,
      priority,
      status: 'Pending',
      photoUrl
    };
    setMaintenance(prev => [newReq, ...prev]);
    return { success: true };
  };

  const updateMaintenanceStatus = async (id, newStatus, note = '', additionalData = {}) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status: newStatus, ...additionalData } : m));

    if (supabaseConnected) {
      await supabase.from('maintenance').update({
        status: newStatus,
        technician: additionalData.technician || null,
        cost: additionalData.cost || 0
      }).eq('id', id);

      // Trigger asset status side effects
      const maintReq = maintenance.find(m => m.id === id);
      if (maintReq) {
        if (newStatus === 'Approved') {
          await supabase.from('assets').update({ status: 'UnderMaintenance' }).eq('id', maintReq.assetId);
        } else if (newStatus === 'Resolved') {
          await supabase.from('assets').update({ status: 'Available', condition: 'Good' }).eq('id', maintReq.assetId);
        }
      }
      fetchSupabaseData();
    }
  };

  // ── AUDIT CYCLES ─────────────────────────────────────────────────
  const createAuditCycle = async (name, department, location, startDate, endDate, auditorIds) => {
    // Collect all assets matching department/location scope
    const matchingAssets = assets.filter(a => {
      const matchDept = !department || a.department === department;
      const matchLoc = !location || a.location.toLowerCase().includes(location.toLowerCase());
      return matchDept && matchLoc;
    });

    const checklist = matchingAssets.map(a => ({
      assetId: a.id,
      tag: a.tag,
      name: a.name,
      result: 'Pending',
      notes: ''
    }));

    const newAudit = {
      id: `audit-${Date.now()}`,
      name,
      department,
      location,
      startDate,
      endDate,
      auditors: auditorIds,
      status: 'Active',
      checklist,
      discrepancies: []
    };
    setAudits(prev => [...prev, newAudit]);

    if (supabaseConnected) {
      await supabase.from('audits').insert({
        name,
        department: department || null,
        location: location || null,
        start_date: startDate,
        end_date: endDate,
        auditors: auditorIds,
        status: 'Active',
        checklist,
        discrepancies: []
      });
      fetchSupabaseData();
    }
    return newAudit;
  };

  const recordAuditVerification = async (auditId, assetId, result, notes = '') => {
    setAudits(prev => prev.map(aud => {
      if (aud.id === auditId) {
        const updatedChecklist = aud.checklist.map(item => {
          if (item.assetId === assetId) return { ...item, result, notes };
          return item;
        });
        const discrepancies = updatedChecklist.filter(item => item.result === 'Missing' || item.result === 'Damaged');
        return { ...aud, checklist: updatedChecklist, discrepancies };
      }
      return aud;
    }));

    if (supabaseConnected) {
      const auditObj = audits.find(a => a.id === auditId);
      if (auditObj) {
        const updatedChecklist = auditObj.checklist.map(item => {
          if (item.assetId === assetId) return { ...item, result, notes };
          return item;
        });
        const discrepancies = updatedChecklist.filter(item => item.result === 'Missing' || item.result === 'Damaged');

        await supabase.from('audits').update({
          checklist: updatedChecklist,
          discrepancies
        }).eq('id', auditId);
        fetchSupabaseData();
      }
    }
  };

  const closeAuditCycle = async (auditId) => {
    setAudits(prev => prev.map(aud => aud.id === auditId ? { ...aud, status: 'Closed' } : aud));

    if (supabaseConnected) {
      await supabase.from('audits').update({ status: 'Closed' }).eq('id', auditId);

      // Trigger side-effects to flip missing assets to Lost
      const auditObj = audits.find(a => a.id === auditId);
      if (auditObj) {
        for (const item of auditObj.checklist) {
          if (item.result === 'Missing') {
            await supabase.from('assets').update({ status: 'Lost' }).eq('id', item.assetId);
          } else if (item.result === 'Damaged') {
            await supabase.from('assets').update({ condition: 'Damaged' }).eq('id', item.assetId);
          }
        }
      }
      fetchSupabaseData();
    }
  };

  // ── NOTIFICATIONS ────────────────────────────────────────────────
  const markNotificationRead = async (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));

    if (supabaseConnected) {
      await supabase.from('notifications').update({ read: true }).eq('id', notifId);
      fetchSupabaseData();
    }
  };

  return (
    <StateContext.Provider value={{
      departments,
      categories,
      employees,
      assets,
      allocations,
      bookings,
      maintenance,
      audits,
      logs,
      notifications,
      transfers,
      currentUser,
      simulatedRole,
      setSimulatedRole,
      getActiveRole,
      getActiveUser,
      loginUser,
      logoutUser,
      signupUser,
      updateEmployeeRole,
      addDepartment,
      updateDepartment,
      addCategory,
      updateCategory,
      registerAsset,
      updateAsset,
      allocateAsset,
      requestTransfer,
      approveTransfer,
      rejectTransfer,
      returnAsset,
      validateBookingOverlap,
      bookResource,
      cancelBooking,
      raiseMaintenanceRequest,
      updateMaintenanceStatus,
      createAuditCycle,
      recordAuditVerification,
      closeAuditCycle,
      markNotificationRead,
      logActivity,
      supabaseConnected
    }}>
      {children}
    </StateContext.Provider>
  );
};
