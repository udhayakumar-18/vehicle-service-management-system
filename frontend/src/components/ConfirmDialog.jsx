// src/components/ConfirmDialog.jsx
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, danger }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Action'}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>{message}</p>
      <div className="modal-footer" style={{ marginTop: 0, paddingTop: 0, border: 'none' }}>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        <button
          className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
          onClick={() => { onConfirm(); onClose(); }}
        >
          Confirm
        </button>
      </div>
    </Modal>
  );
}
