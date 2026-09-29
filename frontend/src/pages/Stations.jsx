import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Stations() {
  const [stations, setStations] = useState([]);
  const navigate = useNavigate(); // Initialize the router navigation hook

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await API.get('/stations');
        setStations(response.data.data);
      } catch (error) {
        console.error('Failed to load stations');
      }
    };
    fetchStations();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '1000px', margin: '40px auto' }}>
      <h2 style={{ marginBottom: '20px' }}>Available Charging Stations</h2>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {stations.map(station => (
          <div key={station._id} style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f8fafc' }}>
            <h3 style={{ marginTop: 0, color: '#0f172a' }}>{station.stationName}</h3>
            <p style={{ color: '#475569', marginBottom: '20px' }}>{station.address}</p>
            
            {/* The button now navigates to the dynamic booking route */}
            <button 
              onClick={() => navigate(`/stations/${station._id}`)}
              style={{ padding: '10px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              View Chargers
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}