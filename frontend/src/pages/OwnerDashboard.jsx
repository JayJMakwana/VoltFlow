import { useState, useEffect } from 'react';
import API from '../api/axios';

import {
  GoogleMap,
  Marker,
  useJsApiLoader
} from '@react-google-maps/api';

const mapContainerStyle = {
  width: '100%',
  height: '350px'
};

const defaultCenter = {
  lat: 22.6916,
  lng: 72.8634
};

export default function OwnerDashboard() {
  const [stations, setStations] = useState([]);

  // Deploy Station State
  const [stationName, setStationName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);

  // Add Hardware State
  const [selectedStation, setSelectedStation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [chargingSpeed, setChargingSpeed] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [quantity, setQuantity] = useState('');

  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Fetch stations
  const fetchStations = async () => {
    try {
      const response = await API.get('/stations');

      setStations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load stations:', error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  // When owner clicks on map
  const handleMapClick = (event) => {
    const latitude = event.latLng.lat();
    const longitude = event.latLng.lng();

    setLocation({
      lat: latitude,
      lng: longitude
    });
  };

  const handleUseLiveLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setLocation({
        lat: latitude,
        lng: longitude
      });
    },
    (error) => {
      if (error.code === 1) {
        alert('Location permission was denied.');
      } else if (error.code === 2) {
        alert('Unable to determine your location.');
      } else if (error.code === 3) {
        alert('Location request timed out.');
      } else {
        alert('Unable to get your current location.');
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

  // Deploy new station
  const handleDeployStation = async () => {
    if (!stationName.trim()) {
      alert('Please enter the station name.');
      return;
    }

    if (!address.trim()) {
      alert('Please enter the station address.');
      return;
    }

    if (!location) {
      alert('Please select the station location on the map.');
      return;
    }

    try {
      await API.post('/stations', {
        stationName: stationName.trim(),
        address: address.trim(),
        latitude: location.lat,
        longitude: location.lng
      });

      alert('Station deployed successfully!');

      // Clear form
      setStationName('');
      setAddress('');
      setLocation(null);

      // Refresh stations
      fetchStations();

    } catch (error) {
      alert(
        'Failed to deploy station: ' +
        (error.response?.data?.message || 'Server error')
      );
    }
  };

  // Add charger 
  const handleAddCharger = async () => {
    if (!selectedStation || !vehicleType || !chargingSpeed || !pricePerKwh || !quantity) {
        alert('Please fill out all Charger fields.');
        return;
      }
    if (Number(quantity) <= 0) {
      alert('Quantity must be greater than 0.');
      return;
    }
    try {
      await API.post('/chargers', {
        stationID: selectedStation,
        vehicleType,
        chargingSpeed,
        pricePerKwh: Number(pricePerKwh),
        quantity: Number(quantity)
      });

      alert('Charger added successfully!');

      setChargingSpeed('');
      setPricePerKwh('');
      setQuantity(1);

      fetchStations();

    } catch (error) {
      alert(
        'Failed to add Charger ' +
        (error.response?.data?.message || 'Server error')
      );
    }
  };

  // Google Maps loading error
  if (loadError) {
    return (
      <div
        style={{
          maxWidth: '900px',
          margin: '40px auto',
          padding: '20px',
          fontFamily: 'sans-serif'
        }}
      >
        <h2>Google Maps could not be loaded</h2>

        <p>
          Please check your Google Maps API key and make sure
          Maps JavaScript API is enabled.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '30px auto',
        fontFamily: 'sans-serif',
        textAlign: 'left',
        padding: '0 20px'
      }}
    >
      <h2
        style={{
          fontSize: '1.8rem',
          color: '#0f172a',
          margin: '0 0 30px 0'
        }}
      >
        Station Owner Portal
      </h2>

      {/* ===================================================== */}
      {/* 1. MY INFRASTRUCTURE */}
      {/* ===================================================== */}

      <div>
        <h3
          style={{
            margin: '0 0 5px 0',
            color: '#1e293b'
          }}
        >
          1. My Infrastructure
        </h3>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            marginTop: 0
          }}
        >
          Manage your installed chargers and operational status.
        </p>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            margin: '15px 0 20px 0'
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '25px'
          }}
        >
          {stations.length === 0 ? (
            <p style={{ color: '#64748b' }}>
              No charging stations found.
            </p>
          ) : (
            stations.map((station) => (
              <div
                key={station._id}
                style={{
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    padding: '20px',
                    background: '#ffffff'
                  }}
                >
                  <h3
                    style={{
                      margin: '0 0 5px 0',
                      color: '#2563eb'
                    }}
                  >
                    {station.stationName}
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: '#64748b',
                      fontSize: '0.9rem'
                    }}
                  >
                    {station.address}
                  </p>

                  <p
                    style={{
                      margin: '8px 0 0 0',
                      color: '#475569',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong>Latitude:</strong>{' '}
                    {station.latitude}
                  </p>

                  <p
                    style={{
                      margin: '3px 0 0 0',
                      color: '#475569',
                      fontSize: '0.85rem'
                    }}
                  >
                    <strong>Longitude:</strong>{' '}
                    {station.longitude}
                  </p>
                </div>

                <div
                  style={{
                    padding: '20px',
                    borderTop: '1px solid #cbd5e1'
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      color: '#475569',
                      margin: '0 0 15px 0',
                      textTransform: 'uppercase'
                    }}
                  >
                    Installed Chargers for {station.stationName}
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '15px'
                    }}
                  >
                    {station.chargers?.length > 0 ? (
                      station.chargers.map((charger) => (
                        <div
                          key={charger._id}
                          style={{
                            border: '1px solid #cbd5e1',
                            padding: '15px',
                            borderRadius: '6px',
                            background: '#ffffff',
                            boxShadow:
                              '0 1px 2px rgba(0,0,0,0.05)'
                          }}
                        >
                          <h4
                            style={{
                              margin: '0 0 5px 0',
                              color: '#0f172a'
                            }}
                          >
                            {charger.chargingSpeed}
                          </h4>

                          <p
                            style={{
                              margin: '0 0 10px 0',
                              color: '#64748b',
                              fontSize: '0.9rem'
                            }}
                          >
                            Type: {charger.vehicleType}
                          </p>

                          <p
                            style={{
                              margin: '0',
                              color: '#16a34a',
                              fontWeight: 'bold'
                            }}
                          >
                            ₹ {charger.pricePerKwh || 0} / kWh
                          </p>

                          <p
                            style={{
                              margin: '5px 0 0 0',
                              color: '#475569',
                              fontSize: '0.85rem'
                            }}
                          >
                            Quantity: {charger.quantity || 1}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p
                        style={{
                          color: '#94a3b8',
                          fontSize: '0.9rem',
                          margin: 0
                        }}
                      >
                        No chargers installed yet.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <br />

      {/* ===================================================== */}
      {/* 2. NETWORK EXPANSION */}
      {/* ===================================================== */}

      <div style={{ marginBottom: '40px' }}>
        <h3
          style={{
            margin: '0 0 5px 0',
            color: '#1e293b'
          }}
        >
          2. Network Expansion
        </h3>

        <p
          style={{
            color: '#64748b',
            fontSize: '0.9rem',
            marginTop: 0
          }}
        >
          Deploy new physical locations or add chargers to
          existing hubs.
        </p>

        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #e2e8f0',
            margin: '15px 0 20px 0'
          }}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '30px'
          }}
        >

          {/* ================================================= */}
          {/* FORM A: DEPLOY NEW STATION */}
          {/* ================================================= */}

          <div
            style={{
              border: '1px solid #cbd5e1',
              padding: '25px',
              borderRadius: '8px',
              background: '#ffffff',
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: '20px',
                color: '#0f172a'
              }}
            >
              Deploy New Station
            </h3>

            {/* Station Name */}
            <input
              type="text"
              placeholder="Station Name"
              value={stationName}
              onChange={(e) =>
                setStationName(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />

            {/* Address */}
            <input
              type="text"
              placeholder="Physical Address"
              value={address}
              onChange={(e) =>
                setAddress(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />

            {/* Google Map */}
            <h4
              style={{
                marginBottom: '10px',
                color: '#334155'
              }}
            >
              Select Station Location
            </h4>
              <button
                onClick={handleUseLiveLocation}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginBottom: '15px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                📍 Use My Live Location
              </button>
            {!isLoaded ? (
              <div
                style={{
                  height: '350px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  color: '#64748b'
                }}
              >
                Loading Google Maps...
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={
                  location || defaultCenter
                }
                zoom={12}
                onClick={handleMapClick}
              >
                {location && (
                  <Marker position={location} />
                )}
              </GoogleMap>
            )}

            {/* Selected Coordinates */}
            {location ? (
              <div
                style={{
                  marginTop: '15px',
                  padding: '15px',
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px'
                }}
              >
                <p
                  style={{
                    margin: '0 0 5px 0',
                    color: '#166534'
                  }}
                >
                  <strong>Selected Location</strong>
                </p>

                <p
                  style={{
                    margin: '5px 0',
                    color: '#334155'
                  }}
                >
                  <strong>Latitude:</strong>{' '}
                  {location.lat.toFixed(6)}
                </p>

                <p
                  style={{
                    margin: '5px 0',
                    color: '#334155'
                  }}
                >
                  <strong>Longitude:</strong>{' '}
                  {location.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <p
                style={{
                  marginTop: '10px',
                  color: '#64748b',
                  fontSize: '0.9rem'
                }}
              >
                Click anywhere on the map to select the
                charging station location.
              </p>
            )}

            {/* Deploy Button */}
            <button
              onClick={handleDeployStation}
              style={{
                width: '100%',
                padding: '12px',
                marginTop: '20px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Deploy Station
            </button>
          </div>

          {/* ================================================= */}
          {/* FORM B: Add Charger*/}
          {/* ================================================= */}

          <div
            style={{
              border: '1px solid #cbd5e1',
              padding: '25px',
              borderRadius: '8px',
              background: '#ffffff',
              boxShadow:
                '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            <h3
              style={{
                marginTop: 0,
                marginBottom: '20px',
                color: '#0f172a'
              }}
            >
              Add Charger to Station
            </h3>

            {/* Station */}
            <select
              value={selectedStation}
              onChange={(e) =>
                setSelectedStation(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            >
              <option value="">
                -- Select a Station --
              </option>

              {stations.map((station) => (
                <option
                  key={station._id}
                  value={station._id}
                >
                  {station.stationName}
                </option>
              ))}
            </select>

            {/* Vehicle Type */}
            <select
              value={vehicleType}
              onChange={(e) =>
                setVehicleType(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            >
              <option value="" disabled>
                Vehicle Type
              </option>
              <option value="Two-Wheeler">
                Two-Wheeler
              </option>

              <option value="Three-Wheeler">
                Three-Wheeler
              </option>

              <option value="Four-Wheeler">
                Four-Wheeler
              </option>
            </select>

            {/* Charging Speed */}
            <input
              type="text"
              placeholder="Speed (e.g., 50kW Fast)"
              value={chargingSpeed}
              onChange={(e) =>
                setChargingSpeed(e.target.value)
              }
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '15px',
                borderRadius: '5px',
                border: '1px solid #cbd5e1',
                boxSizing: 'border-box'
              }}
            />

            {/* Price and Quantity */}
            <div
              style={{
                display: 'flex',
                gap: '15px',
                marginBottom: '20px'
              }}
            >
              <input
                type="number"
                placeholder="Price per kWh (₹)"
                value={pricePerKwh}
                onChange={(e) =>
                  setPricePerKwh(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box'
                }}
              />

              <input
                type="number"
                placeholder="Quantity"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Add Charger */}
            <button
              onClick={handleAddCharger}
              style={{
                width: '100%',
                padding: '12px',
                background: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Add Charger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

