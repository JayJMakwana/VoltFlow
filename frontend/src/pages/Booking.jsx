import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [chargers, setChargers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [filterType, setFilterType] = useState(location.state?.defaultFilter || 'All');
  const [bookingDate, setBookingDate] = useState('');
  const [selectedCharger, setSelectedCharger] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(''); // Seat Selection

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  const getTodayDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  const isSlotInPast = (slot) => {
    if (!bookingDate || !slot?.startTime) return false;
    const today = getTodayDate();
    if (bookingDate > today) return false;
    if (bookingDate < today) return true;

    const [hours, minutes] = slot.startTime.split(':').map(Number);
    const slotMinutes = hours * 60 + minutes;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return slotMinutes <= currentMinutes;
  };

  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const response = await API.get(`/chargers/station/${id}`);
        setChargers(response.data.data || []);
      } catch (error) { alert('Failed to load chargers'); }
    };
    fetchChargers();
  }, [id]);

  useEffect(() => {
    if (!bookingDate || !selectedCharger) {
      setSlots([]); setSelectedSlot(null); setSelectedUnit('');
      return;
    }
    const fetchAvailableSlots = async () => {
      try {
        setLoadingSlots(true); setSelectedSlot(null); setSelectedUnit('');
        const response = await API.get(`/bookings/available-slots/${id}/${selectedCharger}/${bookingDate}`);
        setSlots(response.data.data || []);
      } catch (error) { setSlots([]); alert('Failed to load available slots'); } 
      finally { setLoadingSlots(false); }
    };
    fetchAvailableSlots();
  }, [bookingDate, selectedCharger, id]);

  const handleSelectSlot = (slot) => {
    if (!slot.available || isSlotInPast(slot)) {
      alert('This time slot has already passed or is fully booked.');
      return;
    }
    setSelectedSlot(slot);
    setSelectedUnit(''); // Reset seat selection when slot changes
  };

  const handleBookSlot = async () => {
    if (!bookingDate || !selectedCharger || !selectedSlot) return alert('Please complete your selection.');
    if (!selectedUnit) return alert('Please select a specific charger unit (seat).');
    if (isSlotInPast(selectedSlot)) return alert('This time slot has already passed.');

    try {
      setBooking(true);
      await API.post('/bookings', {
        stationID: id,
        chargerID: selectedCharger,
        chargerUnit: selectedUnit,
        bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      navigate('/dashboard');
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || 'Server error'));
      setBookingDate(''); setSelectedCharger(''); setSelectedSlot(null); setSelectedUnit('');
    } finally {
      setBooking(false);
    }
  };

  const filteredChargers = chargers.filter(charger => filterType === 'All' ? true : charger.vehicleType?.toLowerCase().includes(filterType.toLowerCase()));
  const futureSlots = slots.filter(slot => !isSlotInPast(slot));

  return (
    <div style={{ maxWidth: '850px', margin: '30px auto', fontFamily: 'sans-serif', padding: '0 20px' }}>
      <h2>Book Charging Slot</h2>

      <div style={{ marginBottom: '25px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Select Date</label>
        <input type="date" value={bookingDate} min={getTodayDate()} onChange={(e) => { setBookingDate(e.target.value); setSelectedSlot(null); setSelectedUnit(''); setSlots([]); }} style={{ padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1' }} />
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {['All', 'Two-Wheeler', 'Three-Wheeler', 'Four-Wheeler'].map((type) => (
          <button key={type} onClick={() => { setFilterType(type); setSelectedCharger(''); setSelectedSlot(null); setSelectedUnit(''); setSlots([]); }} style={{ padding: '7px 14px', borderRadius: '15px', border: '1px solid #cbd5e1', background: filterType === type ? '#2563eb' : '#ffffff', color: filterType === type ? '#ffffff' : '#334155', cursor: 'pointer', fontWeight: '600' }}>
            {type}
          </button>
        ))}
      </div>

      <h3>Select Charger</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px' }}>
        {filteredChargers.length === 0 ? (<p style={{ color: '#64748b' }}>No chargers available.</p>) : (
          filteredChargers.map((charger) => {
            const isSelected = selectedCharger === charger._id;

            return (
              <div key={charger._id}>
                {/* Charger Card */}
                <div 
                  onClick={() => { 
                    if (!bookingDate) return alert('Please select a date first.'); 
                    if (charger.status && charger.status !== 'Available') return alert('Unavailable'); 
                    setSelectedCharger(charger._id); 
                    setSelectedSlot(null); 
                    setSelectedUnit(''); 
                    setSlots([]); 
                  }} 
                  style={{ 
                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                    padding: '18px', 
                    borderRadius: '8px', 
                    background: isSelected ? '#eff6ff' : '#f8fafc', 
                    cursor: 'pointer' 
                  }}
                >
                  <p style={{ margin: '0 0 5px' }}><strong>Vehicle Type:</strong> {charger.vehicleType}</p>
                  <p style={{ margin: '0 0 5px' }}><strong>Charging Speed:</strong> {charger.chargingSpeed}</p>
                  <p style={{ margin: '0 0 5px' }}><strong>Duration:</strong> {charger.chargingDuration} mins</p>
                  <p style={{ margin: '0' }}><strong>Price:</strong> ₹{charger.pricePerKwh}/kWh</p>
                  {isSelected && <p style={{ marginTop: '10px', color: '#2563eb', fontWeight: '600' }}>Charger Selected</p>}
                </div>

                {/* Slots & Unit Selection displayed directly below this selected charger */}
                {bookingDate && isSelected && (
                  <div style={{ marginTop: '15px', padding: '20px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Select Available Slot</h4>

                    {loadingSlots ? (
                      <p>Loading available slots...</p>
                    ) : futureSlots.length === 0 ? (
                      <p style={{ color: '#64748b' }}>No future slots available for this date.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '12px' }}>
                        {futureSlots.map((slot, index) => (
                          <button 
                            key={index} 
                            disabled={!slot.available} 
                            onClick={() => handleSelectSlot(slot)} 
                            style={{ 
                              padding: '12px', 
                              borderRadius: '8px', 
                              border: selectedSlot?.startTime === slot.startTime ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                              background: !slot.available ? '#e5e7eb' : selectedSlot?.startTime === slot.startTime ? '#2563eb' : '#ffffff', 
                              color: !slot.available ? '#64748b' : selectedSlot?.startTime === slot.startTime ? '#ffffff' : '#1e293b', 
                              cursor: !slot.available ? 'not-allowed' : 'pointer', 
                              fontWeight: '600' 
                            }}
                          >
                            {slot.startTime} - {slot.endTime}
                            <div style={{ fontSize: '11px', marginTop: '4px' }}>{slot.available ? 'Available' : 'Booked'}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* UNIT / SEAT SELECTION UI */}
                    {selectedSlot && (
                      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', background: '#ffffff' }}>
                        <h4 style={{ margin: '0 0 10px 0' }}>Select Charger Unit</h4>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
                          {selectedSlot.units.map(u => (
                            <button 
                              key={u.unitNumber} 
                              disabled={!u.available} 
                              onClick={() => setSelectedUnit(u.unitNumber)}
                              style={{ 
                                padding: '10px 16px', 
                                borderRadius: '5px', 
                                fontWeight: 'bold', 
                                border: '1px solid #cbd5e1', 
                                background: selectedUnit === u.unitNumber ? '#16a34a' : !u.available ? '#e2e8f0' : 'white', 
                                color: selectedUnit === u.unitNumber ? 'white' : !u.available ? '#94a3b8' : '#334155', 
                                cursor: !u.available ? 'not-allowed' : 'pointer' 
                              }}
                            >
                              Charger {u.unitNumber} {u.available ? '' : '(Booked)'}
                            </button>
                          ))}
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px dashed #cbd5e1', margin: '12px 0' }}/>
                        <p style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>
                          <strong>Date:</strong> {bookingDate} | <strong>Slot:</strong> {selectedSlot.startTime} - {selectedSlot.endTime}
                        </p>
                        
                        <button 
                          onClick={handleBookSlot} 
                          disabled={booking} 
                          style={{ 
                            width: '100%', 
                            padding: '12px', 
                            marginTop: '10px', 
                            background: booking ? '#94a3b8' : '#22c55e', 
                            color: '#ffffff', 
                            border: 'none', 
                            borderRadius: '6px', 
                            cursor: booking ? 'not-allowed' : 'pointer', 
                            fontWeight: 'bold', 
                            fontSize: '16px' 
                          }}
                        >
                          {booking ? 'Booking...' : 'Book Slot'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}