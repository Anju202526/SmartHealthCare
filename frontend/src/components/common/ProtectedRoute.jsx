import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to the correct dashboard for the user's actual role
    const roleHome = {
      patient: '/patient/dashboard',
      doctor:  '/doctor/dashboard',
      admin:   '/admin/dashboard',
    };
    return <Navigate to={roleHome[user?.role] || '/login'} replace />;
  }

  return children;
};

export default ProtectedRoute;
