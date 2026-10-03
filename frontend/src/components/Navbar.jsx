import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  const getLinkStyle = (path) => {
    const isActive = location.pathname === path;
    return {
      color: isActive ? '#ffffff' : '#cbd5e1',
      textDecoration: 'none',
      fontWeight: isActive ? 'bold' : 'normal',
      padding: '8px 14px',
      borderRadius: '6px',
      background: isActive ? '#16a34a' : 'transparent',
      transition: 'all 0.2s ease'
    };
  };

  return (
    <nav
      style={{
        padding: '1rem 2rem',
        background: '#1e293b',
        color: 'white',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}
    >
      <Link
        to="/"
        style={{
          color: '#4ade80',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.5rem',
          marginRight: '10px'
        }}
      >
        VoltFlow
      </Link>

      <Link to="/" style={getLinkStyle('/')}>
        Home
      </Link>

      {role !== 'StationOwner' && role !== 'Admin' && (
        <Link to="/stations" style={getLinkStyle('/stations')}>
          Find Chargers
        </Link>
      )}

      {/* Dashboard placed early in the navbar */}
      {token && (
        <>
          {role !== 'Admin' && role !== 'StationOwner' && (
            <Link to="/dashboard" style={getLinkStyle('/dashboard')}>
              My Dashboard
            </Link>
          )}

          {role === 'StationOwner' && (
            <Link to="/owner-dashboard" style={getLinkStyle('/owner-dashboard')}>
              Owner Portal
            </Link>
          )}

          {role === 'Admin' && (
            <Link to="/admin-dashboard" style={getLinkStyle('/admin-dashboard')}>
              Admin Dashboard
            </Link>
          )}
        </>
      )}

      {/* About and Help placed at the end before auth buttons */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginLeft: token ? '0' : 'auto' }}>
        <Link to="/about" style={getLinkStyle('/about')}>
          About
        </Link>
        <Link to="/help" style={getLinkStyle('/help')}>
          Help
        </Link>
      </div>

      {token ? (
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 14px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            marginLeft: 'auto'
          }}
        >
          Logout
        </button>
      ) : (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/login" style={getLinkStyle('/login')}>
            Login
          </Link>

          <Link
            to="/register"
            style={{
              padding: '8px 14px',
              background: '#2563eb',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontWeight: '600'
            }}
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}