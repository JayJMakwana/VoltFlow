import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '3rem', color: '#1e293b', marginBottom: '10px' }}>Welcome to VoltFlow</h1>
      <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '600px', margin: '0 auto 30px auto' }}>
        The smart platform to discover EV charging stations, reserve slots in advance, and manage your vehicle power effortlessly.
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <Link to="/stations" style={{ padding: '12px 24px', background: '#3b82f6', color: 'white', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Find Chargers
        </Link>
        <Link to="/register" style={{ padding: '12px 24px', background: '#4ade80', color: '#1e293b', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Get Started
        </Link>
      </div>
    </div>
  );
}