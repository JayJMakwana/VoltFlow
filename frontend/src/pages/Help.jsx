export default function Help() {
  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px', color: '#1e293b', textAlign: 'left' }}>
      <h2 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '10px' }}>Help & Support</h2>
      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '15px 0 25px 0' }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>How do I book a charging slot?</h4>
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>
            Go to <strong>Find Chargers</strong>, select a station, and click <strong>View Chargers</strong>. Choose your date, pick an available charger and time slot, select your specific seat unit, and confirm your booking.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>What happens after I book?</h4>
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>
            You will receive a unique verification PIN. Head to your <strong>Dashboard</strong> to settle any pending payments, view your active pass, and check your cancellation cutoff window.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>How do Station Owners complete a session?</h4>
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>
            Owners can log into their <strong>Owner Portal</strong>, select their station, verify the driver's PIN, and click <strong>Complete Charging</strong> to automatically finalize billing.
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>Need further assistance?</h4>
          <p style={{ margin: 0, color: '#475569', lineHeight: '1.5' }}>
            Reach out to our system admin support team at <strong>support@voltflow.com</strong> or call our 24/7 EV helpline.
          </p>
        </div>
      </div>
    </div>
  );
}