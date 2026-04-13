import { lazy } from "react";

// project import
import Loadable from "components/Loadable";
import MinimalLayout from "layout/MinimalLayout";
import { Navigate, useLocation } from "react-router";

// render - login
const AuthLogin = Loadable(lazy(() => import("pages/authentication/login")));
const ErrorPage = Loadable(lazy(() => import("./ErrorPage")));
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
      element: <AuthLogin />,
    },
    {
      path: "/register",
      element: <AuthRegister />,
    },
    {
      path: "/forgotPassword",
      element: <AuthForgotPassword />,
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
      path: "*",
      element: <ErrorPage />,
    },
  ],
};

export default LoginRoutes;
