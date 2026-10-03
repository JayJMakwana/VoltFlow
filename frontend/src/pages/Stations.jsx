import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [nearestStations, setNearestStations] = useState([]);
  const [showNearest, setShowNearest] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const response = await API.get('/stations');
      const data = response.data.data || [];
      setStations(data);
      setNearestStations(data);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  // Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const earthRadius = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  };

  const handleNearestDistance = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatitude = position.coords.latitude;
        const userLongitude = position.coords.longitude;

        const sortedStations = stations
          .map((station) => {
            const stationLatitude = Number(station.latitude);
            const stationLongitude = Number(station.longitude);

            const distance = calculateDistance(
              userLatitude,
              userLongitude,
              stationLatitude,
              stationLongitude
            );

            return { ...station, distance };
          })
          .filter((station) => Number.isFinite(station.distance))
          .sort((a, b) => a.distance - b.distance);

        setNearestStations(sortedStations);
        setShowNearest(true);
        setLoadingLocation(false);
      },
      (error) => {
        setLoadingLocation(false);
        alert('Please allow location access to calculate nearby stations.');
      },
      { enableHighAccuracy: true }
    );
  };

  const handleShowAll = () => {
    setNearestStations(stations);
    setShowNearest(false);
  };

  // Open Google Maps Directions in a new tab
  const handleShowDirection = (station) => {
    if (!navigator.geolocation) {
      alert('Geolocation is required for directions.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        const destLat = station.latitude;
        const destLng = station.longitude;

        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${destLat},${destLng}&travelmode=driving`;
        window.open(mapsUrl, '_blank');
      },
      () => alert('Unable to get your live location. Please check your browser location permissions.')
    );
  };

  const displayedStations = showNearest ? nearestStations : stations;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '850px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px', flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, color: '#0f172a' }}>
          {showNearest ? 'Nearest Charging Stations' : 'Available Charging Stations'}
        </h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleNearestDistance}
            disabled={loadingLocation}
            style={{ padding: '10px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: loadingLocation ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}
          >
            {loadingLocation ? 'Getting Location...' : '📍 Nearest Distance'}
          </button>

          {showNearest && (
            <button
              onClick={handleShowAll}
              style={{ padding: '10px 16px', background: '#64748b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Show All Stations
            </button>
          )}
        </div>
      </div>

      {displayedStations.length === 0 ? (
        <p style={{ color: '#64748b' }}>No charging stations available.</p>
      ) : (
        /* Vertical List Layout (1 per row) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {displayedStations.map((station) => (
            <div 
              key={station._id} 
              style={{ 
                border: '1px solid #cbd5e1', 
                padding: '25px', 
                borderRadius: '8px', 
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                
                {/* Station Details */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '6px', color: '#0f172a', fontSize: '1.25rem' }}>
                    {station.stationName}
                  </h3>
                  <p style={{ color: '#64748b', margin: '0 0 10px 0', fontSize: '0.95rem' }}>
                    {station.address}
                  </p>

                  {showNearest && Number.isFinite(station.distance) && (
                    <p style={{ color: '#16a34a', fontWeight: 'bold', margin: 0, fontSize: '0.9rem' }}>
                      📍 {station.distance.toFixed(2)} km away
                    </p>
                  )}
                </div>

                {/* Actions / Buttons */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => navigate(`/stations/${station._id}`)}
                    style={{ padding: '10px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    View Chargers
                  </button>

                  <button
                    onClick={() => handleShowDirection(station)}
                    style={{ padding: '10px 16px', background: '#8b5cf6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Show Direction
                  </button>

                  <button
                    onClick={() => navigate(`/feedback/${station._id}`)}
                    style={{ padding: '10px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    ⭐ Reviews
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}