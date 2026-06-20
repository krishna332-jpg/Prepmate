import { useApp } from '../hooks/useAppContext';
import { NAV_ITEMS } from '../utils/constants';
import '../styles/Sidebar.css';

export default function Sidebar() {
  const { screen, setScreen, user, sidebarOpen, setSidebarOpen, logout } = useApp();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay show-mobile-only" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-mark">
            <span>P</span>
          </div>
          <span className="logo-text">Prep<em>Mate</em></span>
        </div>

        <div className="sidebar-divider" />

        {/* Nav */}
        <nav className="sidebar-nav">
          <p className="sidebar-section-label">Main Menu</p>
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              className={`nav-item ${screen === item.id ? 'active' : ''} animate-slideLeft delay-${i + 1}`}
              onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {screen === item.id && <span className="nav-active-dot" />}
            </button>
          ))}
        </nav>

        <div style={{ flex: 1 }} />

        {/* User card */}
        <div className="sidebar-user" onClick={() => setScreen('profile')}>
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          <div className="user-info">
            <div className="user-name">{user?.name || 'User'}</div>
            <div className="user-sub">{user?.college || 'CS Student'}</div>
          </div>
          <button className="user-edit-btn" title="Edit Profile">⋮</button>
        </div>
      </aside>
    </>
  );
}
