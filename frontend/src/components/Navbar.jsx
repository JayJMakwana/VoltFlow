import { Link } from 'react-router-dom';

export default function Navbar() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  };

  return (
    <nav
      style={{
        padding: '1rem',
        background: '#1e293b',
        color: 'white',
        display: 'flex',
        gap: '20px',
        alignItems: 'center'
      }}
    >
      <Link
        to="/"
        style={{
          color: '#4ade80',
          fontWeight: 'bold',
          textDecoration: 'none',
          fontSize: '1.2rem'
        }}
      >
        VoltFlow
      </Link>

      {role !== 'StationOwner' && role !== 'Admin' && (
        <Link
          to="/stations"
          style={{ color: 'white', textDecoration: 'none' }}
        >
          Find Chargers
        </Link>
      )}

      {token ? (
        <>
          {/* EV User Dashboard */}
          {role !== 'Admin' && (
            <Link
              to="/dashboard"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              My Dashboard
            </Link>
          )}

          {/* Owner Portal */}
          {role === 'StationOwner' && (
            <Link
              to="/owner-dashboard"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Owner Portal
            </Link>
          )}

          {/* Admin Dashboard */}
          {role === 'Admin' && (
            <Link
              to="/admin-dashboard"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Admin Dashboard
            </Link>
          )}

          <button
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            style={{
              color: 'white',
              textDecoration: 'none',
              marginLeft: 'auto'
            }}
          >
            Login
          </Link>

          <Link
            to="/register"
            style={{
              color: 'white',
              textDecoration: 'none'
            }}
          >
            Register
          </Link>
        </>
      )}
    </nav>
  );
}