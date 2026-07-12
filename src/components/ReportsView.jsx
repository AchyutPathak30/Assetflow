import React, { useContext } from 'react';
import { StateContext } from '../context/StateContext';

const ReportsView = () => {
  const {
    assets,
    maintenance,
    bookings,
    departments,
    allocations
  } = useContext(StateContext);

  // 1. Asset utilization calculation (Allocated vs Available)
  const totalAssets = assets.length;
  const allocatedCount = assets.filter(a => a.status === 'Allocated').length;
  const availableCount = assets.filter(a => a.status === 'Available').length;
  const maintCount = assets.filter(a => a.status === 'Under Maintenance').length;
  const otherCount = totalAssets - allocatedCount - availableCount - maintCount;

  // 2. Department-wise allocations
  const deptSummary = departments.map(d => {
    const assignedCount = assets.filter(a => a.department === d.name && a.status === 'Allocated').length;
    return { name: d.name, count: assignedCount };
  });

  // 3. Maintenance frequency by Category
  const categoryMaintenanceCount = maintenance.reduce((acc, curr) => {
    const asset = assets.find(a => a.id === curr.assetId);
    const cat = asset ? asset.category : 'Unknown';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  // 4. Resource Booking Heatmap data
  // Let's create an array of times from 09:00 to 18:00 (9 hours) for our shared resources
  const hours = Array.from({ length: 10 }).map((_, i) => 9 + i); // 9 to 18
  const sharedResources = assets.filter(a => a.shared);

  const getHeatmapColor = (resourceId, hour) => {
    // Count bookings that overlap with this hour
    const activeBookings = bookings.filter(b => {
      if (b.resourceId !== resourceId || b.status === 'Cancelled') return false;
      const bStartHour = new Date(b.startTime).getHours();
      const bEndHour = new Date(b.endTime).getHours();
      return hour >= bStartHour && hour < bEndHour;
    });

    const count = activeBookings.length;
    if (count === 0) return 'rgba(255, 255, 255, 0.02)';
    if (count === 1) return 'rgba(6, 182, 212, 0.3)'; // cyan low usage
    if (count === 2) return 'rgba(99, 102, 241, 0.6)'; // indigo medium
    return 'rgba(139, 92, 246, 0.9)'; // purple high usage
  };

  // SVGs chart computation
  const svgRadius = 60;
  const svgCircumference = 2 * Math.PI * svgRadius;
  const allocatedPct = totalAssets ? (allocatedCount / totalAssets) : 0;
  const availablePct = totalAssets ? (availableCount / totalAssets) : 0;
  const maintPct = totalAssets ? (maintCount / totalAssets) : 0;
  const otherPct = totalAssets ? (otherCount / totalAssets) : 0;

  const strokeDashAllocated = svgCircumference * allocatedPct;
  const strokeDashAvailable = svgCircumference * availablePct;
  const strokeDashMaint = svgCircumference * maintPct;
  const strokeDashOther = svgCircumference * otherPct;

  return (
    <div className="reports-view">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Reports & Analytics</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Actionable operational insights, resource utilization levels, and booking heatmaps.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '32px' }}>
        
        {/* Chart Card */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ alignSelf: 'flex-start', marginBottom: '24px' }}>Overall Asset Allocation</h3>
          
          <div style={{ position: 'relative', width: '200px', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              {/* Available */}
              <circle
                cx="100" cy="100" r={svgRadius}
                fill="transparent"
                stroke="var(--color-success)"
                strokeWidth="20"
                strokeDasharray={`${strokeDashAvailable} ${svgCircumference}`}
              />
              {/* Allocated */}
              <circle
                cx="100" cy="100" r={svgRadius}
                fill="transparent"
                stroke="var(--color-primary)"
                strokeWidth="20"
                strokeDasharray={`${strokeDashAllocated} ${svgCircumference}`}
                strokeDashoffset={-strokeDashAvailable}
              />
              {/* Maintenance */}
              <circle
                cx="100" cy="100" r={svgRadius}
                fill="transparent"
                stroke="var(--color-warning)"
                strokeWidth="20"
                strokeDasharray={`${strokeDashMaint} ${svgCircumference}`}
                strokeDashoffset={-(strokeDashAvailable + strokeDashAllocated)}
              />
              {/* Other */}
              <circle
                cx="100" cy="100" r={svgRadius}
                fill="transparent"
                stroke="var(--color-danger)"
                strokeWidth="20"
                strokeDasharray={`${strokeDashOther} ${svgCircumference}`}
                strokeDashoffset={-(strokeDashAvailable + strokeDashAllocated + strokeDashMaint)}
              />
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800 }}>{totalAssets}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Assets</span>
            </div>
          </div>

          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '24px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-success)' }} />
              <span>Available ({availableCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-primary)' }} />
              <span>Allocated ({allocatedCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-warning)' }} />
              <span>Maintenance ({maintCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-danger)' }} />
              <span>Lost / Retired ({otherCount})</span>
            </div>
          </div>
        </div>

        {/* Department allocations bar chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '24px' }}>Department-wise Allocation Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deptSummary.map(dept => {
              const maxCount = Math.max(...deptSummary.map(d => d.count), 1);
              const barWidth = `${(dept.count / maxCount) * 100}%`;
              return (
                <div key={dept.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600 }}>{dept.name}</span>
                    <span style={{ color: 'white', fontWeight: 700 }}>{dept.count} Assets</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: barWidth, height: '100%', background: 'linear-gradient(90deg, var(--color-primary) 0%, var(--color-secondary) 100%)', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Heatmap Card */}
      <div className="glass-card" style={{ marginBottom: '32px' }}>
        <h3 style={{ marginBottom: '6px' }}>Resource Booking Heatmap</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Visualize busy hours for shared conference rooms, workspaces, and fleets (09:00 - 18:00).
        </p>

        {sharedResources.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px' }}>No shared bookable resources registered.</div>
        ) : (
          <div style={{ marginTop: '24px', overflowX: 'auto' }}>
            <div style={{ minWidth: '700px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '150px repeat(10, 1fr)', gap: '4px', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                <span>Resource</span>
                {hours.map(h => (
                  <span key={h} style={{ textAlign: 'center' }}>{String(h).padStart(2, '0')}:00</span>
                ))}
              </div>

              {sharedResources.map(res => (
                <div key={res.id} style={{ display: 'grid', gridTemplateColumns: '150px repeat(10, 1fr)', gap: '4px', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</span>
                  {hours.map(h => (
                    <div
                      key={h}
                      className="heatmap-cell"
                      style={{
                        background: getHeatmapColor(res.id, h),
                        border: '1px solid rgba(255,255,255,0.03)'
                      }}
                      title={`${res.name} at ${h}:00`}
                    />
                  ))}
                </div>
              ))}

              <div className="heatmap-legend">
                <span>Free</span>
                <div className="legend-box" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.03)' }} />
                <div className="legend-box" style={{ background: 'rgba(6, 182, 212, 0.3)' }} />
                <div className="legend-box" style={{ background: 'rgba(99, 102, 241, 0.6)' }} />
                <div className="legend-box" style={{ background: 'rgba(139, 92, 246, 0.9)' }} />
                <span>Fully Booked</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance statistics table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '16px' }}>Category Maintenance Frequencies</h3>
        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Failures Reported</th>
                <th>Average Repair Cost</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(categoryMaintenanceCount).map(([cat, count]) => {
                const costs = maintenance.filter(m => {
                  const asset = assets.find(a => a.id === m.assetId);
                  return asset && asset.category === cat;
                }).map(m => m.cost || 0);
                const avgCost = costs.length ? Math.round(costs.reduce((a,b)=>a+b, 0) / costs.length) : 0;
                
                return (
                  <tr key={cat}>
                    <td style={{ fontWeight: 600 }}>{cat}</td>
                    <td>{count} incidents</td>
                    <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>${avgCost}</td>
                  </tr>
                );
              })}
              {Object.keys(categoryMaintenanceCount).length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>No maintenance data recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
