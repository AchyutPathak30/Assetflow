import React, { useContext } from 'react';
import { StateContext } from '../context/StateContext';

const LogsView = () => {
  const {
    logs,
    notifications,
    employees,
    markNotificationRead,
    getActiveUser
  } = useContext(StateContext);

  const activeUser = getActiveUser();
  const userNotifications = notifications.filter(n => n.userId === activeUser?.id);

  return (
    <div className="logs-view">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Logs & Notifications</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Monitor audit logs and review notifications about resource bookings and asset returns.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Notifications */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Notification Inbox</h2>
          {userNotifications.length === 0 ? (
            <div className="empty-state">No notifications.</div>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {userNotifications.map(notif => (
                <li
                  key={notif.id}
                  onClick={() => markNotificationRead(notif.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    marginBottom: '12px',
                    background: notif.read ? 'rgba(255,255,255,0.01)' : 'rgba(99, 102, 241, 0.05)',
                    borderLeft: notif.read ? '1px solid var(--border-color)' : '3px solid var(--color-primary)',
                    cursor: 'pointer',
                    transition: '0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: notif.read ? '#cbd5e1' : 'white' }}>{notif.title}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>{notif.timestamp.substring(11, 16)}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{notif.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Side: System Audit Logs */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>System Audit Trail</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            A comprehensive, immutable log of admin, manager, and employee actions in the system.
          </p>

          {logs.length === 0 ? (
            <div className="empty-state">No audit logs recorded.</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table" style={{ fontSize: '0.82rem' }}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map(log => {
                    const user = employees.find(e => e.id === log.userId);
                    return (
                      <tr key={log.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{log.timestamp.replace('T', ' ')}</td>
                        <td style={{ fontWeight: 600 }}>{user ? user.name : 'System'}</td>
                        <td>
                          <span className="badge badge-allocated" style={{ background: 'rgba(99, 102, 241, 0.05)', color: 'var(--color-primary)' }}>
                            {log.action}
                          </span>
                        </td>
                        <td>{log.details}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LogsView;
