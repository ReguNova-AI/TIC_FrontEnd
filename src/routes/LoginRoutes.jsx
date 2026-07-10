import { lazy } from "react";

// project import
import Loadable from "components/Loadable";
import MinimalLayout from "layout/MinimalLayout";
import { Navigate, useLocation } from "react-router";
import { useSelector } from "react-redux";

// render - login
const AuthLogin = Loadable(lazy(() => import("pages/authentication/login")));
const ErrorPage = Loadable(lazy(() => import("./ErrorPage")));
const PaymentSuccess = Loadable(lazy(() => import("pages/Payment/PaymentSuccess")));
const AuthRegister = Loadable(
  lazy(() => import("pages/authentication/register")),
);
const AuthForgotPassword = Loadable(
  lazy(() => import("pages/authentication/ForgotPassword")),
);
const AuthOTP = Loadable(lazy(() => import("pages/authentication/OTP")));
const AuthPasswordReset = Loadable(
  lazy(() => import("pages/authentication/PasswordReset")),
);

const PublicRoute = ({ children }) => {
  const { authInfo, loading } = useSelector((state) => state.auth);

  if (loading) return null; // wait for rehydrateAuth to finish

  if (authInfo) {
    console.log(authInfo, "authInfo");

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ResetFlowRoute = ({ children }) => {
  const location = useLocation();
  const resetFlow = sessionStorage.getItem("resetFlow");
  const email = sessionStorage.getItem("email");

  if (!resetFlow || !email) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: "/",
  element: <MinimalLayout />,
  children: [
    {
      path: "/login",
      element: (
        <PublicRoute>
          <AuthLogin />
        </PublicRoute>
      ),
    },
    {
      path: "/register",
      element: (
        <PublicRoute>
          <AuthRegister />
        </PublicRoute>
      ),
    },
    {
      path: "/forgotPassword",
      element: (
        <PublicRoute>
          <AuthForgotPassword />
        </PublicRoute>
      ),
    },
    {
      path: "/otp",
      element: (
        <ResetFlowRoute>
          <AuthOTP />
        </ResetFlowRoute>
      ),
    },
    {
      path: "/passwordReset",
      element: (
        <ResetFlowRoute>
          <AuthPasswordReset />
        </ResetFlowRoute>
      ),
    },
    {
      path: "/payment/success",
      element: <PaymentSuccess />,
    },
    {
      path: "*",
      element: <ErrorPage />,
    },
  ],
};

export default LoginRoutes;
