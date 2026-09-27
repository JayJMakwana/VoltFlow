import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'EVUser'
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', formData);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px' }}>Create an Account</h2>
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input type="text" name="name" placeholder="Full Name" onChange={handleChange} style={{ padding: '10px' }} required />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} style={{ padding: '10px' }} required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} style={{ padding: '10px' }} required />
        <input type="text" name="phone" placeholder="Phone Number" onChange={handleChange} style={{ padding: '10px' }} required />
        <select name="role" onChange={handleChange} style={{ padding: '10px' }}>
          <option value="EVUser">EV Driver</option>
          <option value="StationOwner">Station Owner</option>
        </select>
        <button type="submit" style={{ padding: '12px', background: '#4ade80', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>Register</button>
      </form>
    </div>
  );
}