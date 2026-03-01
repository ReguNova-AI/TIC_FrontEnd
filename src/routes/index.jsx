import { createBrowserRouter } from 'react-router-dom';

// project import
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';

const RouterErrorFallback = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif'
  }}>
    <h2>Something went wrong</h2>
    <a href="/login">Go to Login</a>
  </div>
);

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [MainRoutes, LoginRoutes],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME,
    errorElement: <RouterErrorFallback />
  }
);

export default router;