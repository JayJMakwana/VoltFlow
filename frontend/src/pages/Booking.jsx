import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import API from '../api/axios';

export default function Booking() {
  const { id } = useParams();
  const location = useLocation();

  const [chargers, setChargers] = useState([]);
  const [slots, setSlots] = useState([]);

  const [filterType, setFilterType] = useState(
    location.state?.defaultFilter || 'All'
  );

  const [bookingDate, setBookingDate] = useState('');
  const [selectedCharger, setSelectedCharger] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  // Fetch chargers
  useEffect(() => {
    const fetchChargers = async () => {
      try {
        const response = await API.get(`/chargers/station/${id}`);

        setChargers(response.data.data || []);
      } catch (error) {
        console.error('Failed to load chargers:', error);

        alert(
          error.response?.data?.message ||
          'Failed to load chargers'
        );
      }
    };

    fetchChargers();
  }, [id]);

  // Fetch slots when date and charger are selected
  useEffect(() => {
    if (!bookingDate || !selectedCharger) {
      setSlots([]);
      setSelectedSlot(null);
      return;
    }

    const fetchAvailableSlots = async () => {
      try {
        setLoadingSlots(true);
        setSelectedSlot(null);

        const response = await API.get(
          `/bookings/available-slots/${id}/${selectedCharger}/${bookingDate}`
        );

        setSlots(response.data.data || []);
      } catch (error) {
        console.error(
          'Failed to load available slots:',
          error
        );

        setSlots([]);

        alert(
          error.response?.data?.message ||
          'Failed to load available slots'
        );
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchAvailableSlots();
  }, [bookingDate, selectedCharger, id]);

  // Select a slot
  const handleSelectSlot = (slot) => {
    if (!slot.available) {
      return;
    }

    setSelectedSlot(slot);
  };

  // Book selected slot
  const handleBookSlot = async () => {
    if (!bookingDate) {
      alert('Please select a date first.');
      return;
    }

    if (!selectedCharger) {
      alert('Please select a charger.');
      return;
    }

    if (!selectedSlot) {
      alert('Please select a slot.');
      return;
    }

    if (!selectedSlot.available) {
      alert('This slot is no longer available.');
      return;
    }

    try {
      setBooking(true);

      const response = await API.post('/bookings', {
        stationID: id,
        chargerID: selectedCharger,
        bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });

      alert(response.data.message);

      // Refresh slots after successful booking
      const slotsResponse = await API.get(
        `/bookings/available-slots/${id}/${selectedCharger}/${bookingDate}`
      );

      setSlots(slotsResponse.data.data || []);
      setSelectedSlot(null);

    } catch (error) {
      alert(
        'Booking failed: ' +
        (
          error.response?.data?.message ||
          'Server error'
        )
      );

      // Refresh slots in case another user booked it
      try {
        const slotsResponse = await API.get(
          `/bookings/available-slots/${id}/${selectedCharger}/${bookingDate}`
        );

        setSlots(slotsResponse.data.data || []);
        setSelectedSlot(null);
      } catch (refreshError) {
        console.error(
          'Failed to refresh slots:',
          refreshError
        );
      }
    } finally {
      setBooking(false);
    }
  };

  // Filter chargers
  const filteredChargers = chargers.filter(
    (charger) => {
      if (filterType === 'All') {
        return true;
      }

      return charger.vehicleType
        ?.toLowerCase()
        .includes(filterType.toLowerCase());
    }
  );

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '30px auto',
        fontFamily: 'sans-serif',
        padding: '0 20px'
      }}
    >
      <h2>Book Charging Slot</h2>

      {/* DATE */}
      <div
        style={{
          marginBottom: '25px'
        }}
      >
        <label
          style={{
            display: 'block',
            marginBottom: '8px',
            fontWeight: '600'
          }}
        >
          Select Date
        </label>

        <input
          type="date"
          value={bookingDate}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => {
            setBookingDate(e.target.value);
            setSelectedSlot(null);
          }}
          style={{
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #cbd5e1'
          }}
        />
      </div>

      {/* VEHICLE TYPE FILTER */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        {[
          'All',
          'Two-Wheeler',
          'Three-Wheeler',
          'Four-Wheeler'
        ].map((type) => (
          <button
            key={type}
            onClick={() => {
              setFilterType(type);
              setSelectedCharger('');
              setSelectedSlot(null);
              setSlots([]);
            }}
          
            style={{
              padding: '7px 14px',
              borderRadius: '15px',
              border: '1px solid #cbd5e1',
              background:
                filterType === type
                  ? '#2563eb'
                  : '#ffffff',
              color:
                filterType === type
                  ? '#ffffff'
                  : '#334155',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* CHARGERS */}
      <h3>Select Charger</h3>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          marginBottom: '30px'
        }}
      >
        {filteredChargers.length === 0 ? (
          <p style={{ color: '#64748b' }}>
            No chargers available for this vehicle type.
          </p>
        ) : (
          filteredChargers.map((charger) => (
            <div
              key={charger._id}
             onClick={() => {
                if (!bookingDate) {
                  alert('Please select a date first.');
                  return;
                }

                setSelectedCharger(charger._id);
                setSelectedSlot(null);
                setSlots([]);
              }}
              style={{
                border:
                  selectedCharger === charger._id
                    ? '2px solid #2563eb'
                    : '1px solid #cbd5e1',
                padding: '18px',
                borderRadius: '8px',
                background:
                  selectedCharger === charger._id
                    ? '#eff6ff'
                    : '#f8fafc',
                cursor: 'pointer'
              }}
            >
              <p style={{ margin: '0 0 5px' }}>
                <strong>Vehicle Type:</strong>{' '}
                {charger.vehicleType}
              </p>

              <p style={{ margin: '0 0 5px' }}>
                <strong>Charging Speed:</strong>{' '}
                {charger.chargingSpeed}
              </p>

              <p style={{ margin: '0 0 5px' }}>
                <strong>Charging Duration:</strong>{' '}
                {charger.chargingDuration} minutes
              </p>

              <p style={{ margin: '0' }}>
                <strong>Price:</strong>{' '}
                ₹{charger.pricePerKwh}/kWh
              </p>

              {selectedCharger === charger._id && (
                <p
                  style={{
                    marginTop: '10px',
                    color: '#2563eb',
                    fontWeight: '600'
                  }}
                >
                  Charger Selected
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* SLOTS */}
      {bookingDate && selectedCharger && (
        <div>
          <h3>Select Available Slot</h3>

          {loadingSlots ? (
            <p>Loading available slots...</p>
          ) : slots.length === 0 ? (
            <p style={{ color: '#64748b' }}>
              No slots available for this date.
            </p>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
                marginTop: '15px'
              }}
            >
              {slots.map((slot, index) => (
                <button
                  key={index}
                  disabled={!slot.available}
                  onClick={() =>
                    handleSelectSlot(slot)
                  }
                  style={{
                    padding: '15px',
                    borderRadius: '8px',
                    border:
                      selectedSlot?.startTime ===
                        slot.startTime &&
                      selectedSlot?.endTime ===
                        slot.endTime
                        ? '2px solid #2563eb'
                        : '1px solid #cbd5e1',

                    background:
                      !slot.available
                        ? '#e5e7eb'
                        : selectedSlot?.startTime ===
                            slot.startTime &&
                          selectedSlot?.endTime ===
                            slot.endTime
                        ? '#2563eb'
                        : '#ffffff',

                    color:
                      !slot.available
                        ? '#64748b'
                        : selectedSlot?.startTime ===
                            slot.startTime &&
                          selectedSlot?.endTime ===
                            slot.endTime
                        ? '#ffffff'
                        : '#1e293b',

                    cursor:
                      !slot.available
                        ? 'not-allowed'
                        : 'pointer',

                    fontWeight: '600'
                  }}
                >
                  {slot.startTime} - {slot.endTime}

                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '5px'
                    }}
                  >
                    {slot.available
                      ? 'Available'
                      : 'Booked'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* BOOK BUTTON */}
          {selectedSlot && (
            <div
              style={{
                marginTop: '25px',
                padding: '20px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                background: '#f8fafc'
              }}
            >
              <p>
                <strong>Selected Date:</strong>{' '}
                {bookingDate}
              </p>

              <p>
                <strong>Selected Slot:</strong>{' '}
                {selectedSlot.startTime} -{' '}
                {selectedSlot.endTime}
              </p>

              <button
                onClick={handleBookSlot}
                disabled={booking}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '10px',
                  background: booking
                    ? '#94a3b8'
                    : '#22c55e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: booking
                    ? 'not-allowed'
                    : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                {booking
                  ? 'Booking...'
                  : 'Book Slot'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}