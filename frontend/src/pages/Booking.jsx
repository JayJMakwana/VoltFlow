import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../api/axios';

export default function Booking() {
  const { id } = useParams(); 
  const [chargers, setChargers] = useState([]);
  
  // State for the reservation time
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const response = await API.get(`/chargers/station/${id}`);
        setChargers(response.data.data);
      } catch (error) {
        console.error('Failed to load chargers');
      }
    };
    fetchChargers();
  }, [id]);

  const handleBookSlot = async (chargerID) => {
    if (!bookingDate || !startTime || !endTime) {
      return alert("Please select a date and time first.");
    }

    try {
      const response = await API.post('/bookings', {
        stationID: id,
        chargerID: chargerID,
        bookingDate: bookingDate,
        startTime: startTime,
        endTime: endTime
      });
      
      const pin = response.data.data.booking.verificationPIN;
      alert(`Booking successful! Your verification PIN is: ${pin}. Proceed to payment.`);
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '600px' }}>
      <h2>Available Chargers</h2>
      
      {/* Time Selection Inputs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ padding: '8px' }} />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '8px' }} />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '8px' }} />
      </div>

      {chargers.map(charger => (
        <div key={charger._id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '10px' }}>
          <p><strong>Type:</strong> {charger.vehicleType}</p>
          <p><strong>Speed:</strong> {charger.chargingSpeed}</p>
          
          {/* Trigger the Axios call with this specific charger's ID */}
          <button 
            onClick={() => handleBookSlot(charger._id)} 
            style={{ padding: '8px', background: '#4ade80', cursor: 'pointer', border: 'none' }}>
            Book Slot
          </button>
        </div>
      ))}
    </div>
  );
}