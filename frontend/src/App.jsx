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
import Feedback from './pages/Feedback';
import Bill from './pages/Bill';
import OwnerEarnings from './pages/OwnerEarnings';
import AdminDashboard from './pages/AdminDashboard';
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
            <Route
            path="/feedback/:stationId"
            element={<Feedback />}
            />
            <Route
              path="/bill/:bookingID"
              element={<Bill />}
            />
            <Route
              path="/owner-earnings"
              element={<OwnerEarnings />}
            />
            <Route
              path="/admin-dashboard"
              element={<AdminDashboard />}
            />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;