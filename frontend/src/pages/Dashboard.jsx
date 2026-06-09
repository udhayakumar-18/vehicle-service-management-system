// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRevenueSummary } from '../api/revenueApi';
import { getServices } from '../api/serviceApi';
import { getVehicles } from '../api/vehicleApi';
import { getComponents } from '../api/componentApi';
import StatusBadge from '../components/StatusBadge';

export default function Dashboard({ addToast }) {
  const [summary, setSummary] = useState(null);
  const [recentServices, setRecentServices] = useState([]);
  const [counts, setCounts] = useState({ vehicles: 0, components: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      getRevenueSummary(),
      getServices(),
      getVehicles(),
      getComponents(),
    ]).then(([rev, svc, veh, comp]) => {
      setSummary(rev.data);
      setRecentServices(svc.data.slice(0, 5));
      setCounts({ vehicles: veh.data.length, components: comp.data.length });
    }).catch(() => addToast('Failed to load dashboard data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner" style={{ width: 32, height: 32 }}></div>
      <span>Loading dashboard...</span>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Overview of your vehicle service operations</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid">
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-emerald)' }}>
          <div className="stat-icon">💰</div>
          <div className="stat-value">{fmt(summary?.all_time?.revenue || 0)}</div>
          <div className="stat-label">Total Revenue</div>
          <div className="stat-sub">{summary?.all_time?.count || 0} paid jobs</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-primary)' }}>
          <div className="stat-icon">📅</div>
          <div className="stat-value">{fmt(summary?.today?.revenue || 0)}</div>
          <div className="stat-label">Today's Revenue</div>
          <div className="stat-sub">{summary?.today?.count || 0} jobs today</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-purple)' }}>
          <div className="stat-icon">📆</div>
          <div className="stat-value">{fmt(summary?.this_month?.revenue || 0)}</div>
          <div className="stat-label">This Month</div>
          <div className="stat-sub">{summary?.this_month?.count || 0} jobs</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-amber)' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{summary?.pending?.count || 0}</div>
          <div className="stat-label">Pending Jobs</div>
          <div className="stat-sub">{fmt(summary?.pending?.value || 0)} outstanding</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-cyan)' }}>
          <div className="stat-icon">🚗</div>
          <div className="stat-value">{counts.vehicles}</div>
          <div className="stat-label">Vehicles</div>
          <div className="stat-sub">Registered</div>
        </div>
        <div className="stat-card" style={{ '--stat-color': 'var(--accent-rose)' }}>
          <div className="stat-icon">🔧</div>
          <div className="stat-value">{counts.components}</div>
          <div className="stat-label">Components</div>
          <div className="stat-sub">In catalog</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 28 }}>
        <div className="page-header-row" style={{ marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600 }}>Quick Actions</h3>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => navigate('/services')}>➕ New Service Job</button>
          <button className="btn btn-secondary" onClick={() => navigate('/vehicles')}>🚗 Register Vehicle</button>
          <button className="btn btn-secondary" onClick={() => navigate('/components')}>🔧 Add Component</button>
          <button className="btn btn-secondary" onClick={() => navigate('/revenue')}>📊 View Revenue</button>
        </div>
      </div>

      {/* Recent Services */}
      <div className="chart-card">
        <h3>Recent Service Jobs</h3>
        <p>Last 5 service records</p>
        {recentServices.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No service records yet</h3>
            <p>Create your first service job to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Vehicle</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentServices.map((s) => (
                  <tr key={s.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/services/${s.id}`)}>
                    <td className="td-primary">#{s.id}</td>
                    <td className="td-primary">{s.vehicle_detail?.license_plate}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.description || '—'}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td className="td-primary">{fmt(s.total_amount_due)}</td>
                    <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
