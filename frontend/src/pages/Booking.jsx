import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API from '../api/axios';

export default function Booking() {
  const { id } = useParams(); 
  const location = useLocation();
  
  const [chargers, setChargers] = useState([]);
  
  // Grab the filter passed from the Stations page, default to 'All'
  const [filterType, setFilterType] = useState(location.state?.defaultFilter || 'All');
  
  const [bookingDate, setBookingDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const response = await API.get(`/chargers/station/${id}`); 
        setChargers(response.data.data || []);
      } catch (error) {
        console.error('Failed to load chargers');
      }
    };
    fetchChargers();
  }, [id]);

  const handleBookSlot = async (chargerID) => {
    if (!bookingDate || !startTime || !endTime) {
      alert('Please select a date, start time, and end time first.');
      return;
    }

    try {
      const response = await API.post('/bookings', {
        stationID: id,
        chargerID,
        bookingDate,
        startTime,
        endTime
      });
      alert(response.data.message);
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  // Filter the individual chargers based on the selection
  const filteredChargers = chargers.filter(charger => {
    if (filterType === 'All') return true;
    // Use vehicleType instead of type
    return charger.vehicleType?.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h2>Available Chargers</h2>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ padding: '8px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
      </div>

      {/* Internal Charger Filter Bar */}
      

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {/* Adjusted '4-Wheeler' to match DB document screenshot */}
        {['All', 'Two-Wheeler', 'Three-Wheeler', '4-Wheeler'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '6px 14px',
              borderRadius: '15px',
              border: '1px solid #cbd5e1',
              background: filterType === type ? '#2563eb' : '#ffffff',
              color: filterType === type ? '#ffffff' : '#334155',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {filteredChargers.length === 0 ? (
          <p style={{ color: '#64748b' }}>No chargers available for this vehicle type.</p>
        ) : (
          filteredChargers.map(charger => (
            <div key={charger._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc' }}>
              {/* Use the correct Mongoose schema keys here */}
              <p style={{ margin: '0 0 5px 0' }}><strong>Type:</strong> {charger.vehicleType}</p>
              <p style={{ margin: '0 0 15px 0' }}><strong>Speed:</strong> {charger.chargingSpeed}</p>
              
              <button 
                onClick={() => handleBookSlot(charger._id)}
                style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Book Slot
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}