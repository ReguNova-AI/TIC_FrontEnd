import { lazy, Suspense } from "react";

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
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      ),
    },
    {
      path: "color",
      element: <Color />,
    },
    {
      path: "dashboard",
      children: [
        {
          path: "default",
          element: (
            <ProtectedRoute>
              <DashboardDefault />
            </ProtectedRoute>
          ),
        },
      ],
    },
    {
      path: "sample-page",
      element: (
        <ProtectedRoute>
          <SamplePage />
        </ProtectedRoute>
      ),
    },
    {
      path: "shadow",
      element: <Shadow />,
    },
    {
      path: "typography",
      element: <Typography />,
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
      path: "documents",
      element: <ErrorPage />,
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
      path: "reports",
      element: (
        <ProtectedRoute>
          <ErrorPage />
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
  ],
};

export default MainRoutes;
