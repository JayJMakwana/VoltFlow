import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Dashboard() {
  const [myBookings, setMyBookings] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [ownerStations, setOwnerStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null); // Tracks the currently clicked station
  
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const fetchMyBookings = async () => {
    try {
      const response = await API.get('/bookings/my-bookings');
      setMyBookings(response.data.data || []);
    } catch (error) { console.error('Failed to load bookings'); }
  };

  const fetchIncomingRequests = async () => {
    try {
      // Fetch bookings
      const bookingRes = await API.get('/bookings/owner-bookings');
      setIncomingRequests(bookingRes.data.data || []);

      // Fetch owner's stations
      const stationRes = await API.get('/stations/my-stations');
      setOwnerStations(stationRes.data.data || []);
    } catch (error) { console.error('Failed to load owner data'); }
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
    } catch (error) { alert('Payment failed'); }
  };

  const handleCompleteCharging = async (bookingID) => {
    try {
      await API.post(`/bookings/complete/${bookingID}`);
      alert('Charging completed successfully');
      fetchIncomingRequests();
    } catch (error) { alert('Failed to complete charging'); }
  };

  const handleCancelBooking = async (bookingID) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await API.put(`/bookings/cancel/${bookingID}`);
      alert('Booking cancelled successfully.');
      fetchMyBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const getCancellationInfo = (booking) => {
    if (booking.bookingStatus !== 'Pending' && booking.bookingStatus !== 'Confirmed') return { canCancel: false };
    
    const duration = booking.chargerID?.chargingDuration;
    if (!duration) return { canCancel: false };

    const [hours, mins] = booking.startTime.split(':').map(Number);
    const startObj = new Date(`${booking.bookingDate}T00:00:00`);
    startObj.setHours(hours);
    startObj.setMinutes(mins);

    const cutoffObj = new Date(startObj.getTime() - (2 * duration * 60000));
    const now = new Date();

    const formattedCutoff = `${cutoffObj.toLocaleDateString()} at ${cutoffObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

    return {
      canCancel: now < cutoffObj,
      cutoffText: formattedCutoff
    };
  };

  // Filter bookings for the selected station
  const stationBookings = selectedStation 
    ? incomingRequests.filter(b => b.stationID?._id === selectedStation._id)
    : [];

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 20px' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 10px 0' }}>
        {role === 'StationOwner' ? 'Owner Management Dashboard' : 'My EV Dashboard'}
      </h2>
      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '15px 0 25px 0' }} />

      {/* Role 1: Station Owner View */}
      {role === 'StationOwner' ? (
        <div>
          {!selectedStation ? (
            /* STATION LIST VIEW */
            <div>
              <h3 style={{ color: '#1e293b', marginBottom: '8px' }}>My Stations</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Select a station to view its incoming booking requests.</p>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

              {ownerStations.length === 0 ? (
                <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                  No charging stations deployed yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {ownerStations.map((station) => {
                    // Count how many bookings belong to this station
                    const count = incomingRequests.filter(b => b.stationID?._id === station._id).length;

                    return (
                      <div 
                        key={station._id} 
                        onClick={() => setSelectedStation(station)}
                        style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'all 0.2s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', fontSize: '1.2rem' }}>{station.stationName}</h4>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{station.address}</p>
                          </div>
                          <span style={{ padding: '6px 12px', background: '#eff6ff', color: '#2563eb', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {count} Booking{count === 1 ? '' : 's'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STATION BOOKINGS DETAIL VIEW */
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                <button 
                  onClick={() => setSelectedStation(null)}
                  style={{ padding: '6px 12px', background: '#64748b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}
                >
                  ← Back to Stations
                </button>
                <h3 style={{ color: '#1e293b', margin: 0 }}>Bookings for: {selectedStation.stationName}</h3>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>{selectedStation.address}</p>
              <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

              {stationBookings.length === 0 ? (
                <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
                  No incoming booking requests for this station yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {stationBookings.map((booking) => (
                    <div key={booking._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>
                          Driver: {booking.userID?.name || 'N/A'}
                        </span>
                        <span style={{ padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '600', background: booking.paymentID?.paymentStatus === 'Completed' ? '#dcfce7' : '#fef9c3', color: booking.paymentID?.paymentStatus === 'Completed' ? '#166534' : '#854d0e' }}>
                          {booking.paymentID?.paymentStatus ? `Payment: ${booking.paymentID.paymentStatus}` : 'Pending Payment'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem', color: '#475569', marginBottom: '12px' }}>
                        <p style={{ margin: 0 }}><strong>Email:</strong> {booking.userID?.email || 'N/A'}</p>
                        <p style={{ margin: 0 }}><strong>Date:</strong> {booking.bookingDate?.split('T')[0]}</p>
                        <p style={{ margin: 0 }}><strong>Time Slot:</strong> {booking.startTime} - {booking.endTime}</p>
                        <p style={{ margin: 0 }}><strong>Charger Unit:</strong> Seat {booking.chargerUnit}</p>
                        <p style={{ margin: 0 }}><strong>PIN: </strong><span style={{ color: '#16a34a', fontWeight: 'bold' }}>{booking.verificationPIN}</span></p>
                        <p style={{ margin: 0, gridColumn: 'span 2' }}>
                          <strong>Charger Specs:</strong> {booking.chargerID?.vehicleType || 'Standard'} ({booking.chargerID?.chargingSpeed || 'N/A'}) - ₹{booking.chargerID?.pricePerKwh || 0}/kWh
                        </p>
                        
                        {(booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'In Progress') && (
                          <button onClick={() => handleCompleteCharging(booking._id)} style={{ gridColumn: 'span 2', marginTop: '10px', padding: '10px 18px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                            Complete Charging
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
              {myBookings.map((booking) => {
                const cancelInfo = getCancellationInfo(booking);
                
                return (
                  <div key={booking._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '1.1rem' }}>{booking.stationID?.stationName || 'Charging Station'}</span>
                      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#16a34a' }}>PIN: {booking.verificationPIN}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.95rem', color: '#475569', marginBottom: '15px' }}>
                      <p style={{ margin: 0, gridColumn: 'span 2' }}><strong>Address:</strong> {booking.stationID?.address || 'N/A'}</p>
                      <p style={{ margin: 0 }}><strong>Date:</strong> {booking.bookingDate?.split('T')[0]}</p>
                      <p style={{ margin: 0 }}><strong>Time Slot:</strong> {booking.startTime} - {booking.endTime}</p>
                      <p style={{ margin: 0 }}><strong>Charger Unit:</strong> Seat {booking.chargerUnit}</p>
                      <p style={{ margin: 0 }}><strong>Duration:</strong> {booking.chargerID?.chargingDuration} mins</p>
                    </div>

                    <div style={{ paddingTop: '12px', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ color: '#475569', display: 'block', marginBottom: '5px' }}>
                          <strong>Payment:</strong> {booking.paymentID?.paymentStatus || 'Pending'}
                        </span>
                        <span style={{ color: '#475569', display: 'block' }}>
                          <strong>Status:</strong> <span style={{ color: booking.bookingStatus === 'Cancelled' ? '#dc2626' : 'inherit' }}>{booking.bookingStatus || 'Pending'}</span>
                        </span>
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                        {booking.paymentID?.paymentStatus === 'Pending' && booking.bookingStatus !== 'Cancelled' && (
                          <button onClick={() => handlePayment(booking.paymentID._id)} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>
                            Pay Now
                          </button>
                        )}
                        
                        {cancelInfo.canCancel && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                            <button onClick={() => handleCancelBooking(booking._id)} style={{ padding: '8px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>
                              Cancel Booking
                            </button>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Cancel strictly before {cancelInfo.cutoffText}</span>
                          </div>
                        )}

                        {booking.bookingStatus === 'Completed' && (
                          <>
                            <button onClick={() => navigate(`/bill/${booking._id}`)} style={{ padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>View Bill</button>
                            <button onClick={() => navigate(`/feedback/${booking.stationID?._id}`, { state: { booking: booking } })} style={{ padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: '600' }}>⭐ Give Feedback</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}