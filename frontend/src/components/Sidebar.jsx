// src/components/Sidebar.jsx
import { NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: '📊', label: 'Dashboard' },
  { path: '/components', icon: '🔧', label: 'Components' },
  { path: '/vehicles', icon: '🚗', label: 'Vehicles' },
  { path: '/services', icon: '📋', label: 'Services' },
  { path: '/revenue', icon: '💰', label: 'Revenue' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🔩</div>
        <h1>VehicleServ</h1>
        <span>Management System</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {navItems.map((item) => {
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div>Vehicle Service MS</div>
        <div style={{ color: 'var(--accent-primary)', marginTop: 2 }}>v1.0.0</div>
      </div>
    </aside>
  );
}
