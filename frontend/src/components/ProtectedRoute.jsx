import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  // If a session token exists, allow access. Otherwise, redirect to login.
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}