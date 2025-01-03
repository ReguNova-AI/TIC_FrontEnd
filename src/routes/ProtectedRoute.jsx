import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  
  // Check if user is authenticated or has necessary data for the protected route
  if (!sessionStorage.getItem("token") && (sessionStorage.getItem("resetFlow") === null || sessionStorage.getItem("reset") === "" || sessionStorage.getItem("reset") === undefined)) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} />;
  }
  if(!sessionStorage.getItem("token") && sessionStorage.getItem("resetFlow") === null)
  {
    return <Navigate to="/login" />;
  }
  // Allow access to the page if authenticated
  return children;
};

export default ProtectedRoute;
