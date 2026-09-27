import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const response = await API.get('/bookings/my-bookings');
      setBookings(response.data.data);
    } catch (error) {
      console.error('Failed to load bookings');
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handlePayment = async (paymentID) => {
    try {
      await API.post(`/payments/process/${paymentID}`);
      alert('Payment successful!');
      fetchBookings(); // Instantly refresh the screen to show the updated status
    } catch (error) {
      alert('Payment failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '20px auto' }}>
      <h2 style={{ marginBottom: '20px' }}>My EV Dashboard</h2>
      
      {bookings.length === 0 ? (
        <p>You have no active bookings.</p>
      ) : (
        bookings.map(booking => (
          <div key={booking._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '8px' }}>
            <p><strong>Date:</strong> {booking.bookingDate.split('T')[0]}</p>
            <p><strong>Time:</strong> {booking.startTime} - {booking.endTime}</p>
            <p><strong>Verification PIN:</strong> <span style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#16a34a' }}>{booking.verificationPIN}</span></p>
            
            {/* Payment Section */}
            <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ margin: 0 }}><strong>Status:</strong> {booking.paymentID?.paymentStatus || 'Pending'}</p>
              
              {booking.paymentID?.paymentStatus === 'Pending' && (
                <button 
                  onClick={() => handlePayment(booking.paymentID._id)}
                  style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}