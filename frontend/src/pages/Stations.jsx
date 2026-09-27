import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function Stations() {
  const [stations, setStations] = useState([]);

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
    <div style={{ fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px' }}>Available Charging Stations</h2>
      <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        {stations.map(station => (
          <div key={station._id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>{station.stationName}</h3>
            <p>{station.address}</p>
            <button style={{ padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              View Chargers
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}