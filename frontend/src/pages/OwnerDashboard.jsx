import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
 
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');
  const navigate = useNavigate();
  const [chargingDuration, setChargingDuration] = useState('');
  
  // Station edit state
const [editingStation, setEditingStation] = useState(null);
const [editStationName, setEditStationName] = useState('');
const [editAddress, setEditAddress] = useState('');
const [editLatitude, setEditLatitude] = useState('');
const [editLongitude, setEditLongitude] = useState('');
const [editOpeningTime, setEditOpeningTime] = useState('09:00');
const [editClosingTime, setEditClosingTime] = useState('21:00');

// Charger edit state
const [editingCharger, setEditingCharger] = useState(null);
const [editVehicleType, setEditVehicleType] = useState('');
const [editChargingSpeed, setEditChargingSpeed] = useState('');
const [editPricePerKwh, setEditPricePerKwh] = useState('');
const [editQuantity, setEditQuantity] = useState('');
const [editChargingDuration, setEditChargingDuration] = useState('');
const [editStatus, setEditStatus] = useState('Available');
  // Load Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  // Fetch stations
  const fetchStations = async () => {
  try {
    const response = await API.get(
      '/stations/my-stations'
    );

    setStations(
      response.data.data || []
    );

  } catch (error) {
    console.error(
      'Failed to load owner stations:',
      error
    );

    alert(
      error.response?.data?.message ||
      'Failed to load your stations'
    );
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
        longitude: location.lng,
        openingTime,
        closingTime
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
  if (
    !selectedStation ||
    !vehicleType ||
    !chargingSpeed ||
    !pricePerKwh ||
    !chargingDuration||
    !quantity
  ) {
    alert('Please fill out all charger fields.');
    return;
  }

  if (Number(pricePerKwh) <= 0) {
    alert('Price per kWh must be greater than 0.');
    return;
  }

  if (Number(chargingDuration) <= 0) {
    alert('Charging duration must be greater than 0.');
    return;
  }

  try {
    await API.post('/chargers', {
      stationID: selectedStation,
      vehicleType,
      chargingSpeed,
      pricePerKwh: Number(pricePerKwh),
      chargingDuration: Number(chargingDuration),
      quantity: Number(quantity)
    });

    alert('Charger added successfully!');

    setVehicleType('');
    setChargingSpeed('');
    setPricePerKwh('');
    setChargingDuration('');

    fetchStations();

  } catch (error) {
    console.error('Add charger error:', error);

    alert(
      'Failed to add charger: ' +
      (
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Server error'
      )
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
  const handleEditStation = (station) => {
  setEditingStation(station);

  setEditStationName(station.stationName || '');
  setEditAddress(station.address || '');
  setEditLatitude(station.latitude || '');
  setEditLongitude(station.longitude || '');
  setEditOpeningTime(station.openingTime || '09:00');
  setEditClosingTime(station.closingTime || '21:00');
};

const handleUpdateStation = async () => {
  if (!editStationName.trim()) {
    alert('Please enter station name.');
    return;
  }

  if (!editAddress.trim()) {
    alert('Please enter station address.');
    return;
  }

  try {
    await API.put(
      `/stations/${editingStation._id}`,
      {
        stationName: editStationName.trim(),
        address: editAddress.trim(),
        latitude: Number(editLatitude),
        longitude: Number(editLongitude),
        openingTime: editOpeningTime,
        closingTime: editClosingTime
      }
    );

    alert('Station updated successfully.');

    setEditingStation(null);

    fetchStations();

  } catch (error) {
    console.error('Update station error:', error);

    alert(
      error.response?.data?.message ||
      'Failed to update station.'
    );
  }
};

const handleDeleteStation = async (stationID) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this station? All chargers belonging to this station will also be deleted.'
  );

  if (!confirmed) {
    return;
  }

  try {
    await API.delete(
      `/stations/${stationID}`
    );

    alert('Station deleted successfully.');

    if (selectedStation === stationID) {
      setSelectedStation('');
    }

    fetchStations();

  } catch (error) {
    console.error('Delete station error:', error);

    alert(
      error.response?.data?.message ||
      'Failed to delete station.'
    );
  }
};
const handleEditCharger = (charger) => {
  setEditingCharger(charger);

  setEditVehicleType(charger.vehicleType || '');
  setEditChargingSpeed(charger.chargingSpeed || '');
  setEditPricePerKwh(charger.pricePerKwh || '');
  setEditQuantity(charger.quantity || '');
  setEditChargingDuration(charger.chargingDuration || '');
  setEditStatus(charger.status || 'Available');
};

const handleUpdateCharger = async () => {
  if (
    !editVehicleType ||
    !editChargingSpeed ||
    !editPricePerKwh ||
    !editQuantity ||
    !editChargingDuration
  ) {
    alert('Please fill all charger fields.');
    return;
  }

  if (Number(editPricePerKwh) <= 0) {
    alert('Price per kWh must be greater than 0.');
    return;
  }

  if (Number(editQuantity) <= 0) {
    alert('Quantity must be greater than 0.');
    return;
  }

  if (Number(editChargingDuration) <= 0) {
    alert('Charging duration must be greater than 0.');
    return;
  }

  try {
    await API.put(
      `/chargers/${editingCharger._id}`,
      {
        vehicleType: editVehicleType,
        chargingSpeed: editChargingSpeed,
        pricePerKwh: Number(editPricePerKwh),
        quantity: Number(editQuantity),
        chargingDuration: Number(editChargingDuration),
        status: editStatus
      }
    );

    alert('Charger updated successfully.');

    setEditingCharger(null);

    fetchStations();

  } catch (error) {
    console.error('Update charger error:', error);

    alert(
      error.response?.data?.message ||
      'Failed to update charger.'
    );
  }
};

const handleDeleteCharger = async (chargerID) => {
  const confirmed = window.confirm(
    'Are you sure you want to delete this charger?'
  );

  if (!confirmed) {
    return;
  }

  try {
    await API.delete(
      `/chargers/${chargerID}`
    );

    alert('Charger deleted successfully.');

    fetchStations();

  } catch (error) {
    console.error('Delete charger error:', error);

    alert(
      error.response?.data?.message ||
      'Failed to delete charger.'
    );
  }
};
const modalInputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  borderRadius: '5px',
  border: '1px solid #cbd5e1',
  boxSizing: 'border-box'
};
const handleEditMapClick = (event) => {
  const latitude = event.latLng.lat();
  const longitude = event.latLng.lng();

  setEditLatitude(latitude);
  setEditLongitude(longitude);
};
const handleEditLiveLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by this browser.');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      setEditLatitude(latitude);
      setEditLongitude(longitude);
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
      <button
  onClick={() => navigate('/owner-earnings')}
  style={{
    padding: '10px 18px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    marginBottom: '20px'
  }}
>
  💰 View Earnings
</button>
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
                  <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        marginTop: '15px'
                      }}
                    >
                      <button
                        onClick={() => handleEditStation(station)}
                        style={{
                          padding: '8px 14px',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit Station
                      </button>

                      <button
                        onClick={() => handleDeleteStation(station._id)}
                        style={{
                          padding: '8px 14px',
                          background: '#dc2626',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete Station
                      </button>
                    </div>
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
                          <div
                              style={{
                                display: 'flex',
                                gap: '8px',
                                marginTop: '12px'
                              }}
                            >
                              <button
                                onClick={() => handleEditCharger(charger)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  background: '#2563eb',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer'
                                }}
                              >
                                ✏️ Edit
                              </button>

                              <button
                                onClick={() => handleDeleteCharger(charger._id)}
                                style={{
                                  flex: 1,
                                  padding: '8px',
                                  background: '#dc2626',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️ Delete
                              </button>
                            </div>
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
            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}
              >
                Opening Time
              </label>

              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '6px',
                  fontWeight: '600'
                }}
              >
                Closing Time
              </label>

              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

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
              <select
                value={chargingDuration}
                onChange={(e) => setChargingDuration(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  marginBottom: '15px',
                  borderRadius: '5px',
                  border: '1px solid #cbd5e1',
                  boxSizing: 'border-box',
                  color: chargingDuration ? '#0f172a' : '#64748b'
                }}
              >
                <option value="" disabled>
                  Charging Duration
                </option>

                <option value="30">
                  30 Minutes
                </option>

                <option value="60">
                  1 Hour
                </option>

                <option value="90">
                  1 Hour 30 Minutes
                </option>

                <option value="120">
                  2 Hours
                </option>

                <option value="180">
                  3 Hours
                </option>
              </select>
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
      {editingStation && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: 'white',
              width: '90%',
              maxWidth: '500px',
              padding: '25px',
              borderRadius: '10px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <h2>Edit Station</h2>

            <input
              type="text"
              placeholder="Station Name"
              value={editStationName}
              onChange={(e) =>
                setEditStationName(e.target.value)
              }
              style={modalInputStyle}
            />

            <input
              type="text"
              placeholder="Address"
              value={editAddress}
              onChange={(e) =>
                setEditAddress(e.target.value)
              }
              style={modalInputStyle}
            />

            <h4
              style={{
                marginBottom: '10px',
                color: '#334155'
              }}
            >
              Select Station Location
            </h4>
            <button
              onClick={handleEditLiveLocation}
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
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{
                  width: '100%',
                  height: '300px'
                }}
                center={{
                  lat: Number(editLatitude) || defaultCenter.lat,
                  lng: Number(editLongitude) || defaultCenter.lng
                }}
                zoom={14}
                onClick={handleEditMapClick}
              >
                {editLatitude && editLongitude && (
                  <Marker
                    position={{
                      lat: Number(editLatitude),
                      lng: Number(editLongitude)
                    }}
                  />
                )}
              </GoogleMap>
            ) : (
              <div
                style={{
                  height: '300px',
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
            )}

            <div
              style={{
                marginTop: '10px',
                padding: '12px',
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '6px'
              }}
            >
              <p style={{ margin: '4px 0' }}>
                <strong>Latitude:</strong>{' '}
                {editLatitude || 'Not selected'}
              </p>

              <p style={{ margin: '4px 0' }}>
                <strong>Longitude:</strong>{' '}
                {editLongitude || 'Not selected'}
              </p>
            </div>
            <label>Opening Time</label>

            <input
              type="time"
              value={editOpeningTime}
              onChange={(e) =>
                setEditOpeningTime(e.target.value)
              }
              style={modalInputStyle}
            />

            <label>Closing Time</label>

            <input
              type="time"
              value={editClosingTime}
              onChange={(e) =>
                setEditClosingTime(e.target.value)
              }
              style={modalInputStyle}
            />

            <div
              style={{
                display: 'flex',
                gap: '10px',
                marginTop: '15px'
              }}
            >
              <button
                onClick={handleUpdateStation}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Update Station
              </button>

              <button
                onClick={() => setEditingStation(null)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
          {editingCharger && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
              }}
            >
              <div
                style={{
                  background: 'white',
                  width: '90%',
                  maxWidth: '500px',
                  padding: '25px',
                  borderRadius: '10px',
                  maxHeight: '90vh',
                  overflowY: 'auto'
                }}
              >
                <h2>Edit Charger</h2>

                <label>Vehicle Type</label>

                <select
                  value={editVehicleType}
                  onChange={(e) =>
                    setEditVehicleType(e.target.value)
                  }
                  style={modalInputStyle}
                >
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

                <input
                  type="text"
                  placeholder="Charging Speed"
                  value={editChargingSpeed}
                  onChange={(e) =>
                    setEditChargingSpeed(e.target.value)
                  }
                  style={modalInputStyle}
                />

                <input
                  type="number"
                  placeholder="Price per kWh"
                  value={editPricePerKwh}
                  onChange={(e) =>
                    setEditPricePerKwh(e.target.value)
                  }
                  style={modalInputStyle}
                />

                <input
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(e.target.value)
                  }
                  style={modalInputStyle}
                />

                <label>Charging Duration</label>

                <select
                  value={editChargingDuration}
                  onChange={(e) =>
                    setEditChargingDuration(e.target.value)
                  }
                  style={modalInputStyle}
                >
                  <option value="30">30 Minutes</option>
                  <option value="60">1 Hour</option>
                  <option value="90">1 Hour 30 Minutes</option>
                  <option value="120">2 Hours</option>
                  <option value="180">3 Hours</option>
                </select>

                <label>Status</label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value)
                  }
                  style={modalInputStyle}
                >
                  <option value="Available">
                    Available
                  </option>

                  <option value="Unavailable">
                    Unavailable
                  </option>

                  <option value="Maintenance">
                    Maintenance
                  </option>
                </select>

                <div
                  style={{
                    display: 'flex',
                    gap: '10px',
                    marginTop: '15px'
                  }}
                >
                  <button
                    onClick={handleUpdateCharger}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#16a34a',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Update Charger
                  </button>

                  <button
                    onClick={() => setEditingCharger(null)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#64748b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

