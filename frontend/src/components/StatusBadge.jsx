// src/components/StatusBadge.jsx
export default function StatusBadge({ status }) {
  const map = {
    pending:     { cls: 'badge-yellow', label: 'Pending' },
    in_progress: { cls: 'badge-blue',   label: 'In Progress' },
    completed:   { cls: 'badge-purple', label: 'Completed' },
    paid:        { cls: 'badge-green',  label: 'Paid' },
    cancelled:   { cls: 'badge-red',    label: 'Cancelled' },
    repair:      { cls: 'badge-blue',   label: 'Repair' },
    new:         { cls: 'badge-green',  label: 'New Part' },
  };
  const { cls, label } = map[status] || { cls: 'badge-gray', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
}
