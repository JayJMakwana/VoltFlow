import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Stations from './pages/Stations';
import Booking from './pages/Booking';
import Dashboard from './pages/Dashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/stations" element={<Stations />} />

          {/* Protected Routes (Requires Authentication to Book or View Dashboards) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/stations/:id" element={<Booking />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;