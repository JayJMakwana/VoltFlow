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

            return {
              ...station,
              distance
            };
          })
          .filter((station) => Number.isFinite(station.distance))
          .sort((a, b) => a.distance - b.distance);

        setNearestStations(sortedStations);
        setShowNearest(true);
        setLoadingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);

        setLoadingLocation(false);

        if (error.code === 1) {
          alert('Please allow location access.');
        } else if (error.code === 2) {
          alert('Unable to determine your location.');
        } else if (error.code === 3) {
          alert('Location request timed out.');
        } else {
          alert('Failed to get your current location.');
        }
      }
    );
  };

  const handleShowAll = () => {
    setNearestStations(stations);
    setShowNearest(false);
  };

  const displayedStations = showNearest
    ? nearestStations
    : stations;

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        maxWidth: '1000px',
        margin: '40px auto',
        padding: '0 20px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '10px',
          flexWrap: 'wrap'
        }}
      >
        <h2 style={{ margin: 0 }}>
          {showNearest
            ? 'Nearest Charging Stations'
            : 'Available Charging Stations'}
        </h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleNearestDistance}
            disabled={loadingLocation}
            style={{
              padding: '10px 16px',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: loadingLocation ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loadingLocation
              ? 'Getting Location...'
              : '📍 Nearest Distance'}
          </button>

          {showNearest && (
            <button
              onClick={handleShowAll}
              style={{
                padding: '10px 16px',
                background: '#64748b',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Show All Stations
            </button>
          )}
        </div>
      </div>

      {displayedStations.length === 0 ? (
        <p>No charging stations available.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gap: '20px',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(300px, 1fr))'
          }}
        >
          {displayedStations.map((station) => (
            <div
              key={station._id}
              style={{
                border: '1px solid #ccc',
                padding: '20px',
                borderRadius: '8px',
                background: '#f8fafc'
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  color: '#0f172a'
                }}
              >
                {station.stationName}
              </h3>

              <p
                style={{
                  color: '#475569',
                  marginBottom: '10px'
                }}
              >
                {station.address}
              </p>

              {showNearest &&
                Number.isFinite(station.distance) && (
                  <p
                    style={{
                      color: '#16a34a',
                      fontWeight: 'bold'
                    }}
                  >
                    📍 {station.distance.toFixed(2)} km away
                  </p>
                )}

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  onClick={() =>
                    navigate(`/stations/${station._id}`)
                  }
                  style={{
                    padding: '10px 16px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  View Chargers
                </button>

                <button
                  onClick={() =>
                    navigate(`/feedback/${station._id}`)
                  }
                  style={{
                    padding: '10px 16px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ⭐ Reviews
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}