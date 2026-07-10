import { lazy, Suspense } from "react";
import { Navigate } from "react-router-dom";

// project import
import Loadable from "components/Loadable";
import ProtectedRoute from "./ProtectedRoute";

// Lazy loaded so antd (inside AppProviders) is NOT bundled with the login page
const AppProviders = lazy(() => import("components/AppProviders"));

// All components are now lazy loaded - nothing loads until the route is visited
const Dashboard = Loadable(lazy(() => import("layout/Dashboard")));
const DashboardDefault = Loadable(lazy(() => import("pages/dashboard/index")));
const ProjectView = Loadable(
  lazy(() => import("pages/ProjectView/ProjectView")),
);
const UserListing = Loadable(lazy(() => import("pages/Users/UserListing")));
const ExternalUsers = Loadable(
  lazy(() => import("pages/Users/ExternalUserListing")),
);
const ExternalProjectListing = Loadable(
  lazy(() => import("pages/ExternalProjects/ExternalProjectListing")),
);
const ExternalProjectView = Loadable(
  lazy(() => import("pages/ExternalProjects/ExternalProjectView")),
);
const CreateProjectForm = Loadable(
  lazy(() => import("pages/ProjectCreation/ProjectCreateForm")),
);
const ProfileDetails = Loadable(
  lazy(
    () =>
      import("layout/Dashboard/Header/HeaderContent/Profile/ProfileDetails"),
  ),
);
const ProjectListing = Loadable(
  lazy(() => import("pages/ProjectListing/Listing")),
);
const Payment = Loadable(lazy(() => import("pages/Payment")));
const PaymentHistory = Loadable(
  lazy(() => import("pages/Payment/PaymentHistory")),
);
const CertificateListing = Loadable(
  lazy(() => import("pages/CertificateManager/Listing")),
);
const OrganizationListing = Loadable(
  lazy(() => import("pages/Organization/Listing")),
);
const AdminConfig = Loadable(lazy(() => import("pages/AdminConfig/index")));
const ErrorPage = Loadable(lazy(() => import("pages/extra-pages/404")));
const SamplePage = Loadable(
  lazy(() => import("pages/extra-pages/sample-page")),
);
const Color = Loadable(lazy(() => import("pages/component-overview/color")));
const Typography = Loadable(
  lazy(() => import("pages/component-overview/typography")),
);
const Shadow = Loadable(lazy(() => import("pages/component-overview/shadows")));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: (
    <ProtectedRoute>
      <Suspense fallback={null}>
        <AppProviders>
          <Dashboard />
        </AppProviders>
      </Suspense>
    </ProtectedRoute>
  ),
  children: [
    {
      // Redirect bare "/" to the default dashboard — removes the duplicate
      // DashboardDefault render that was on both "/" and "/dashboard/default"
      index: true,
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "dashboard/default",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "dashboard",
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      ),
    },
    {
      path: "projects",
      element: (
        <ProtectedRoute>
          <ProjectListing />
        </ProtectedRoute>
      ),
    },
    {
      path: "createProject",
      element: (
        <ProtectedRoute>
          <CreateProjectForm />
        </ProtectedRoute>
      ),
    },
    {
      path: "projectView/:id",
      element: (
        <ProtectedRoute>
          <ProjectView />
        </ProtectedRoute>
      ),
    },
    {
      path: "certificateManager",
      element: (
        <ProtectedRoute>
          <CertificateListing />
        </ProtectedRoute>
      ),
    },
    {
      path: "users",
      element: (
        <ProtectedRoute>
          <UserListing />
        </ProtectedRoute>
      ),
    },
    {
      path: "externalUsers",
      element: (
        <ProtectedRoute>
          <ExternalUsers />
        </ProtectedRoute>
      ),
    },
    {
      path: "externalProjects",
      element: (
        <ProtectedRoute>
          <ExternalProjectListing />
        </ProtectedRoute>
      ),
    },
    {
      path: "externalProjectView/:id",
      element: (
        <ProtectedRoute>
          <ExternalProjectView />
        </ProtectedRoute>
      ),
    },
    {
      path: "admin_config",
      element: (
        <ProtectedRoute>
          <AdminConfig />
        </ProtectedRoute>
      ),
    },
    {
      path: "organization",
      element: (
        <ProtectedRoute>
          <OrganizationListing />
        </ProtectedRoute>
      ),
    },
    {
      path: "profileDetails",
      element: (
        <ProtectedRoute>
          <ProfileDetails />
        </ProtectedRoute>
      ),
    },
    {
      path: "payment",
      element: (
        <ProtectedRoute>
          <Payment />
        </ProtectedRoute>
      ),
    },
    {
      path: "payment-history",
      element: (
        <ProtectedRoute>
          <PaymentHistory />
        </ProtectedRoute>
      ),
    },
    {
      path: "documents",
      element: (
        <ProtectedRoute>
          <ErrorPage />
        </ProtectedRoute>
      ),
    },
    {
      path: "reports",
      element: (
        <ProtectedRoute>
          <ErrorPage />
        </ProtectedRoute>
      ),
    },
    // Style demo routes — low traffic, keeping lazy but no ProtectedRoute
    { path: "color", element: <Color /> },
    { path: "shadow", element: <Shadow /> },
    { path: "typography", element: <Typography /> },
    {
      path: "sample-page",
      element: (
        <ProtectedRoute>
          <SamplePage />
        </ProtectedRoute>
      ),
    },
  ],
};

export default MainRoutes;
