import { Navigate } from 'react-router-dom';
import { AuthContext } from 'context';
import { useContext } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, role } = useContext(AuthContext);
  const currentPath = window.location.pathname;

  // If user is not logged in, redirect to login for both admin and dashboard routes
  if (!isAuthenticated && (currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard'))) {
    return <Navigate to="/auth/login" />;
  }

  // If trying to access admin routes but not an admin, redirect to dashboard
  if (currentPath.startsWith('/admin') && role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default ProtectedRoute; 