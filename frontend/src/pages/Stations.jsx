import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const [filterType, setFilterType] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await API.get('/stations');
        setStations(response.data.data || []);
      } catch (error) {
        console.error('Failed to load stations');
      }
    };
    fetchStations();
  }, []);

  // Filter stations: Keep station ONLY if it contains a charger of the selected type
  const filteredStations = stations.filter(station => {
    if (filterType === 'All') return true;
    
    // Check if at least one charger in this station matches the vehicleType
    return station.chargers?.some(charger => 
      charger.vehicleType?.toLowerCase().includes(filterType.toLowerCase())
    );
  });

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
      <h2 style={{ marginBottom: '15px', color: '#0f172a' }}>Available Charging Stations</h2>

      {/* Vehicle Type Filter Bar */}
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {['All', 'Two-Wheeler', 'Three-Wheeler', 'Four-Wheeler'].map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
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

      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {filteredStations.map(station => (
          <div key={station._id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '8px', background: '#f8fafc' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>{station.stationName}</h3>
            <p style={{ color: '#475569', marginBottom: '20px' }}>{station.address}</p>
            
            {/* Pass the selected filter via router state so the next page knows what we selected */}
            <button 
              onClick={() => navigate(`/stations/${station._id}`, { state: { defaultFilter: filterType } })}
              style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
              View Chargers
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}