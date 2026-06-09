// src/pages/ServiceDetail.jsx
// Full service job detail: shows issues, allows adding/removing, payment simulation
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getService, updateService,
  addServiceIssue, deleteServiceIssue,
  simulatePayment
} from '../api/serviceApi';
import { getComponents } from '../api/componentApi';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_ISSUE = { description: '', component: '', action_type: 'repair', notes: '' };

export default function ServiceDetail({ addToast }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [issueModal, setIssueModal] = useState(false);
  const [payModal, setPayModal] = useState(false);
  const [issueForm, setIssueForm] = useState(EMPTY_ISSUE);
  const [payMethod, setPayMethod] = useState('cash');
  const [saving, setSaving] = useState(false);
  const [deleteIssueTarget, setDeleteIssueTarget] = useState(null);
  const [statusEditing, setStatusEditing] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const load = useCallback(() => {
    Promise.all([getService(id), getComponents()])
      .then(([svc, comp]) => { setRecord(svc.data); setComponents(comp.data); setNewStatus(svc.data.status); })
      .catch(() => { addToast('Service record not found', 'error'); navigate('/services'); })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(load, [load]);

  // Price preview
  const selectedComp = components.find(c => String(c.id) === String(issueForm.component));
  const previewPrice = selectedComp
    ? (issueForm.action_type === 'repair' ? selectedComp.repair_price : selectedComp.new_purchase_price)
    : null;

  const handleAddIssue = async () => {
    setSaving(true);
    try {
      const res = await addServiceIssue(id, issueForm);
      setRecord(res.data);
      setIssueModal(false);
      setIssueForm(EMPTY_ISSUE);
      addToast('Issue added!', 'success');
    } catch (e) {
      addToast(e.response?.data ? JSON.stringify(e.response.data) : 'Failed to add issue', 'error');
    } finally { setSaving(false); }
  };

  const handleDeleteIssue = async () => {
    try { await deleteServiceIssue(deleteIssueTarget.id); load(); addToast('Issue removed.', 'success'); }
    catch { addToast('Failed to remove issue.', 'error'); }
  };

  const handleStatusUpdate = async () => {
    try {
      await updateService(id, { status: newStatus });
      load(); setStatusEditing(false);
      addToast('Status updated!', 'success');
    } catch { addToast('Status update failed.', 'error'); }
  };

  const handlePayment = async () => {
    setSaving(true);
    try {
      await simulatePayment(id, { payment_method: payMethod });
      load(); setPayModal(false);
      addToast('Payment processed successfully! 🎉', 'success');
    } catch (e) {
      addToast(e.response?.data?.error || 'Payment failed.', 'error');
    } finally { setSaving(false); }
  };

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  if (loading) return <div className="loading-screen"><div className="spinner" style={{ width: 36, height: 36 }}></div><span>Loading service record...</span></div>;
  if (!record) return null;

  const vehicle = record.vehicle_detail;
  const issues = record.issues || [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/services')} style={{ marginBottom: 8 }}>← Back to Services</button>
            <h2>Service #{record.id}</h2>
            <p>{vehicle?.license_plate} — {vehicle?.owner_name}</p>
          </div>
          <div className="flex gap-8">
            {!record.is_paid && (
              <button className="btn btn-success" onClick={() => setPayModal(true)}>💳 Process Payment</button>
            )}
            <button className="btn btn-primary" onClick={() => { setIssueForm(EMPTY_ISSUE); setIssueModal(true); }} disabled={record.is_paid}>
              ➕ Add Issue
            </button>
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="card">
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Vehicle</div>
          <div className="td-primary" style={{ fontWeight: 700, fontSize: '1rem' }}>{vehicle?.full_name}</div>
          <span className="badge badge-blue" style={{ marginTop: 6 }}>{vehicle?.license_plate}</span>
        </div>
        <div className="card">
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Owner</div>
          <div className="td-primary" style={{ fontWeight: 700 }}>{vehicle?.owner_name}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <StatusBadge status={record.status} />
            {!record.is_paid && (
              statusEditing ? (
                <div className="flex gap-8">
                  <select className="form-control" style={{ padding: '4px 8px', fontSize: '0.8rem' }} value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    {['pending','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn btn-primary btn-sm" onClick={handleStatusUpdate}>✓</button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setStatusEditing(false)}>✕</button>
                </div>
              ) : (
                <button className="btn btn-secondary btn-sm" onClick={() => setStatusEditing(true)}>✏️</button>
              )
            )}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Created</div>
          <div className="td-primary" style={{ fontWeight: 600 }}>{new Date(record.created_at).toLocaleDateString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Labor Charge</div>
          <div className="td-primary" style={{ fontWeight: 700, fontSize: '1.1rem' }}>{fmt(record.labor_charge)}</div>
        </div>
        <div className="card" style={{ border: '1px solid var(--border-accent)', background: 'rgba(59,130,246,0.05)' }}>
          <div className="text-sm text-muted" style={{ marginBottom: 4 }}>Total Amount Due</div>
          <div style={{ fontWeight: 800, fontSize: '1.5rem', color: record.is_paid ? 'var(--accent-emerald)' : 'var(--accent-primary)' }}>
            {fmt(record.total_amount_due)}
          </div>
          {record.is_paid && <div className="badge badge-green" style={{ marginTop: 6, display: 'inline-flex' }}>✓ PAID via {record.payment_method || 'N/A'}</div>}
        </div>
      </div>

      {/* Description */}
      {record.description && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="text-sm text-muted" style={{ marginBottom: 6 }}>Job Description</div>
          <p style={{ color: 'var(--text-secondary)' }}>{record.description}</p>
        </div>
      )}

      {/* Issues Table */}
      <div className="chart-card">
        <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
          <div>
            <h3>Service Issues</h3>
            <p>{issues.length} issue{issues.length !== 1 ? 's' : ''} logged</p>
          </div>
          {!record.is_paid && (
            <button className="btn btn-primary btn-sm" onClick={() => { setIssueForm(EMPTY_ISSUE); setIssueModal(true); }}>➕ Add Issue</button>
          )}
        </div>

        {issues.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px 24px' }}>
            <div className="empty-icon">🔩</div>
            <h3>No issues added yet</h3>
            <p>Add issues to track what needs to be repaired or replaced</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Description</th><th>Component</th><th>Action</th><th>Price</th><th>Notes</th>{!record.is_paid && <th>Remove</th>}</tr>
              </thead>
              <tbody>
                {issues.map((issue, i) => (
                  <tr key={issue.id}>
                    <td>{i + 1}</td>
                    <td className="td-primary">{issue.description}</td>
                    <td>{issue.component_detail?.name || '—'}</td>
                    <td><StatusBadge status={issue.action_type} /></td>
                    <td className="td-primary">{fmt(issue.calculated_price)}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.notes || '—'}</td>
                    {!record.is_paid && (
                      <td><button className="btn btn-danger btn-sm" onClick={() => setDeleteIssueTarget(issue)}>🗑</button></td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Price breakdown */}
        {issues.length > 0 && (
          <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex justify-between" style={{ marginBottom: 8, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Components subtotal</span>
              <span>{fmt(issues.reduce((s, i) => s + Number(i.calculated_price), 0))}</span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: 12, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <span>Labor charge</span>
              <span>{fmt(record.labor_charge)}</span>
            </div>
            <div className="flex justify-between" style={{ fontWeight: 800, fontSize: '1.1rem', paddingTop: 12, borderTop: '1px solid var(--border-default)' }}>
              <span>Total Amount Due</span>
              <span style={{ color: 'var(--accent-primary)' }}>{fmt(record.total_amount_due)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      <Modal isOpen={issueModal} onClose={() => setIssueModal(false)} title="Add Service Issue">
        <div className="form-group">
          <label className="form-label">Issue Description *</label>
          <input className="form-control" placeholder="e.g. Worn front brake pads" value={issueForm.description} onChange={e => setIssueForm({ ...issueForm, description: e.target.value })} />
        </div>
        <div className="form-group">
          <label className="form-label">Component</label>
          <select className="form-control" value={issueForm.component} onChange={e => setIssueForm({ ...issueForm, component: e.target.value })}>
            <option value="">— Select component (optional) —</option>
            {components.map(c => <option key={c.id} value={c.id}>{c.name} (Repair: {fmt(c.repair_price)} / New: {fmt(c.new_purchase_price)})</option>)}
          </select>
        </div>
        {issueForm.component && (
          <div className="form-group">
            <label className="form-label">Action Type</label>
            <div className="flex gap-12" style={{ marginTop: 8 }}>
              {['repair', 'new'].map(a => (
                <label key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <input type="radio" name="action_type" value={a} checked={issueForm.action_type === a} onChange={() => setIssueForm({ ...issueForm, action_type: a })} />
                  {a === 'repair' ? '🔧 Repair Existing' : '✨ Purchase New'}
                  {selectedComp && <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>({fmt(a === 'repair' ? selectedComp.repair_price : selectedComp.new_purchase_price)})</span>}
                </label>
              ))}
            </div>
            {previewPrice !== null && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', color: 'var(--accent-emerald)', fontWeight: 700 }}>
                💰 Price for this issue: {fmt(previewPrice)}
              </div>
            )}
          </div>
        )}
        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea className="form-control" rows={2} placeholder="Any additional notes..." value={issueForm.notes} onChange={e => setIssueForm({ ...issueForm, notes: e.target.value })} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setIssueModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddIssue} disabled={saving || !issueForm.description}>
            {saving ? <><span className="spinner"></span> Adding...</> : 'Add Issue'}
          </button>
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={payModal} onClose={() => setPayModal(false)} title="💳 Process Payment">
        <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: 20, textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>TOTAL AMOUNT DUE</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>{fmt(record.total_amount_due)}</div>
        </div>
        <div className="form-group">
          <label className="form-label">Payment Method</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 8 }}>
            {[['cash', '💵', 'Cash'], ['card', '💳', 'Card'], ['bank_transfer', '🏦', 'Bank Transfer']].map(([val, icon, label]) => (
              <label key={val} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '14px 8px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                border: `2px solid ${payMethod === val ? 'var(--accent-primary)' : 'var(--border-default)'}`,
                background: payMethod === val ? 'rgba(59,130,246,0.1)' : 'var(--bg-elevated)',
                transition: 'all var(--transition)', fontSize: '0.82rem', color: 'var(--text-secondary)'
              }}>
                <input type="radio" name="pay_method" value={val} checked={payMethod === val} onChange={() => setPayMethod(val)} style={{ display: 'none' }} />
                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                <span style={{ fontWeight: 600, color: payMethod === val ? 'var(--accent-primary)' : undefined }}>{label}</span>
              </label>
            ))}
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 8, fontSize: '0.85rem', color: 'var(--accent-emerald)' }}>
          ✅ This is a simulated payment. No real transaction will be processed.
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setPayModal(false)}>Cancel</button>
          <button className="btn btn-success" onClick={handlePayment} disabled={saving}>
            {saving ? <><span className="spinner"></span> Processing...</> : `✓ Confirm Payment of ${fmt(record.total_amount_due)}`}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteIssueTarget}
        onClose={() => setDeleteIssueTarget(null)}
        onConfirm={handleDeleteIssue}
        title="Remove Issue"
        message={`Remove issue "${deleteIssueTarget?.description}"? The total will be recalculated.`}
        danger
      />
    </div>
  );
}
