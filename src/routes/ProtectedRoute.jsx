import { Navigate, useLocation } from 'react-router-dom';

// ==============================|| PROTECTED ROUTE ||============================== //

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = sessionStorage.getItem('token');
  const resetFlow = sessionStorage.getItem('resetFlow');

  // Allow reset flow pages (OTP, PasswordReset) without a token
  if (!token && !resetFlow) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;