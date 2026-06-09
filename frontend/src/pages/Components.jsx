// src/pages/Components.jsx
import { useState, useEffect } from 'react';
import { getComponents, createComponent, updateComponent, deleteComponent } from '../api/componentApi';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = { name: '', description: '', repair_price: '', new_purchase_price: '', stock_quantity: 0 };

export default function Components({ addToast }) {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    getComponents()
      .then((r) => setComponents(r.data))
      .catch(() => addToast('Failed to load components', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description, repair_price: c.repair_price, new_purchase_price: c.new_purchase_price, stock_quantity: c.stock_quantity }); setModalOpen(true); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await updateComponent(editing.id, form);
        addToast('Component updated!', 'success');
      } else {
        await createComponent(form);
        addToast('Component registered!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      const msg = e.response?.data ? JSON.stringify(e.response.data) : 'Save failed';
      addToast(msg, 'error');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await deleteComponent(deleteTarget.id);
      addToast('Component deleted.', 'success');
      load();
    } catch { addToast('Delete failed.', 'error'); }
  };

  const filtered = components.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Components</h2>
            <p>Manage parts & pricing catalog</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>➕ Register Component</button>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-control"
          style={{ maxWidth: 320 }}
          placeholder="🔍 Search components..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner" style={{ width: 32, height: 32 }}></div><span>Loading...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔧</div>
          <h3>No components found</h3>
          <p>{search ? 'Try a different search term' : 'Register your first component to get started'}</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Repair Price</th>
                <th>New Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="td-primary">{c.name}</td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.description || '—'}
                  </td>
                  <td className="text-primary-color">{fmt(c.repair_price)}</td>
                  <td className="text-success">{fmt(c.new_purchase_price)}</td>
                  <td>
                    <span className={`badge ${c.stock_quantity > 0 ? 'badge-green' : 'badge-red'}`}>
                      {c.stock_quantity} units
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-8">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️ Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(c)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Component' : 'Register New Component'}
      >
        <div className="form-group">
          <label className="form-label">Component Name *</label>
          <input className="form-control" placeholder="e.g. Brake Pad" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={3} placeholder="Optional description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Repair Price (₹) *</label>
            <input className="form-control" type="number" step="0.01" min="0" placeholder="0.00" value={form.repair_price} onChange={(e) => setForm({ ...form, repair_price: e.target.value })} />
            <div className="form-hint">Price to repair existing component</div>
          </div>
          <div className="form-group">
            <label className="form-label">New Purchase Price (₹) *</label>
            <input className="form-control" type="number" step="0.01" min="0" placeholder="0.00" value={form.new_purchase_price} onChange={(e) => setForm({ ...form, new_purchase_price: e.target.value })} />
            <div className="form-hint">Price to buy a new component</div>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Stock Quantity</label>
          <input className="form-control" type="number" min="0" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} />
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
        title="Delete Component"
        message={`Delete "${deleteTarget?.name}"? This may affect existing service records.`}
        danger
      />
    </div>
  );
}
