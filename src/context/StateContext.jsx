import React, { createContext, useState, useEffect } from 'react';

export const StateContext = createContext();

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
  { id: 'emp-1', name: 'Admin User', email: 'admin@assetflow.com', department: 'Information Technology', role: 'Admin', status: 'Active', password: 'password' },
  { id: 'emp-2', name: 'Sarah Connor', email: 'manager@assetflow.com', department: 'Information Technology', role: 'Asset Manager', status: 'Active', password: 'password' },
  { id: 'emp-3', name: 'Raj Koothrappali', email: 'head@assetflow.com', department: 'Human Resources', role: 'Department Head', status: 'Active', password: 'password' },
  { id: 'emp-4', name: 'Priya Sen', email: 'staff@assetflow.com', department: 'Operations', role: 'Employee', status: 'Active', password: 'password' },
  { id: 'emp-5', name: 'John Doe', email: 'john@assetflow.com', department: 'Operations', role: 'Employee', status: 'Active', password: 'password' }
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
    assignedTo: 'emp-4', // Priya
    customFields: { 'Warranty Period (months)': '24' },
    history: [
      { date: '2025-01-10', type: 'Registration', details: 'Asset registered in system' },
      { date: '2025-01-12', type: 'Allocation', details: 'Allocated to Priya Sen' }
    ]
  },
  { 
    id: 'asset-2', 
    name: 'Dell UltraSharp 27" Monitor', 
    category: 'Electronics', 
    tag: 'AF-0002', 
    serial: 'MX7654321', 
    acqDate: '2025-02-15', 
    acqCost: 450, 
    condition: 'Good', 
    location: 'Headquarters - 3rd Floor', 
    shared: false, 
    status: 'Available',
    department: 'Information Technology',
    assignedTo: '',
    customFields: { 'Warranty Period (months)': '36' },
    history: [
      { date: '2025-02-15', type: 'Registration', details: 'Asset registered in system' }
    ]
  },
  { 
    id: 'asset-3', 
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
    history: [
      { date: '2024-06-01', type: 'Registration', details: 'Shared space added to system' }
    ]
  },
  { 
    id: 'asset-4', 
    name: 'Tesla Model 3 (Fleet #4)', 
    category: 'Vehicles', 
    tag: 'AF-0004', 
    serial: '5YJ3E1EA5L', 
    acqDate: '2024-11-20', 
    acqCost: 38000, 
    condition: 'Good', 
    location: 'Parking Garage G2', 
    shared: true, 
    status: 'Available',
    department: 'Operations',
    assignedTo: '',
    customFields: { 'License Plate': 'KA-03-MM-1234', 'Insurance Expiry': '2026-11-20' },
    history: [
      { date: '2024-11-20', type: 'Registration', details: 'Vehicle registered as shared resource' }
    ]
  },
  { 
    id: 'asset-5', 
    name: 'Ergonomic Desk Chair', 
    category: 'Furniture', 
    tag: 'AF-0005', 
    serial: 'CHAIR-99', 
    acqDate: '2025-03-01', 
    acqCost: 300, 
    condition: 'Excellent', 
    location: 'Headquarters - 2nd Floor', 
    shared: false, 
    status: 'Available',
    department: 'Human Resources',
    assignedTo: '',
    customFields: { 'Material': 'Mesh' },
    history: [
      { date: '2025-03-01', type: 'Registration', details: 'Furniture registered in system' }
    ]
  },
  { 
    id: 'asset-6', 
    name: 'Apple MacBook Pro 16"', 
    category: 'Electronics', 
    tag: 'AF-0006', 
    serial: 'C02F2345Q6W', 
    acqDate: '2024-12-15', 
    acqCost: 2400, 
    condition: 'Needs Repair', 
    location: 'Remote Work', 
    shared: false, 
    status: 'Under Maintenance',
    department: 'Information Technology',
    assignedTo: 'emp-5', // John Doe
    customFields: { 'Warranty Period (months)': '12' },
    history: [
      { date: '2024-12-15', type: 'Registration', details: 'Asset registered in system' },
      { date: '2024-12-16', type: 'Allocation', details: 'Allocated to John Doe' },
      { date: '2026-07-10', type: 'Maintenance Request', details: 'Battery swelling issue reported' },
      { date: '2026-07-11', type: 'Maintenance Approval', details: 'Approved for maintenance. Status flipped to Under Maintenance' }
    ]
  }
];

const DEFAULT_ALLOCATIONS = [
  {
    id: 'alloc-1',
    assetId: 'asset-1',
    employeeId: 'emp-4', // Priya
    allocatedBy: 'emp-2', // Manager
    allocatedDate: '2025-01-12',
    expectedReturnDate: '2026-06-30', // Overdue relative to current time 2026-07-12
    returnedDate: '',
    status: 'Active',
    notes: 'Initial allocation for operations work.'
  },
  {
    id: 'alloc-2',
    assetId: 'asset-6',
    employeeId: 'emp-5', // John
    allocatedBy: 'emp-2',
    allocatedDate: '2024-12-16',
    expectedReturnDate: '2026-08-30',
    returnedDate: '',
    status: 'Active',
    notes: 'Development machine.'
  }
];

const DEFAULT_BOOKINGS = [
  {
    id: 'book-1',
    resourceId: 'asset-3', // Conf room Alpha
    employeeId: 'emp-4', // Priya
    title: 'Daily Standup Meeting',
    startTime: '2026-07-12T09:00',
    endTime: '2026-07-12T10:00',
    status: 'Completed'
  },
  {
    id: 'book-2',
    resourceId: 'asset-3',
    employeeId: 'emp-5', // John
    title: 'Client Demo Presentation',
    startTime: '2026-07-12T11:00',
    endTime: '2026-07-12T12:00',
    status: 'Upcoming'
  },
  {
    id: 'book-3',
    resourceId: 'asset-4', // Tesla
    employeeId: 'emp-3', // Raj
    title: 'Site Visit Operations',
    startTime: '2026-07-12T13:00',
    endTime: '2026-07-12T17:00',
    status: 'Upcoming'
  }
];

const DEFAULT_MAINTENANCE = [
  {
    id: 'maint-1',
    assetId: 'asset-6',
    reportedBy: 'emp-5',
    reportedDate: '2026-07-10',
    issue: 'Battery swelling and keyboard issues',
    priority: 'High',
    status: 'Under Maintenance', // Pending -> Approved / Under Maintenance -> Technician Assigned -> In Progress -> Resolved
    technician: 'Alice Cooper (External Support)',
    cost: 150,
    history: [
      { status: 'Pending', date: '2026-07-10', note: 'Raised request' },
      { status: 'Under Maintenance', date: '2026-07-11', note: 'Approved by Sarah Connor' }
    ]
  }
];

const DEFAULT_AUDITS = [
  {
    id: 'audit-1',
    name: 'Q2 2026 IT Asset Verification',
    department: 'Information Technology',
    location: 'Headquarters - 3rd Floor',
    startDate: '2026-06-01',
    endDate: '2026-06-15',
    auditors: ['emp-2'],
    status: 'Closed',
    checklist: [
      { assetId: 'asset-1', tag: 'AF-0001', name: 'Dell XPS 15 Laptop', result: 'Verified', notes: 'Checked in-person with Priya' },
      { assetId: 'asset-2', tag: 'AF-0002', name: 'Dell UltraSharp 27" Monitor', result: 'Verified', notes: 'Located at desk 3C' }
    ],
    discrepancies: []
  },
  {
    id: 'audit-2',
    name: 'July 2026 Operations Audit',
    department: 'Operations',
    location: 'Headquarters - 1st Floor',
    startDate: '2026-07-01',
    endDate: '2026-07-20',
    auditors: ['emp-2', 'emp-3'],
    status: 'Active',
    checklist: [
      { assetId: 'asset-3', tag: 'AF-0003', name: 'Conference Room Alpha', result: 'Pending', notes: '' },
      { assetId: 'asset-4', tag: 'AF-0004', name: 'Tesla Model 3 (Fleet #4)', result: 'Pending', notes: '' }
    ],
    discrepancies: []
  }
];

const DEFAULT_LOGS = [
  { id: 'log-1', timestamp: '2026-07-12T09:00:00', userId: 'emp-4', action: 'Resource Booking', details: 'Booked Conference Room Alpha for Daily Standup Meeting' },
  { id: 'log-2', timestamp: '2026-07-11T14:30:00', userId: 'emp-2', action: 'Maintenance Approval', details: 'Approved maintenance request for MacBook Pro (AF-0006)' },
  { id: 'log-3', timestamp: '2026-07-10T10:15:00', userId: 'emp-5', action: 'Maintenance Request', details: 'Raised maintenance request for MacBook Pro (AF-0006)' }
];

const DEFAULT_NOTIFICATIONS = [
  { id: 'notif-1', timestamp: '2026-07-12T09:00:00', userId: 'emp-4', title: 'Booking Confirmed', message: 'Your booking for Conference Room Alpha has been confirmed.', read: false },
  { id: 'notif-2', timestamp: '2026-07-11T14:30:00', userId: 'emp-5', title: 'Maintenance Approved', message: 'Your maintenance request for MacBook Pro (AF-0006) was approved. Status updated to Under Maintenance.', read: false },
  { id: 'notif-3', timestamp: '2026-07-12T00:00:00', userId: 'emp-2', title: 'Overdue Asset Alert', message: 'Asset Dell XPS 15 Laptop (AF-0001) assigned to Priya Sen was expected back on 2026-06-30 and is now overdue.', read: false }
];

const DEFAULT_TRANSFERS = [
  // { id: 'trans-1', assetId: 'asset-1', fromId: 'emp-4', toId: 'emp-5', requestedBy: 'emp-5', status: 'Pending', requestDate: '2026-07-12' }
];

export const StateProvider = ({ children }) => {
  // Try loading from localStorage, fallback to seed defaults
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

  // Current logged in user.
  // Initially we log in as the Admin (Sarah / Sarah Connor - wait, Admin is emp-1, Sarah Connor is Asset Manager).
  // We can let users simulate different roles dynamically at the top!
  const [currentUser, setCurrentUser] = useState(() => getInitialState('currentUser', DEFAULT_EMPLOYEES[0]));
  const [simulatedRole, setSimulatedRole] = useState(null); // When set, overrides current user's functional permissions for demo

  // Sync to localStorage when state changes
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
  useEffect(() => {
    localStorage.setItem('assetflow_currentUser', JSON.stringify(currentUser));
  }, [currentUser]);

  // Current effective role
  const getActiveRole = () => {
    if (simulatedRole) return simulatedRole;
    return currentUser ? currentUser.role : 'Guest';
  };

  const getActiveUser = () => {
    if (simulatedRole) {
      // Find an employee with that role for a complete simulation context
      const match = employees.find(e => e.role === simulatedRole);
      return match || currentUser;
    }
    return currentUser;
  };

  // Helper: log activity
  const logActivity = (action, details, userId = null) => {
    const activeU = getActiveUser();
    const uId = userId || (activeU ? activeU.id : 'system');
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().substring(0, 19),
      userId: uId,
      action,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // Helper: send notification
  const sendNotification = (userId, title, message) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString().substring(0, 19),
      userId,
      title,
      message,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  // Login handler
  const loginUser = (email, password) => {
    const matched = employees.find(e => e.email.toLowerCase() === email.toLowerCase() && e.password === password);
    if (matched) {
      if (matched.status !== 'Active') {
        return { success: false, message: 'Your account is currently deactivated.' };
      }
      setCurrentUser(matched);
      setSimulatedRole(null); // Reset simulation on actual login
      logActivity('Login', `User ${matched.name} logged in successfully`, matched.id);
      return { success: true, user: matched };
    }
    return { success: false, message: 'Invalid email or password.' };
  };

  const logoutUser = () => {
    if (currentUser) {
      logActivity('Logout', `User ${currentUser.name} logged out`, currentUser.id);
    }
    setCurrentUser(null);
    setSimulatedRole(null);
  };

  // Signup (creates Employee account only, no role selection)
  const signupUser = (name, email, password, departmentName = 'Operations') => {
    if (employees.some(e => e.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email is already registered.' };
    }
    const newEmp = {
      id: `emp-${Date.now()}`,
      name,
      email,
      department: departmentName,
      role: 'Employee', // Always default to Employee, no selection
      status: 'Active',
      password
    };
    setEmployees(prev => [...prev, newEmp]);
    logActivity('Signup', `New employee registered: ${name} (${email})`, newEmp.id);
    return { success: true, message: 'Registration successful! You can now log in.' };
  };

  // Admin promotions and role updates
  const updateEmployeeRole = (empId, newRole, newDepartment = null, newStatus = null) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === empId) {
        const updated = { 
          ...emp, 
          role: newRole, 
          department: newDepartment !== null ? newDepartment : emp.department,
          status: newStatus !== null ? newStatus : emp.status
        };
        logActivity('Employee Update', `Admin updated employee ${emp.name}: Role=${newRole}, Dept=${updated.department}, Status=${updated.status}`);
        return updated;
      }
      return emp;
    }));
  };

  // Add Department
  const addDepartment = (name, headId = '', parentId = null) => {
    const newDep = {
      id: `dep-${Date.now()}`,
      name,
      headId,
      parentId,
      status: 'Active'
    };
    setDepartments(prev => [...prev, newDep]);
    logActivity('Department Creation', `Admin created department: ${name}`);
  };

  // Update Department
  const updateDepartment = (id, name, headId, parentId, status) => {
    setDepartments(prev => prev.map(d => {
      if (d.id === id) {
        logActivity('Department Update', `Admin updated department ${name} (Status: ${status})`);
        return { ...d, name, headId, parentId, status };
      }
      return d;
    }));
  };

  // Add Asset Category
  const addCategory = (name, fields = []) => {
    const newCat = {
      id: `cat-${Date.now()}`,
      name,
      fields // format: [{ name: 'Warranty Period (months)', type: 'number', required: true }]
    };
    setCategories(prev => [...prev, newCat]);
    logActivity('Category Creation', `Created asset category: ${name}`);
  };

  // Update Category
  const updateCategory = (id, name, fields) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, name, fields };
      }
      return c;
    }));
    logActivity('Category Update', `Updated category: ${name}`);
  };

  // Register Asset (Asset Manager only)
  const registerAsset = (name, categoryName, serial, acqDate, acqCost, condition, location, shared, customFields = {}) => {
    const tagIndex = assets.length + 1;
    const tag = `AF-${String(tagIndex).padStart(4, '0')}`;
    const newAsset = {
      id: `asset-${Date.now()}`,
      name,
      category: categoryName,
      tag,
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
      history: [{ date: new Date().toISOString().substring(0, 10), type: 'Registration', details: 'Asset registered in system' }]
    };
    setAssets(prev => [...prev, newAsset]);
    logActivity('Asset Registration', `Asset Manager registered asset ${name} (${tag})`);
    return newAsset;
  };

  // Update Asset details
  const updateAsset = (id, updatedFields) => {
    setAssets(prev => prev.map(a => {
      if (a.id === id) {
        const historyEntry = {
          date: new Date().toISOString().substring(0, 10),
          type: 'Update',
          details: 'Asset details updated'
        };
        return { ...a, ...updatedFields, history: [...a.history, historyEntry] };
      }
      return a;
    }));
  };

  // Allocate Asset (handles conflict validation)
  const allocateAsset = (assetId, employeeId, expectedReturnDate = '', notes = '') => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found.' };
    
    // Check if asset is already allocated/taken
    if (asset.status !== 'Available') {
      const activeAlloc = allocations.find(al => al.assetId === assetId && al.status === 'Active');
      let holderName = 'Someone';
      if (activeAlloc) {
        const holder = employees.find(e => e.id === activeAlloc.employeeId);
        if (holder) holderName = holder.name;
      }
      return { 
        success: false, 
        conflict: true,
        holderName,
        message: `This asset is currently held by ${holderName}.`
      };
    }

    const employee = employees.find(e => e.id === employeeId);
    const activeU = getActiveUser();

    // Create allocation record
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      assetId,
      employeeId,
      allocatedBy: activeU ? activeU.id : 'system',
      allocatedDate: new Date().toISOString().substring(0, 10),
      expectedReturnDate,
      returnedDate: '',
      status: 'Active',
      notes
    };

    setAllocations(prev => [...prev, newAlloc]);
    
    // Update asset state
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Allocated',
          assignedTo: employeeId,
          department: employee ? employee.department : '',
          history: [...a.history, {
            date: new Date().toISOString().substring(0, 10),
            type: 'Allocation',
            details: `Allocated to ${employee ? employee.name : 'Unknown Employee'}`
          }]
        };
      }
      return a;
    }));

    sendNotification(employeeId, 'Asset Allocated', `You have been allocated asset ${asset.name} (${asset.tag}).`);
    logActivity('Asset Allocation', `Allocated ${asset.tag} to ${employee ? employee.name : 'Employee'}`);
    return { success: true };
  };

  // Raise Transfer Request (when asset is conflicted)
  const requestTransfer = (assetId, targetEmployeeId) => {
    const asset = assets.find(a => a.id === assetId);
    const activeAlloc = allocations.find(al => al.assetId === assetId && al.status === 'Active');
    const fromEmployeeId = activeAlloc ? activeAlloc.employeeId : '';
    const activeU = getActiveUser();

    if (!asset || !fromEmployeeId) return { success: false, message: 'Cannot transfer this asset.' };

    const newTransfer = {
      id: `trans-${Date.now()}`,
      assetId,
      fromId: fromEmployeeId,
      toId: targetEmployeeId,
      requestedBy: activeU ? activeU.id : targetEmployeeId,
      status: 'Pending',
      requestDate: new Date().toISOString().substring(0, 10)
    };

    setTransfers(prev => [...prev, newTransfer]);

    // Notify current holder
    sendNotification(fromEmployeeId, 'Transfer Requested', `A transfer has been requested for your asset ${asset.name} (${asset.tag}).`);
    
    // Notify department heads or managers (Asset Manager approves)
    employees.filter(e => e.role === 'Asset Manager').forEach(m => {
      sendNotification(m.id, 'New Transfer Request', `Transfer requested for ${asset.tag} from holder to another employee.`);
    });

    logActivity('Transfer Request', `Requested transfer of ${asset.tag} to ${employees.find(e => e.id === targetEmployeeId)?.name}`);
    return { success: true };
  };

  // Approve Transfer Request
  const approveTransfer = (transferId) => {
    const trans = transfers.find(t => t.id === transferId);
    if (!trans) return { success: false, message: 'Transfer request not found.' };

    const asset = assets.find(a => a.id === trans.assetId);
    const toEmployee = employees.find(e => e.id === trans.toId);
    const activeU = getActiveUser();

    // 1. Close current active allocation
    setAllocations(prev => prev.map(al => {
      if (al.assetId === trans.assetId && al.status === 'Active') {
        return { ...al, status: 'Completed', returnedDate: new Date().toISOString().substring(0, 10), notes: `${al.notes || ''} [Transferred]` };
      }
      return al;
    }));

    // 2. Create new allocation
    const newAlloc = {
      id: `alloc-${Date.now()}`,
      assetId: trans.assetId,
      employeeId: trans.toId,
      allocatedBy: activeU ? activeU.id : 'system',
      allocatedDate: new Date().toISOString().substring(0, 10),
      expectedReturnDate: '',
      returnedDate: '',
      status: 'Active',
      notes: 'Allocated via approved transfer.'
    };
    setAllocations(prev => [...prev, newAlloc]);

    // 3. Update Asset
    setAssets(prev => prev.map(a => {
      if (a.id === trans.assetId) {
        return {
          ...a,
          status: 'Allocated',
          assignedTo: trans.toId,
          department: toEmployee ? toEmployee.department : '',
          history: [...a.history, {
            date: new Date().toISOString().substring(0, 10),
            type: 'Transfer',
            details: `Transferred to ${toEmployee ? toEmployee.name : 'Employee'}`
          }]
        };
      }
      return a;
    }));

    // 4. Update Transfer Status
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) return { ...t, status: 'Approved' };
      return t;
    }));

    sendNotification(trans.fromId, 'Transfer Approved', `Your asset ${asset ? asset.name : ''} has been transferred.`);
    sendNotification(trans.toId, 'Asset Transferred to You', `Asset ${asset ? asset.name : ''} is now allocated to you.`);
    logActivity('Transfer Approved', `Approved transfer of ${asset ? asset.tag : 'asset'} to ${toEmployee ? toEmployee.name : 'Employee'}`);
    return { success: true };
  };

  // Reject Transfer Request
  const rejectTransfer = (transferId) => {
    setTransfers(prev => prev.map(t => {
      if (t.id === transferId) return { ...t, status: 'Rejected' };
      return t;
    }));
    const trans = transfers.find(t => t.id === transferId);
    if (trans) {
      sendNotification(trans.toId, 'Transfer Rejected', 'Your asset transfer request was rejected.');
      logActivity('Transfer Rejected', `Rejected transfer of asset ${trans.assetId}`);
    }
    return { success: true };
  };

  // Return Asset
  const returnAsset = (assetId, checkInNotes = '', condition = 'Good') => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found.' };

    // Update active allocation
    setAllocations(prev => prev.map(al => {
      if (al.assetId === assetId && al.status === 'Active') {
        return { 
          ...al, 
          status: 'Completed', 
          returnedDate: new Date().toISOString().substring(0, 10), 
          notes: `${al.notes || ''} [Returned - Notes: ${checkInNotes}]` 
        };
      }
      return al;
    }));

    // Revert asset to Available
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: 'Available',
          assignedTo: '',
          department: '',
          condition: condition,
          history: [...a.history, {
            date: new Date().toISOString().substring(0, 10),
            type: 'Return',
            details: `Returned. Condition: ${condition}. Notes: ${checkInNotes}`
          }]
        };
      }
      return a;
    }));

    logActivity('Asset Return', `Returned asset ${asset.tag}. Status is now Available.`);
    return { success: true };
  };

  // Resource Booking: Overlap Validator
  const validateBookingOverlap = (resourceId, startTime, endTime, bookingIdToIgnore = null) => {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (start >= end) {
      return { valid: false, message: 'Start time must be before end time.' };
    }

    const overlap = bookings.some(b => {
      if (b.resourceId !== resourceId) return false;
      if (b.status === 'Cancelled') return false;
      if (bookingIdToIgnore && b.id === bookingIdToIgnore) return false;

      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      // Check overlap: start < bEnd AND end > bStart
      return start < bEnd && end > bStart;
    });

    if (overlap) {
      return { valid: false, message: 'This slot overlaps with an existing booking for this resource.' };
    }

    return { valid: true };
  };

  // Create Booking
  const bookResource = (resourceId, title, startTime, endTime) => {
    const validation = validateBookingOverlap(resourceId, startTime, endTime);
    if (!validation.valid) return validation;

    const activeU = getActiveUser();
    const newBooking = {
      id: `book-${Date.now()}`,
      resourceId,
      employeeId: activeU ? activeU.id : 'unknown',
      title,
      startTime,
      endTime,
      status: 'Upcoming' // Upcoming, Ongoing, Completed, Cancelled
    };

    setBookings(prev => [...prev, newBooking]);
    logActivity('Resource Booking', `Booked resource ${resourceId}: "${title}" (${startTime} to ${endTime})`);
    
    // Notify
    if (activeU) {
      sendNotification(activeU.id, 'Booking Confirmed', `Your booking for "${title}" is confirmed.`);
    }

    return { success: true };
  };

  // Cancel Booking
  const cancelBooking = (bookingId) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        logActivity('Resource Booking Cancel', `Cancelled booking "${b.title}"`);
        if (b.employeeId) {
          sendNotification(b.employeeId, 'Booking Cancelled', `Your booking for "${b.title}" was cancelled.`);
        }
        return { ...b, status: 'Cancelled' };
      }
      return b;
    }));
  };

  // Raise Maintenance Request
  const raiseMaintenanceRequest = (assetId, issue, priority) => {
    const asset = assets.find(a => a.id === assetId);
    if (!asset) return { success: false, message: 'Asset not found.' };

    const activeU = getActiveUser();
    const newRequest = {
      id: `maint-${Date.now()}`,
      assetId,
      reportedBy: activeU ? activeU.id : 'system',
      reportedDate: new Date().toISOString().substring(0, 10),
      issue,
      priority,
      status: 'Pending', // Pending → Approved / Under Maintenance → Technician Assigned → In Progress → Resolved
      technician: '',
      cost: 0,
      history: [{ status: 'Pending', date: new Date().toISOString().substring(0, 10), note: 'Raised request' }]
    };

    setMaintenance(prev => [...prev, newRequest]);
    
    // Notify Asset Managers
    employees.filter(e => e.role === 'Asset Manager').forEach(m => {
      sendNotification(m.id, 'New Maintenance Request', `Maintenance request raised for ${asset.name} (${asset.tag}).`);
    });

    logActivity('Maintenance Request', `Raised maintenance request for ${asset.tag} (${priority} priority)`);
    return { success: true };
  };

  // Update Maintenance Status
  const updateMaintenanceStatus = (id, newStatus, note = '', additionalData = {}) => {
    setMaintenance(prev => prev.map(m => {
      if (m.id === id) {
        const historyEntry = {
          status: newStatus,
          date: new Date().toISOString().substring(0, 10),
          note
        };

        const updated = {
          ...m,
          status: newStatus,
          history: [...m.history, historyEntry],
          ...additionalData
        };

        // Trigger side-effects based on state changes
        const asset = assets.find(a => a.id === m.assetId);

        if (newStatus === 'Under Maintenance' || newStatus === 'Approved') {
          // If approved, asset status changes to Under Maintenance
          setAssets(prev => prev.map(a => {
            if (a.id === m.assetId) {
              return { 
                ...a, 
                status: 'Under Maintenance',
                history: [...a.history, { date: new Date().toISOString().substring(0, 10), type: 'Maintenance Update', details: 'Flipped to Under Maintenance' }]
              };
            }
            return a;
          }));
          sendNotification(m.reportedBy, 'Maintenance Approved', `Your maintenance request for asset ${asset ? asset.tag : ''} was approved.`);
        } 
        
        if (newStatus === 'Resolved') {
          // If resolved, asset status reverts to Available
          setAssets(prev => prev.map(a => {
            if (a.id === m.assetId) {
              return { 
                ...a, 
                status: 'Available',
                condition: 'Good', // default to Good or whatever checkin note is
                history: [...a.history, { date: new Date().toISOString().substring(0, 10), type: 'Maintenance Resolved', details: `Resolved. Cost: $${updated.cost || 0}. Tech: ${updated.technician || 'N/A'}` }]
              };
            }
            return a;
          }));
          sendNotification(m.reportedBy, 'Maintenance Resolved', `Your maintenance request for asset ${asset ? asset.tag : ''} has been resolved.`);
        }

        logActivity('Maintenance Update', `Updated request ${id} to ${newStatus}. Note: ${note}`);
        return updated;
      }
      return m;
    }));
  };

  // Create Audit Cycle
  const createAuditCycle = (name, department, location, startDate, endDate, auditorIds) => {
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
      result: 'Pending', // Pending, Verified, Missing, Damaged
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
      status: 'Active', // Active, Closed
      checklist,
      discrepancies: []
    };

    setAudits(prev => [...prev, newAudit]);
    
    // Notify auditors
    auditorIds.forEach(auditorId => {
      sendNotification(auditorId, 'Assigned Auditor', `You have been assigned as an auditor for cycle: ${name}.`);
    });

    logActivity('Audit Cycle Created', `Created audit cycle: ${name} with ${checklist.length} assets.`);
    return newAudit;
  };

  // Record Audit Verification
  const recordAuditVerification = (auditId, assetId, result, notes = '') => {
    setAudits(prev => prev.map(aud => {
      if (aud.id === auditId) {
        const updatedChecklist = aud.checklist.map(item => {
          if (item.assetId === assetId) {
            return { ...item, result, notes };
          }
          return item;
        });

        // Re-generate discrepancies checklist
        const discrepancies = updatedChecklist.filter(item => item.result === 'Missing' || item.result === 'Damaged');

        return {
          ...aud,
          checklist: updatedChecklist,
          discrepancies
        };
      }
      return aud;
    }));
    logActivity('Audit Verification', `Recorded result ${result} for asset ${assetId} in cycle ${auditId}`);
  };

  // Close Audit Cycle (Locks the cycle and updates asset statuses)
  const closeAuditCycle = (auditId) => {
    let closedAudit = null;
    
    setAudits(prev => prev.map(aud => {
      if (aud.id === auditId) {
        closedAudit = { ...aud, status: 'Closed' };
        
        // Side effects: update asset statuses for discrepancies
        aud.checklist.forEach(item => {
          if (item.result === 'Missing') {
            // Missing assets status changes to Lost
            setAssets(prevA => prevA.map(a => {
              if (a.id === item.assetId) {
                return {
                  ...a,
                  status: 'Lost',
                  history: [...a.history, { date: new Date().toISOString().substring(0, 10), type: 'Audit Discrepancy', details: 'Marked Missing in Audit. Status changed to Lost.' }]
                };
              }
              return a;
            }));
            
            // Notify Asset Managers
            employees.filter(e => e.role === 'Asset Manager').forEach(m => {
              sendNotification(m.id, 'Audit Discrepancy - Lost Asset', `Asset ${item.name} (${item.tag}) was confirmed missing in audit.`);
            });
          }

          if (item.result === 'Damaged') {
            // Damaged assets status changes to Needs Repair or triggers maintenance
            setAssets(prevA => prevA.map(a => {
              if (a.id === item.assetId) {
                return {
                  ...a,
                  condition: 'Damaged',
                  history: [...a.history, { date: new Date().toISOString().substring(0, 10), type: 'Audit Discrepancy', details: 'Marked Damaged in Audit.' }]
                };
              }
              return a;
            }));
          }
        });

        return closedAudit;
      }
      return aud;
    }));

    logActivity('Audit Closed', `Closed audit cycle: ${closedAudit ? closedAudit.name : auditId}. Locks applied.`);
    return { success: true };
  };

  // Notifications - Mark as read
  const markNotificationRead = (notifId) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
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
      transfersList: transfers,
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
      logActivity
    }}>
      {children}
    </StateContext.Provider>
  );
};
