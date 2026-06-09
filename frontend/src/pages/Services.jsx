// src/pages/Services.jsx — Service list + create service
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getServices, createService, deleteService } from '../api/serviceApi';
import { getVehicles } from '../api/vehicleApi';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = { vehicle: '', description: '', labor_charge: '0' };
const STATUS_OPTIONS = ['pending', 'in_progress', 'completed', 'paid', 'cancelled'];

export default function Services({ addToast }) {
  const [services, setServices] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const load = () => {
    setLoading(true);
    Promise.all([getServices(), getVehicles()])
      .then(([svc, veh]) => { setServices(svc.data); setVehicles(veh.data); })
      .catch(() => addToast('Failed to load services', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(() => {
    load();
    // Pre-fill vehicle if navigated from vehicle page
    const vehicleId = searchParams.get('vehicle');
    if (vehicleId) { setForm({ ...EMPTY_FORM, vehicle: vehicleId }); setModalOpen(true); }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const created = await createService(form);
      addToast('Service job created!', 'success');
      setModalOpen(false);
      navigate(`/services/${created.data.id}`);
    } catch (e) {
      addToast(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to create service', 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteService(deleteTarget.id); addToast('Service record deleted.', 'success'); load(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = services.filter(s => {
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    const matchSearch = search === '' || `${s.vehicle_detail?.license_plate} ${s.vehicle_detail?.owner_name}`.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h2>Service Records</h2><p>Track vehicle repairs and service jobs</p></div>
          <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setModalOpen(true); }}>➕ New Service Job</button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input className="form-control" style={{ maxWidth: 240 }} placeholder="🔍 Search by vehicle/owner..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="tabs" style={{ marginBottom: 0 }}>
          <button className={`tab-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
          {STATUS_OPTIONS.map(s => (
            <button key={s} className={`tab-btn ${filterStatus === s ? 'active' : ''}`} onClick={() => setFilterStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }}></div><span>Loading...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No service records found</h3>
          <p>{search || filterStatus !== 'all' ? 'Try adjusting filters' : 'Create your first service job'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Vehicle</th><th>Owner</th><th>Description</th><th>Status</th><th>Issues</th><th>Total</th><th>Paid</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td className="td-primary">#{s.id}</td>
                  <td><span className="badge badge-blue">{s.vehicle_detail?.license_plate}</span></td>
                  <td className="td-primary">{s.vehicle_detail?.owner_name}</td>
                  <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '—'}</td>
                  <td><StatusBadge status={s.status} /></td>
                  <td><span className="badge badge-gray">{s.issue_count}</span></td>
                  <td className="td-primary">{fmt(s.total_amount_due)}</td>
                  <td>{s.is_paid ? <span className="badge badge-green">✓ Paid</span> : <span className="badge badge-yellow">Unpaid</span>}</td>
                  <td>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/services/${s.id}`)}>👁 View</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Service Job">
        <div className="form-group">
          <label className="form-label">Vehicle *</label>
          <select className="form-control" value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })}>
            <option value="">— Select a vehicle —</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.license_plate} — {v.owner_name} ({v.make} {v.model})</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} placeholder="Describe the overall service job..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Labor Charge (₹)</label>
          <input className="form-control" type="number" step="0.01" min="0" value={form.labor_charge} onChange={(e) => setForm({ ...form, labor_charge: e.target.value })} />
          <div className="form-hint">Additional labor cost (added to component prices)</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.vehicle}>
            {saving ? <><span className="spinner"></span> Creating...</> : 'Create & Add Issues →'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service Record"
        message={`Delete service #${deleteTarget?.id} for ${deleteTarget?.vehicle_detail?.license_plate}? All issues will be removed.`}
        danger
      />
    </div>
  );
}
