import React, { useContext, useState } from 'react';
import { StateContext } from '../context/StateContext';

const BookingView = () => {
  const {
    assets,
    bookings,
    employees,
    bookResource,
    cancelBooking,
    getActiveUser
  } = useContext(StateContext);

  const activeUser = getActiveUser();

  // Find bookable assets
  const sharedResources = assets.filter(a => a.shared);

  // Form states
  const [selectedResourceId, setSelectedResourceId] = useState(sharedResources[0]?.id || '');
  const [bookingTitle, setBookingTitle] = useState('');
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().substring(0, 10));
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Get bookings for selected resource on selected date
  const resourceBookings = bookings.filter(b => {
    if (b.resourceId !== selectedResourceId) return false;
    const bookingDatePart = b.startTime.substring(0, 10);
    return bookingDatePart === bookingDate;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Handle Book
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const startDateTime = `${bookingDate}T${startTime}`;
    const endDateTime = `${bookingDate}T${endTime}`;

    const result = bookResource(selectedResourceId, bookingTitle, startDateTime, endDateTime);
    if (result.success) {
      setSuccessMsg('Booking confirmed successfully!');
      setBookingTitle('');
    } else {
      setErrorMsg(result.message);
    }
  };

  return (
    <div className="booking-view">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Resource Booking</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reserve shared resources (rooms, vehicles, equipment) with instant overlap validation.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Create Booking */}
        <div className="glass-card">
          <h2 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Reserve Resource</h2>
          
          {errorMsg && <div className="alert-box alert-danger">{errorMsg}</div>}
          {successMsg && <div className="alert-box alert-success">{successMsg}</div>}

          {sharedResources.length === 0 ? (
            <div className="empty-state">No shared resources registered in the system.</div>
          ) : (
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Resource to Book</label>
                <select
                  className="form-control"
                  value={selectedResourceId}
                  onChange={(e) => {
                    setSelectedResourceId(e.target.value);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  required
                >
                  {sharedResources.map(r => (
                    <option key={r.id} value={r.id}>{r.name} ({r.location})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Booking / Meeting Title</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Project Sync, Client Presentation"
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label>Start Time</label>
                  <select
                    className="form-control"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {Array.from({ length: 24 }).map((_, h) => {
                      const hourStr = String(h).padStart(2, '0');
                      return (
                        <React.Fragment key={h}>
                          <option value={`${hourStr}:00`}>{hourStr}:00</option>
                          <option value={`${hourStr}:30`}>{hourStr}:30</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>

                <div className="form-group">
                  <label>End Time</label>
                  <select
                    className="form-control"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {Array.from({ length: 24 }).map((_, h) => {
                      const hourStr = String(h).padStart(2, '0');
                      return (
                        <React.Fragment key={h}>
                          <option value={`${hourStr}:00`}>{hourStr}:00</option>
                          <option value={`${hourStr}:30`}>{hourStr}:30</option>
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '16px' }}>
                📅 Confirm Reservation
              </button>
            </form>
          )}
        </div>

        {/* Right Side: Schedule view for the resource */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem' }}>Schedule Timeline</h2>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-secondary)', fontWeight: 600 }}>{bookingDate}</span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Viewing reservations for selected resource on this day.
          </p>

          {resourceBookings.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>No bookings for this resource on {bookingDate}.</div>
          ) : (
            <div className="timeline" style={{ paddingLeft: '30px' }}>
              {resourceBookings.map(b => {
                const booker = employees.find(e => e.id === b.employeeId);
                const sTime = b.startTime.substring(11, 16);
                const eTime = b.endTime.substring(11, 16);
                const isCancelled = b.status === 'Cancelled';
                
                return (
                  <div key={b.id} className={`timeline-item ${isCancelled ? '' : 'completed'}`} style={{ marginBottom: '16px' }}>
                    <div className="timeline-date" style={{ fontSize: '0.8rem', fontWeight: 700, color: isCancelled ? 'var(--text-dark)' : 'var(--color-secondary)' }}>
                      {sTime} - {eTime}
                    </div>
                    <div className="timeline-title" style={{ fontSize: '0.95rem', textDecoration: isCancelled ? 'line-through' : 'none', color: isCancelled ? 'var(--text-dark)' : 'white' }}>
                      {b.title}
                    </div>
                    <div className="timeline-desc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span>Reserved by: {booker ? booker.name : 'Unknown'}</span>
                      {b.status !== 'Cancelled' && (b.employeeId === activeUser?.id || activeUser?.role === 'Admin') && (
                        <button className="btn btn-danger" style={{ padding: '2px 8px', fontSize: '0.7rem' }} onClick={() => cancelBooking(b.id)}>
                          Cancel
                        </button>
                      )}
                      {isCancelled && <span className="badge badge-retired" style={{ fontSize: '0.65rem' }}>Cancelled</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingView;
