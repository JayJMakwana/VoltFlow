import { useState } from 'react';
import API from '../api/axios';

export default function OwnerDashboard() {
  const [formData, setFormData] = useState({
    stationName: '', address: '', latitude: '', longitude: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateStation = async (e) => {
    e.preventDefault();
    try {
      // Ensure coordinates are sent as numbers, not strings
      const payload = {
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude)
      };
      
      const response = await API.post('/stations', payload);
      alert(`Station created successfully! ID: ${response.data.data._id}`);
      
      // Clear the form
      setFormData({ stationName: '', address: '', latitude: '', longitude: '' });
    } catch (error) {
      alert('Creation failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2>Station Owner Portal</h2>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
        <h3 style={{ marginTop: 0 }}>Add New Charging Station</h3>
        <form onSubmit={handleCreateStation} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
          <input type="text" name="stationName" placeholder="Station Name" value={formData.stationName} onChange={handleChange} style={{ padding: '10px' }} required />
          <input type="text" name="address" placeholder="Physical Address" value={formData.address} onChange={handleChange} style={{ padding: '10px' }} required />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" step="any" name="latitude" placeholder="Latitude (e.g., 23.033)" value={formData.latitude} onChange={handleChange} style={{ padding: '10px', width: '100%' }} required />
            <input type="number" step="any" name="longitude" placeholder="Longitude (e.g., 72.585)" value={formData.longitude} onChange={handleChange} style={{ padding: '10px', width: '100%' }} required />
          </div>
          
          <button type="submit" style={{ padding: '12px', background: '#3b82f6', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Deploy Station
          </button>
        </form>
      </div>
    </div>
  );
}