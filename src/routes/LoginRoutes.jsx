import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MinimalLayout from 'layout/MinimalLayout';
import ProtectedRoute from './ProtectedRoute';
import ErrorPage from './ErrorPage';

// render - login
const AuthLogin = Loadable(lazy(() => import('pages/authentication/login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/register')));
const AuthForgotPassword = Loadable(lazy(() => import('pages/authentication/ForgotPassword')));
const AuthOTP = Loadable(lazy(() => import('pages/authentication/OTP')));
const AuthPasswordReset = Loadable(lazy(() => import('pages/authentication/PasswordReset')));


// ==============================|| AUTH ROUTING ||============================== //

const LoginRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: '/login',
      element: <AuthLogin />
    },
    {
      path: '/register',
      element: <AuthRegister />
    },
    {
      path: '/forgotPassword',
      element: <AuthForgotPassword />
    },
    {
      path: '/otp',
      element: <ProtectedRoute><AuthOTP /></ProtectedRoute>
    },
    {
      path: '/passwordReset',
      element: <ProtectedRoute><AuthPasswordReset /></ProtectedRoute>
    },
    {
      path: '*',
      element: <ErrorPage />
    }
  ]
};

export default LoginRoutes;
