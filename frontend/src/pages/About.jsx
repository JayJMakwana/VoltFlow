export default function About() {
  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px', color: '#1e293b', textAlign: 'left' }}>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>About VoltFlow</h2>
      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '15px 0 25px 0' }} />
      
      <p style={{ fontSize: '1.05rem', lineHeight: '1.6', color: '#475569' }}>
        <strong>VoltFlow</strong> is a next-generation electric vehicle (EV) charging station finder and slot reservation platform designed to accelerate green mobility. Whether you're an EV driver looking for a fast-charging hub on the go or a station owner managing multiple charging docks, VoltFlow connects infrastructure with convenience.
      </p>

      <h3 style={{ marginTop: '30px', color: '#0f172a' }}>Key Features for Drivers</h3>
      <ul style={{ lineHeight: '1.8', color: '#475569' }}>
        <li><strong>Find Nearby Chargers:</strong> Locate charging stations around you with real-time distance calculations and live route directions.</li>
        <li><strong>Instant Slot Booking:</strong> Filter chargers by vehicle type (Two-Wheeler, Three-Wheeler, Four-Wheeler) and reserve specific unit seats.</li>
        <li><strong>Seamless Payments & Billing:</strong> Pay securely for your charging sessions and view detailed invoices instantly.</li>
        <li><strong>Ratings & Reviews:</strong> Share your charging experience and check community reviews before booking a station.</li>
      </ul>

      <h3 style={{ marginTop: '30px', color: '#0f172a' }}>Key Features for Station Owners</h3>
      <ul style={{ lineHeight: '1.8', color: '#475569' }}>
        <li><strong>Hub Deployment:</strong> Easily add and manage multiple charging stations with custom coordinates.</li>
        <li><strong>Unit Control:</strong> Add, edit, or remove individual charging stalls and configure pricing per kWh.</li>
        <li><strong>Booking Management:</strong> Track incoming reservations seat-by-seat and complete sessions upon driver verification PIN check.</li>
      </ul>
    </div>
  );
}