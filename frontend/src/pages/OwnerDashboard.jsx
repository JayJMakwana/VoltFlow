import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function OwnerDashboard() {
  const [stations, setStations] = useState([]);
  
  // Deploy Station State
  const [stationName, setStationName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  // Add Hardware State
  const [selectedStation, setSelectedStation] = useState('');
  const [vehicleType, setVehicleType] = useState('Four-Wheeler');
  const [chargingSpeed, setChargingSpeed] = useState('');
  const [pricePerKwh, setPricePerKwh] = useState('');
  const [quantity, setQuantity] = useState(1);

  const fetchStations = async () => {
    try {
      const response = await API.get('/stations');
      // For a real app, ensure backend filters to only return req.user's stations
      setStations(response.data.data || []); 
    } catch (error) {
      console.error('Failed to load stations', error);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleDeployStation = async () => {
    try {
      await API.post('/stations', {
        stationName,
        address,
        latitude: Number(lat),
        longitude: Number(lng)
      });
      alert('Station deployed successfully!');
      setStationName(''); setAddress(''); setLat(''); setLng('');
      fetchStations();
    } catch (error) {
      alert('Failed to deploy station: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleAddHardware = async () => {
    if (!selectedStation || !chargingSpeed || !pricePerKwh) {
      alert('Please fill out all hardware fields.');
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
      alert('Hardware added successfully!');
      setChargingSpeed(''); setPricePerKwh(''); setQuantity(1);
      fetchStations(); 
    } catch (error) {
      alert('Failed to add hardware: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'left', padding: '0 20px' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 30px 0' }}>Station Owner Portal</h2>

      {/* --- 1. MY INFRASTRUCTURE --- */}
      <div>
        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>1. My Infrastructure</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Manage your installed chargers and operational status.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {stations.map(station => (
            <div key={station._id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', background: '#f8fafc', overflow: 'hidden' }}>
              
              <div style={{ padding: '20px', background: '#ffffff' }}>
                <h3 style={{ margin: '0 0 5px 0', color: '#2563eb' }}>{station.stationName}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>{station.address}</p>
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid #cbd5e1' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', margin: '0 0 15px 0', textTransform: 'uppercase' }}>
                  Installed Chargers for {station.stationName}
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                  {station.chargers?.length > 0 ? (
                    station.chargers.map(charger => (
                      <div key={charger._id} style={{ border: '1px solid #cbd5e1', padding: '15px', borderRadius: '6px', background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#0f172a' }}>{charger.chargingSpeed}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#64748b', fontSize: '0.9rem' }}>Type: {charger.vehicleType}</p>
                        
                        <p style={{ margin: '0', color: '#16a34a', fontWeight: 'bold' }}>
                          ₹ {charger.pricePerKwh || 0} / kWh
                        </p>
                        <p style={{ margin: '5px 0 0 0', color: '#475569', fontSize: '0.85rem' }}>
                          Quantity: {charger.quantity || 1}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, gridColumn: 'span 3' }}>No chargers installed yet.</p>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
      <br/>
      {/* --- 2. NETWORK EXPANSION (Side by Side Forms) --- */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>2. Network Expansion</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: 0 }}>Deploy new physical locations or add chargers to existing hubs.</p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '15px 0 20px 0' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
          
          {/* Form A: Deploy New Station */}
          <div style={{ border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Deploy New Station</h3>
            <input type="text" placeholder="Station Name" value={stationName} onChange={(e) => setStationName(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            <input type="text" placeholder="Physical Address" value={address} onChange={(e) => setAddress(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <input type="number" placeholder="Lat (e.g. 23.03)" value={lat} onChange={(e) => setLat(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              <input type="number" placeholder="Lng (e.g. 72.58)" value={lng} onChange={(e) => setLng(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleDeployStation} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              Deploy Station
            </button>
          </div>

          {/* Form B: Add Hardware */}
          <div style={{ border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px', background: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#0f172a' }}>Add Hardware to Station</h3>
            <select value={selectedStation} onChange={(e) => setSelectedStation(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="">-- Select a Station --</option>
              {stations.map(station => <option key={station._id} value={station._id}>{station.stationName}</option>)}
            </select>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <option value="Two-Wheeler">Two-Wheeler</option>
              <option value="Three-Wheeler">Three-Wheeler</option>
              <option value="4-Wheeler (CCS2)">4-Wheeler (CCS2)</option>
            </select>
            <input type="text" placeholder="Speed (e.g., 50kW Fast)" value={chargingSpeed} onChange={(e) => setChargingSpeed(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <input type="number" placeholder="Price per kWh (₹)" value={pricePerKwh} onChange={(e) => setPricePerKwh(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
              <input type="number" placeholder="Quantity" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <button onClick={handleAddHardware} style={{ width: '100%', padding: '12px', background: '#22c55e', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
              Add Hardware
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}