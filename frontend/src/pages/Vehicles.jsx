// src/pages/Vehicles.jsx
import { useState, useEffect } from 'react';
import { getVehicles, createVehicle, updateVehicle, deleteVehicle } from '../api/vehicleApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { useNavigate } from 'react-router-dom';

const EMPTY_FORM = { license_plate: '', make: '', model: '', year: '', owner_name: '', owner_phone: '', owner_email: '' };

export default function Vehicles({ addToast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getVehicles()
      .then((r) => setVehicles(r.data))
      .catch(() => addToast('Failed to load vehicles', 'error'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (v) => {
    setEditing(v);
    setForm({ license_plate: v.license_plate, make: v.make, model: v.model, year: v.year || '', owner_name: v.owner_name, owner_phone: v.owner_phone || '', owner_email: v.owner_email || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) { await updateVehicle(editing.id, form); addToast('Vehicle updated!', 'success'); }
      else { await createVehicle(form); addToast('Vehicle registered!', 'success'); }
      setModalOpen(false); load();
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : 'Save failed';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try { await deleteVehicle(deleteTarget.id); addToast('Vehicle removed.', 'success'); load(); }
    catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = vehicles.filter(v =>
    `${v.license_plate} ${v.make} ${v.model} ${v.owner_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div><h2>Vehicles</h2><p>Register and manage customer vehicles</p></div>
          <button className="btn btn-primary" onClick={openCreate}>🚗 Register Vehicle</button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input className="form-control" style={{ maxWidth: 320 }} placeholder="🔍 Search vehicles..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }}></div><span>Loading...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No vehicles found</h3>
          <p>{search ? 'Try a different search' : 'Register your first vehicle'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>License Plate</th><th>Vehicle</th><th>Year</th><th>Owner</th><th>Phone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((v) => (
                <tr key={v.id}>
                  <td><span className="badge badge-blue">{v.license_plate}</span></td>
                  <td className="td-primary">{v.make} {v.model}</td>
                  <td>{v.year || '—'}</td>
                  <td className="td-primary">{v.owner_name}</td>
                  <td>{v.owner_phone || '—'}</td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/services?vehicle=${v.id}`)}>📋 Services</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>✏️</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(v)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Register New Vehicle'}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">License Plate *</label>
            <input className="form-control" placeholder="e.g. TN-01-AB-1234" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Year</label>
            <input className="form-control" type="number" placeholder="e.g. 2022" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Make *</label>
            <input className="form-control" placeholder="e.g. Toyota" value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Model *</label>
            <input className="form-control" placeholder="e.g. Camry" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Owner Name *</label>
          <input className="form-control" placeholder="Full name" value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input className="form-control" placeholder="+91 98765 43210" value={form.owner_phone} onChange={(e) => setForm({ ...form, owner_phone: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-control" type="email" placeholder="owner@email.com" value={form.owner_email} onChange={(e) => setForm({ ...form, owner_email: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? <><span className="spinner"></span> Saving...</> : (editing ? 'Update' : 'Register')}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Vehicle"
        message={`Remove "${deleteTarget?.license_plate} — ${deleteTarget?.owner_name}"? All related service records will also be deleted.`}
        danger
      />
    </div>
  );
}
