import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const mapContainerStyle = { width: '100%', height: '350px' };
const defaultCenter = { lat: 22.6916, lng: 72.8634 };
const modalInputStyle = { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' };

export default function OwnerDashboard() {
  const [stations, setStations] = useState([]);
  const navigate = useNavigate();

  // --- UI Toggle State ---
  const [activeTab, setActiveTab] = useState('addStation'); // 'addStation' or 'addCharger'

  // --- Deploy Station State ---
  const [stationName, setStationName] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [openingTime, setOpeningTime] = useState('09:00');
  const [closingTime, setClosingTime] = useState('21:00');

  // --- Add Hardware State ---
  const [selectedStation, setSelectedStation] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [chargingSpeed, setChargingSpeed] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [quantity, setQuantity] = useState('');
  const [chargingDuration, setChargingDuration] = useState('');
  
  // --- Station Edit State ---
  const [editingStation, setEditingStation] = useState(null);
  const [editStationName, setEditStationName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editOpeningTime, setEditOpeningTime] = useState('09:00');
  const [editClosingTime, setEditClosingTime] = useState('21:00');

  // --- Charger Edit State ---
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

  const fetchStations = async () => {
    try {
      const response = await API.get('/stations/my-stations');
      setStations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load owner stations:', error);
    }
  };

  useEffect(() => { fetchStations(); }, []);

  // Map Click Handlers
  const handleMapClick = (event) => setLocation({ lat: event.latLng.lat(), lng: event.latLng.lng() });
  const handleEditMapClick = (event) => { setEditLatitude(event.latLng.lat()); setEditLongitude(event.latLng.lng()); };

  // Live Location Handlers
  const handleUseLiveLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by this browser.');
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (error) => alert('Unable to get your current location.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleEditLiveLocation = () => {
    if (!navigator.geolocation) return alert('Geolocation is not supported by this browser.');
    navigator.geolocation.getCurrentPosition(
      (position) => { setEditLatitude(position.coords.latitude); setEditLongitude(position.coords.longitude); },
      (error) => alert('Unable to get your current location.'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // --- STATION CRUD ---
  const handleDeployStation = async () => {
    if (!stationName.trim() || !address.trim() || !location) return alert('Please fill all station fields and select a location.');
    try {
      await API.post('/stations', {
        stationName: stationName.trim(), address: address.trim(),
        latitude: location.lat, longitude: location.lng,
        openingTime, closingTime
      });
      alert('Station deployed successfully!');
      setStationName(''); setAddress(''); setLocation(null); fetchStations();
    } catch (error) { alert('Failed to deploy station: ' + (error.response?.data?.message || 'Server error')); }
  };

  const handleEditStation = (station) => {
    setEditingStation(station);
    setEditStationName(station.stationName || ''); setEditAddress(station.address || '');
    setEditLatitude(station.latitude || ''); setEditLongitude(station.longitude || '');
    setEditOpeningTime(station.openingTime || '09:00'); setEditClosingTime(station.closingTime || '21:00');
  };

  const handleUpdateStation = async () => {
    if (!editStationName.trim() || !editAddress.trim()) return alert('Please enter station name and address.');
    try {
      await API.put(`/stations/${editingStation._id}`, {
        stationName: editStationName.trim(), address: editAddress.trim(),
        latitude: Number(editLatitude), longitude: Number(editLongitude),
        openingTime: editOpeningTime, closingTime: editClosingTime
      });
      alert('Station updated successfully.'); setEditingStation(null); fetchStations();
    } catch (error) { alert('Failed to update station.'); }
  };

  const handleDeleteStation = async (stationID) => {
    if (!window.confirm('Are you sure you want to delete this station? All chargers will also be deleted.')) return;
    try {
      await API.delete(`/stations/${stationID}`); alert('Station deleted successfully.');
      if (selectedStation === stationID) setSelectedStation(''); fetchStations();
    } catch (error) { alert('Failed to delete station.'); }
  };

  // --- CHARGER CRUD ---
  const handleAddCharger = async () => {
    if (!selectedStation || !vehicleType || !chargingSpeed || !pricePerKwh || !chargingDuration || !quantity) return alert('Please fill out all charger fields.');
    if (Number(pricePerKwh) <= 0 || Number(chargingDuration) <= 0) return alert('Values must be greater than 0.');
    try {
      await API.post('/chargers', {
        stationID: selectedStation, vehicleType, chargingSpeed,
        pricePerKwh: Number(pricePerKwh), chargingDuration: Number(chargingDuration), quantity: Number(quantity)
      });
      alert('Charger added successfully!');
      setVehicleType(''); setChargingSpeed(''); setPricePerKwh(''); setChargingDuration(''); fetchStations();
    } catch (error) { alert('Failed to add charger.'); }
  };

  const handleEditCharger = (charger) => {
    setEditingCharger(charger);
    setEditVehicleType(charger.vehicleType || ''); setEditChargingSpeed(charger.chargingSpeed || '');
    setEditPricePerKwh(charger.pricePerKwh || ''); setEditQuantity(charger.quantity || '');
    setEditChargingDuration(charger.chargingDuration || ''); setEditStatus(charger.status || 'Available');
  };

  const handleUpdateCharger = async () => {
    if (!editVehicleType || !editChargingSpeed || !editPricePerKwh || !editQuantity || !editChargingDuration) return alert('Please fill all charger fields.');
    try {
      await API.put(`/chargers/${editingCharger._id}`, {
        vehicleType: editVehicleType, chargingSpeed: editChargingSpeed,
        pricePerKwh: Number(editPricePerKwh), quantity: Number(editQuantity),
        chargingDuration: Number(editChargingDuration), status: editStatus
      });
      alert('Charger updated successfully.'); setEditingCharger(null); fetchStations();
    } catch (error) { alert('Failed to update charger.'); }
  };

  const handleDeleteCharger = async (chargerID) => {
    if (!window.confirm('Are you sure you want to delete this charger?')) return;
    try { await API.delete(`/chargers/${chargerID}`); alert('Charger deleted successfully.'); fetchStations(); } 
    catch (error) { alert('Failed to delete charger.'); }
  };

  if (loadError) return (<div style={{ maxWidth: '900px', margin: '40px auto', padding: '20px' }}><h2>Google Maps could not be loaded</h2></div>);

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 20px' }}>
      <button onClick={() => navigate('/owner-earnings')} style={{ padding: '10px 18px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' }}>
        💰 View Earnings
      </button>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 30px 0' }}>Station Owner Portal</h2>

      {/* ===================================================== */}
      {/* 1. MY INFRASTRUCTURE (Displays Stations & Chargers with Edit/Delete buttons) */}
      {/* ===================================================== */}
      <div>
        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>1. My Infrastructure</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Manage your installed chargers and operational status.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {stations.length === 0 ? (<p style={{ color: '#64748b' }}>No charging stations found.</p>) : (
            stations.map((station) => (
              <div key={station._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden' }}>
                
                {/* Station Info Header */}
                <div style={{ padding: '20px', background: '#ffffff' }}>
                  <h3 style={{ margin: '0 0 5px 0', color: '#2563eb' }}>{station.stationName}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{station.address}</p>
                  <p style={{ margin: '8px 0 0 0', color: '#475569', fontSize: '0.85rem' }}><strong>Latitude:</strong> {station.latitude} | <strong>Longitude:</strong> {station.longitude}</p>
                  <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                    <button onClick={() => handleEditStation(station)} style={{ padding: '8px 14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✏️ Edit Station</button>
                    <button onClick={() => handleDeleteStation(station._id)} style={{ padding: '8px 14px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Delete Station</button>
                  </div>
                </div>

                {/* Installed Chargers List */}
                <div style={{ padding: '20px', borderTop: '1px solid #cbd5e1' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', margin: '0 0 15px 0', textTransform: 'uppercase' }}>Installed Chargers</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '15px' }}>
                    {station.chargers?.length > 0 ? (
                      station.chargers.map((charger) => (
                        <div key={charger._id} style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{charger.chargingSpeed}</h4>
                          <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9rem' }}>Type: {charger.vehicleType}</p>
                          <p style={{ margin: '0', color: '#16a34a', fontWeight: 'bold' }}>₹ {charger.pricePerKwh || 0} / kWh</p>
                          <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '0.85rem' }}>Quantity: {charger.quantity || 1}</p>
                          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                            <button onClick={() => handleEditCharger(charger)} style={{ flex: 1, padding: '8px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>✏️ Edit</button>
                            <button onClick={() => handleDeleteCharger(charger._id)} style={{ flex: 1, padding: '8px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>🗑️ Delete</button>
                          </div>
                        </div>
                      ))
                    ) : ( <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>No chargers installed yet.</p> )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>
      </div>

      <br />

      {/* ===================================================== */}
      {/* 2. NETWORK EXPANSION (Toggle Dropdown) */}
      {/* ===================================================== */}
      <div style={{ marginBottom: '40px', marginTop: '30px' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>2. Network Expansion</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Expand your infrastructure by deploying stations or adding hardware.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

        {/* Action Toggle Box */}
        <div style={{ marginBottom: '25px', padding: '15px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <label style={{ fontWeight: 'bold', color: '#0f172a' }}>What would you like to do?</label>
          <select 
            value={activeTab} 
            onChange={(e) => setActiveTab(e.target.value)}
            style={{ padding: '10px 15px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '1rem', cursor: 'pointer', outline: 'none' }}
          >
            <option value="addStation">Deploy New Station</option>
            <option value="addCharger">Add Charger to Existing Station</option>
          </select>
        </div>

        <div>
          {/* --- FORM A: DEPLOY NEW STATION --- */}
          {activeTab === 'addStation' && (
            <div style={{ border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Deploy New Station</h3>
              <input type="text" placeholder="Station Name" value={stationName} onChange={(e) => setStationName(e.target.value)} style={modalInputStyle} />
              <input type="text" placeholder="Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} style={modalInputStyle} />
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Opening Time</label>
                  <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} style={modalInputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '0.9rem' }}>Closing Time</label>
                  <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} style={modalInputStyle} />
                </div>
              </div>

              <h4 style={{ marginBottom: '10px', color: '#334155' }}>Select Station Location</h4>
              <button onClick={handleUseLiveLocation} style={{ width: '100%', padding: '12px', marginBottom: '15px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📍 Use My Live Location</button>
              
              {!isLoaded ? ( <div style={{ height: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}>Loading Maps...</div> ) : (
                <GoogleMap mapContainerStyle={mapContainerStyle} center={location || defaultCenter} zoom={12} onClick={handleMapClick}>
                  {location && <Marker position={location} />}
                </GoogleMap>
              )}

              {location && (
                <div style={{ marginTop: '15px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                  <p style={{ margin: '0 0 5px 0', color: '#166534' }}><strong>Selected Location</strong></p>
                  <p style={{ margin: '5px 0', color: '#334155' }}><strong>Lat:</strong> {location.lat.toFixed(6)} | <strong>Lng:</strong> {location.lng.toFixed(6)}</p>
                </div>
              )}
              <button onClick={handleDeployStation} style={{ width: '100%', padding: '12px', marginTop: '20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Deploy Station</button>
            </div>
          )}

          {/* --- FORM B: ADD CHARGER --- */}
          {activeTab === 'addCharger' && (
            <div style={{ border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', maxWidth: '600px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Add Charger to Station</h3>
              <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} style={modalInputStyle}>
                <option value="">-- Select a Station --</option>
                {stations.map((station) => (<option key={station._id} value={station._id}>{station.stationName}</option>))}
              </select>
              <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={modalInputStyle}>
                <option value="" disabled>Vehicle Type</option>
                <option value="Two-Wheeler">Two-Wheeler</option>
                <option value="Three-Wheeler">Three-Wheeler</option>
                <option value="Four-Wheeler">Four-Wheeler</option>
              </select>
              <input type="text" placeholder="Speed (e.g., 50kW Fast)" value={chargingSpeed} onChange={(e) => setChargingSpeed(e.target.value)} style={modalInputStyle} />
              
              <div style={{ display: 'flex', gap: '15px' }}>
                <input type="number" placeholder="Price / kWh (₹)" value={pricePerKwh} onChange={(e) => setPricePerKwh(e.target.value)} style={modalInputStyle} />
                <input type="number" placeholder="Quantity" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={modalInputStyle} />
              </div>

              <select value={chargingDuration} onChange={(e) => setChargingDuration(e.target.value)} style={modalInputStyle}>
                <option value="" disabled>Charging Duration</option>
                <option value="30">30 Minutes</option>
                <option value="60">1 Hour</option>
                <option value="90">1 Hour 30 Minutes</option>
                <option value="120">2 Hours</option>
              </select>
              <button onClick={handleAddCharger} style={{ width: '100%', padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>Add Charger</button>
            </div>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* MODALS FOR EDITING */}
      {/* ===================================================== */}

      {/* --- EDIT STATION MODAL --- */}
      {editingStation && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '500px', padding: '25px', borderRadius: '10px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Edit Station</h2>
            <input type="text" placeholder="Station Name" value={editStationName} onChange={(e) => setEditStationName(e.target.value)} style={modalInputStyle} />
            <input type="text" placeholder="Address" value={editAddress} onChange={(e) => setEditAddress(e.target.value)} style={modalInputStyle} />
            
            <h4 style={{ marginBottom: '10px', color: '#334155' }}>Select Station Location</h4>
            <button onClick={handleEditLiveLocation} style={{ width: '100%', padding: '12px', marginBottom: '15px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>📍 Use My Live Location</button>
            
            {isLoaded ? (
              <GoogleMap mapContainerStyle={{ width: '100%', height: '250px' }} center={{ lat: Number(editLatitude) || defaultCenter.lat, lng: Number(editLongitude) || defaultCenter.lng }} zoom={14} onClick={handleEditMapClick}>
                {editLatitude && editLongitude && (<Marker position={{ lat: Number(editLatitude), lng: Number(editLongitude) }} />)}
              </GoogleMap>
            ) : (<div style={{ height: '250px', background: '#f1f5f9' }}>Loading Maps...</div>)}

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <div style={{ flex: 1 }}>
                <label>Opening Time</label>
                <input type="time" value={editOpeningTime} onChange={(e) => setEditOpeningTime(e.target.value)} style={modalInputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label>Closing Time</label>
                <input type="time" value={editClosingTime} onChange={(e) => setClosingTime(e.target.value)} style={modalInputStyle} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleUpdateStation} style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Station</button>
              <button onClick={() => setEditingStation(null)} style={{ flex: 1, padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT CHARGER MODAL --- */}
      {editingCharger && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', width: '90%', maxWidth: '500px', padding: '25px', borderRadius: '10px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2>Edit Charger</h2>
            <label>Vehicle Type</label>
            <select value={editVehicleType} onChange={(e) => setEditVehicleType(e.target.value)} style={modalInputStyle}>
              <option value="Two-Wheeler">Two-Wheeler</option>
              <option value="Three-Wheeler">Three-Wheeler</option>
              <option value="Four-Wheeler">Four-Wheeler</option>
            </select>
            <label>Charging Speed</label>
            <input type="text" placeholder="Charging Speed" value={editChargingSpeed} onChange={(e) => setEditChargingSpeed(e.target.value)} style={modalInputStyle} />
            <label>Price per kWh (₹)</label>
            <input type="number" placeholder="Price per kWh" value={editPricePerKwh} onChange={(e) => setEditPricePerKwh(e.target.value)} style={modalInputStyle} />
            <label>Quantity</label>
            <input type="number" min="1" placeholder="Quantity" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} style={modalInputStyle} />
            <label>Charging Duration (Mins)</label>
            <select value={editChargingDuration} onChange={(e) => setEditChargingDuration(e.target.value)} style={modalInputStyle}>
              <option value="30">30 Minutes</option>
              <option value="60">1 Hour</option>
              <option value="90">1 Hour 30 Minutes</option>
              <option value="120">2 Hours</option>
            </select>
            <label>Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} style={modalInputStyle}>
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Maintenance">Maintenance</option>
            </select>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button onClick={handleUpdateCharger} style={{ flex: 1, padding: '10px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Update Charger</button>
              <button onClick={() => setEditingCharger(null)} style={{ flex: 1, padding: '10px', background: '#64748b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}