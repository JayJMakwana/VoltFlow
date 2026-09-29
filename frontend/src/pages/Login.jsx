import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', { email, password });
      
      // Store the JWT token and the user role
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role || response.data.user?.role);
      
      window.location.href = '/stations';
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || 'Server error'));
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '20px' }}>User Login</h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="email" 
          placeholder="Email address" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          style={{ padding: '10px', fontSize: '16px' }}
          required 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={{ padding: '10px', fontSize: '16px' }}
          required 
        />
        <button type="submit" style={{ padding: '12px', background: '#4ade80', color: '#1e293b', fontWeight: 'bold', fontSize: '16px', border: 'none', cursor: 'pointer' }}>
          Login
        </button>
      </form>
    </div>
  );
}