import { lazy } from "react";

// project import
import Loadable from "components/Loadable";
import Dashboard from "layout/Dashboard";
import ProjectForm from "pages/ProjectCreation";
import ProjectView from "pages/ProjectView/ProjectView";
import UserListing from "pages/Users/UserListing";
import ProtectedRoute from "./ProtectedRoute";
import ProfileDetails from "layout/Dashboard/Header/HeaderContent/Profile/ProfileDetails";
import ExternalUsers from "pages/Users/ExternalUserListing";

const Color = Loadable(lazy(() => import("pages/component-overview/color")));
const Typography = Loadable(
  lazy(() => import("pages/component-overview/typography"))
);
const Shadow = Loadable(lazy(() => import("pages/component-overview/shadows")));
const DashboardDefault = Loadable(lazy(() => import("pages/dashboard/index")));
const ProjectListing = Loadable(
  lazy(() => import("pages/ProjectListing/Listing"))
);
const CertificateListing = Loadable(
  lazy(() => import("pages/CertificateManager/Listing"))
);
const OrganizationListing = Loadable(
  lazy(() => import("pages/Organization/Listing"))
);

const AdminConfig = Loadable(lazy(() => import("pages/AdminConfig/index")));

const ErrorPage = Loadable(lazy(() => import("pages/extra-pages/404")));

// render - sample page
const SamplePage = Loadable(
  lazy(() => import("pages/extra-pages/sample-page"))
);

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: "/",
  element: (
    <ProtectedRoute>
      <Dashboard />
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
          <ProjectForm />
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
  ],
};

export default MainRoutes;
