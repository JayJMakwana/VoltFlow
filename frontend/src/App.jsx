import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login'; 
import Register from './pages/Register'; 
import Stations from './pages/Stations';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<h2>Welcome to VoltFlow: Reserve EV Charging Slots</h2>} />
          
          {/* Replace the placeholder with the actual component */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stations" element={<Stations />} />
          <Route path="/stations/:id" element={<Booking />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/owner-dashboard" element={<OwnerDashboard />} />

        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;