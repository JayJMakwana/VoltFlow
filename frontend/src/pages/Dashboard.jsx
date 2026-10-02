import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const [myBookings, setMyBookings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const fetchMyBookings = async () => {
    try {
      const response = await API.get('/bookings/my-bookings');
      setMyBookings(response.data.data || []);
    } catch (error) {
      console.error('Failed to load bookings:', error.response?.data || error.message);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const response = await API.get('/bookings/owner-bookings');
      setIncomingRequests(response.data.data || []);
    } catch (error) {
      console.error('Failed to load incoming requests:', error.response?.data || error.message);
    }
  };

  useEffect(() => {
    if (role === 'StationOwner') {
      fetchIncomingRequests();
    } else {
      fetchMyBookings();
    }
  }, [role]);

  const handlePayment = async (paymentID) => {
    try {
      await API.post(`/payments/process/${paymentID}`);
      alert('Payment successful!');
      fetchMyBookings();
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };
const handleCompleteCharging = async (bookingID) => {
  try {
    const response = await API.post(
      `/bookings/complete/${bookingID}`
    );

    alert(
      response.data.message ||
      'Charging completed successfully'
    );

    fetchIncomingRequests();

  } catch (error) {
    console.error(
      'Complete charging error:',
      error.response?.data || error.message
    );

    alert(
      error.response?.data?.message ||
      'Failed to complete charging'
    );
  }
};
  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 20px' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 10px 0' }}>
        {role === 'StationOwner' ? 'Owner Management Dashboard' : 'My EV Dashboard'}
      </h2>
      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '15px 0 25px 0' }} />

      {/* Role 1: Station Owner View */}
      {role === 'StationOwner' ? (
        <div>
          <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>Incoming Booking Requests</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Driver reservations across your charging hubs.</p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

          {incomingRequests.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
              No incoming booking requests for your stations yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {incomingRequests.map((booking) => (
                <div key={booking._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>
                      Station: {booking.stationID?.stationName || 'Charging Hub'}
                    </span>
                    <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', background: booking.paymentID?.paymentStatus === 'Completed' ? '#dcfce7' : '#fef9c3', color: booking.paymentID?.paymentStatus === 'Completed' ? '#166534' : '#854d0e' }}>
                      {booking.paymentID?.paymentStatus ? `Payment: ${booking.paymentID.paymentStatus}` : 'Pending Payment'}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem', color: '#475569', marginBottom: '12px' }}>
                    <p style={{ margin: 0 }}><strong>Driver Name:</strong> {booking.userID?.name || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Email:</strong> {booking.userID?.email || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {booking.bookingDate?.split('T')[0]}</p>
                    <p style={{ margin: 0 }}><strong>Time Slot:</strong> {booking.startTime} - {booking.endTime}</p>
                    <p style={{ margin: 0, gridColumn: 'span 2' }}>
                      <strong>Charger Specs:</strong> {booking.chargerID?.vehicleType || 'Standard'} ({booking.chargerID?.chargingSpeed || 'N/A'}) - ₹{booking.chargerID?.pricePerKwh || 0}/kWh
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>Verification PIN: </strong><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{booking.verificationPIN}</span>
                    </p>
                    {(
                      booking.bookingStatus === 'Confirmed' ||
                      booking.bookingStatus === 'In Progress'
                    ) && (
                      <button
                        onClick={() =>
                          handleCompleteCharging(booking._id)
                        }
                        style={{
                          marginTop: '15px',
                          padding: '10px 18px',
                          background: '#16a34a',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Complete Charging
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Role 2: EV User View */
        <div>
          <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>My Charging Reservations</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>View your slot passes and settle pending payments.</p>
          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

          {myBookings.length === 0 ? (
            <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
              You have no active charging reservations.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myBookings.map((booking) => (
                <div key={booking._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>{booking.stationID?.stationName || 'Charging Station'}</span>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#16a34a' }}>PIN: {booking.verificationPIN}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem', color: '#475569', marginBottom: '15px' }}>
                    <p style={{ margin: 0, gridColumn: 'span 2' }}><strong>Address:</strong> {booking.stationID?.address || 'N/A'}</p>
                    <p style={{ margin: 0 }}><strong>Date:</strong> {booking.bookingDate?.split('T')[0]}</p>
                    <p style={{ margin: 0 }}><strong>Time Slot:</strong> {booking.startTime} - {booking.endTime}</p>
                    <p style={{ margin: 0, gridColumn: 'span 2' }}>
                      <strong>Charger Specs:</strong> {booking.chargerID?.vehicleType || 'Standard'} ({booking.chargerID?.chargingSpeed || 'N/A'}) - ₹{booking.chargerID?.pricePerKwh || 0}/kWh
                    </p>
                  </div>

                  <div
  style={{
    paddingTop: '12px',
    borderTop: '1px dashed #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap'
  }}
>
  <div>
    <span style={{ color: '#475569' }}>
      <strong>Payment:</strong>{' '}
      {booking.paymentID?.paymentStatus || 'Pending'}
    </span>

    <br />

    <span style={{ color: '#475569' }}>
      <strong>Status:</strong>{' '}
      {booking.bookingStatus || 'Pending'}
    </span>
  </div>

  <div
    style={{
      display: 'flex',
      gap: '10px',
      flexWrap: 'wrap'
    }}
  >
    {booking.paymentID?.paymentStatus === 'Pending' && (
      <button
        onClick={() =>
          handlePayment(booking.paymentID._id)
        }
        style={{
          padding: '8px 16px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        Pay Now
      </button>
    )}

   {booking.bookingStatus === 'Completed' && (
  <>
    <button
      onClick={() =>
        navigate(`/bill/${booking._id}`)
      }
      style={{
        padding: '8px 16px',
        background: '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: '600'
      }}
    >
      View Bill
    </button>

      <button
        onClick={() =>
          navigate(
            `/feedback/${booking.stationID?._id}`,
            {
              state: {
                booking: booking
              }
            }
          )
        }
        style={{
          padding: '8px 16px',
          background: '#f59e0b',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: '600'
        }}
      >
        ⭐ Give Feedback
      </button>
    </>
  )}
  </div>
</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}