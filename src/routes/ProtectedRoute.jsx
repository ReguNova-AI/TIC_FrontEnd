import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { authInfo, loading } = useSelector((state) => state.auth);

  // Wait for rehydrateAuth to finish before making a redirect decision
  if (loading) return null; // or <PageLoader /> if you have one

  if (!authInfo) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
