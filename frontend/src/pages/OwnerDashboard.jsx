import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function OwnerDashboard() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [stationChargers, setStationChargers] = useState([]);
  const [loadingChargers, setLoadingChargers] = useState(false);

  const [stationData, setStationData] = useState({ stationName: '', address: '', latitude: '', longitude: '' });
  const [chargerData, setChargerData] = useState({ stationID: '', vehicleType: 'Four-Wheeler', chargingSpeed: '50kW Fast', pricePerKwh: '' });

  const fetchStations = async () => {
    try {
      const response = await API.get('/stations');
      setStations(response.data.data || []);
    } catch (error) {
      console.error('Failed to load stations');
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleStationClick = async (stationId) => {
    // If clicking the already selected station, toggle it closed
    if (selectedStationId === stationId) {
      setSelectedStationId(null);
      setStationChargers([]);
      return;
    }

    setSelectedStationId(stationId);
    setLoadingChargers(true);
    try {
      const res = await API.get(`/chargers/station/${stationId}`);
      setStationChargers(res.data.data || []);
    } catch (error) {
      console.error('Failed to load station chargers');
      setStationChargers([]);
    } finally {
      setLoadingChargers(false);
    }
  };

  const handleStationChange = (e) => setStationData({ ...stationData, [e.target.name]: e.target.value });
  const handleChargerChange = (e) => setChargerData({ ...chargerData, [e.target.name]: e.target.value });

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...stationData,
        latitude: parseFloat(stationData.latitude),
        longitude: parseFloat(stationData.longitude)
      };
      await API.post('/stations', payload);
      alert('Station deployed successfully!');
      setStationData({ stationName: '', address: '', latitude: '', longitude: '' });
      fetchStations();
    } catch (error) {
      alert('Station creation failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  const handleCreateCharger = async (e) => {
    e.preventDefault();
    if (!chargerData.stationID) return alert('Please select a station first.');
    try {
      const payload = { ...chargerData, pricePerKwh: parseFloat(chargerData.pricePerKwh) };
      await API.post('/chargers', payload);
      alert('Hardware successfully added to the station!');
      
      // If adding a charger to the currently inspected station, refresh its list immediately
      if (selectedStationId === chargerData.stationID) {
        handleStationClick(chargerData.stationID);
      }

      setChargerData({ ...chargerData, vehicleType: 'Four-Wheeler', chargingSpeed: '50kW Fast', pricePerKwh: '' });
    } catch (error) {
      alert('Charger creation failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', fontFamily: 'sans-serif', textAlign: 'left', width: '100%' }}>
      <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0 0 10px 0' }}>Station Owner Portal</h2>
      <hr style={{ border: 'none', borderTop: '2px solid #e2e8f0', margin: '15px 0 30px 0' }} />
      
      {/* 1. Infrastructure Overview */}
      <div style={{ marginBottom: '45px' }}>
        <h3 style={{ color: '#0f172a', margin: '0 0 6px 0' }}>1. My Infrastructure</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 15px 0' }}>
          Click on any station card below to view its installed chargers and operational status.
        </p>
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0 20px 0' }} />

        {stations.length === 0 ? (
          <div style={{ padding: '20px', background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '8px', color: '#64748b' }}>
            No stations registered yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {stations.map(station => {
              const isSelected = selectedStationId === station._id;
              return (
                <div 
                  key={station._id} 
                  style={{ 
                    border: isSelected ? '2px solid #2563eb' : '1px solid #cbd5e1', 
                    borderRadius: '8px', 
                    background: '#ffffff', 
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)' 
                  }}>
                  <div 
                    onClick={() => handleStationClick(station._id)} 
                    style={{ padding: '20px', cursor: 'pointer', background: isSelected ? '#eff6ff' : '#ffffff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: '0 0 6px 0', color: '#1e40af', fontSize: '1.15rem' }}>{station.stationName}</h4>
                      <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 'bold' }}>
                        {isSelected ? '▲ Hide Chargers' : '▼ View Chargers'}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 6px 0', fontSize: '0.95rem', color: '#475569' }}>{station.address}</p>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8' }}>ID: {station._id}</p>
                  </div>

                  {/* Expanded Charger List Panel */}
                  {isSelected && (
                    <div style={{ padding: '20px', borderTop: '1px solid #bfdbfe', background: '#f8fafc' }}>
                      <h5 style={{ margin: '0 0 12px 0', color: '#334155', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.05em' }}>
                        Installed Chargers for {station.stationName}
                      </h5>

                      {loadingChargers ? (
                        <p style={{ margin: 0, color: '#64748b' }}>Loading charger hardware...</p>
                      ) : stationChargers.length === 0 ? (
                        <p style={{ margin: 0, color: '#dc2626', fontSize: '0.9rem' }}>
                          No chargers added to this station yet. Use Task 2 below to install a charger.
                        </p>
                      ) : (
                        <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                          {stationChargers.map(charger => (
                            <div key={charger._id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px' }}>
                              <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', color: '#0f172a' }}>{charger.chargingSpeed}</p>
                              <p style={{ margin: '0 0 4px 0', fontSize: '0.85rem', color: '#475569' }}>Type: {charger.vehicleType}</p>
                              <p style={{ margin: 0, fontSize: '0.85rem', color: '#16a34a', fontWeight: '600' }}>₹{charger.pricePerKwh} / kWh</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Network Expansion Section */}
      <h3 style={{ color: '#0f172a', margin: '0 0 6px 0' }}>2. Network Expansion</h3>
      <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 15px 0' }}>Deploy new physical locations or add chargers to existing hubs.</p>
      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '10px 0 25px 0' }} />

      <div style={{ display: 'grid', gap: '25px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
        {/* Task 1 Form */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, color: '#0f172a' }}>Deploy New Station</h4>
          <form onSubmit={handleCreateStation} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" name="stationName" placeholder="Station Name" value={stationData.stationName} onChange={handleStationChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <input type="text" name="address" placeholder="Physical Address" value={stationData.address} onChange={handleStationChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" step="any" name="latitude" placeholder="Lat (e.g. 23.03)" value={stationData.latitude} onChange={handleStationChange} style={{ padding: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} required />
              <input type="number" step="any" name="longitude" placeholder="Lng (e.g. 72.58)" value={stationData.longitude} onChange={handleStationChange} style={{ padding: '10px', width: '100%', border: '1px solid #ccc', borderRadius: '4px' }} required />
            </div>
            <button type="submit" style={{ padding: '12px', background: '#2563eb', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Deploy Station</button>
          </form>
        </div>

        {/* Task 2 Form */}
        <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '25px', borderRadius: '8px' }}>
          <h4 style={{ marginTop: 0, color: '#0f172a' }}>Add Hardware to Station</h4>
          <form onSubmit={handleCreateCharger} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <select name="stationID" value={chargerData.stationID} onChange={handleChargerChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }} required>
              <option value="">-- Select a Station --</option>
              {stations.map(station => (
                <option key={station._id} value={station._id}>{station.stationName}</option>
              ))}
            </select>
            <select name="vehicleType" value={chargerData.vehicleType} onChange={handleChargerChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', background: 'white' }} required>
              <option value="Two-Wheeler">Two-Wheeler</option>
              <option value="Three-Wheeler">Three-Wheeler</option>
              <option value="Four-Wheeler">Four-Wheeler</option>
            </select>
            <input type="text" name="chargingSpeed" placeholder="Speed (e.g., 50kW Fast)" value={chargerData.chargingSpeed} onChange={handleChargerChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <input type="number" step="any" name="pricePerKwh" placeholder="Price per kWh (₹)" value={chargerData.pricePerKwh} onChange={handleChargerChange} style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }} required />
            <button type="submit" style={{ padding: '12px', background: '#10b981', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add Hardware</button>
          </form>
        </div>
      </div>
    </div>
  );
}