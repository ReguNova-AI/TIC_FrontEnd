# TIC_FrontEnd Project Overview

## Project Description

This is a React-based frontend application named "Grid Conform" (version 1.3.0), built with Vite. It appears to be a project management and certificate management system, possibly related to grid conformity or compliance in an industry context (given the IEC PDFs in assets).

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **State Management**: Redux with Redux Thunk
- **Routing**: React Router v6
- **UI Libraries**: Material-UI (MUI), Ant Design
- **Charts**: ApexCharts, ECharts
- **HTTP Client**: Axios
- **Forms**: Formik with Yup validation
- **Styling**: Styled Components, Emotion
- **Animations**: Framer Motion
- **Notifications**: Notistack
- **Other**: Lodash, SWR for data fetching, React Query

## Project Structure

### Root Files

- `package.json`: Project dependencies and scripts
- `vite.config.mjs`: Vite configuration with React plugin, aliases, and dev server settings
- `tsconfig.node.json`, `jsconfig.json`: TypeScript/JavaScript configuration
- `index.html`: Main HTML file
- `README.md`: Default Create React App README (outdated, as project uses Vite)

### src/

- `App.jsx`: Main app component with providers (Theme, Snackbar, Redux, Router)
- `index.jsx`: Entry point rendering App to DOM
- `reportWebVitals.js`: Web vitals reporting
- `vite-env.d.js`: Vite environment types

#### api/

- `menu.js`: Menu-related API hooks

#### assets/

- PDFs: IEC standards documents
- `images/`: Icons, logos, and other images
- `third-party/`: Third-party CSS (e.g., ApexCharts)

#### components/

Reusable UI components:

- `@extended/`: Extended components like Avatar, Breadcrumbs, Transitions
- `cards/`: Card components
- `chatbot/`: Chatbot UI components
- `form/`: Form components (e.g., MultiSelectWithChip)
- `hooks/`: Custom hooks for data fetching (e.g., useProjects, useOrganizations)
- `logo/`: Logo components
- `modal/`: Modal components
- `third-party/`: Third-party components (e.g., SimpleBar)
- Other: Loadable, Loader, MainCard, ScrollTop, AssessmentHistoryTable

#### contexts/

- `auth-reducer/`: Authentication context with actions and reducer

#### layout/

- `Dashboard/`: Main dashboard layout with Header, Drawer, and content area

#### menu-items/

- Menu configuration for navigation (dashboard, projects, certificates, users, etc.)

#### pages/

Main application pages:

- `AdminConfig/`: Admin configuration page
- `CertificateManager/`: Certificate listing and creation
- `ExternalProjects/`: External project management
- `Organization/`: Organization management
- `ProjectCreation/`: Project creation forms
- `ProjectListing/`: Project listing
- `ProjectView/`: Project details view
- `Users/`: User management (internal and external)
- `authentication/`: Login/authentication pages
- `component-overview/`: Component demos (color, typography, shadows)
- `dashboard/`: Dashboard default page
- `extra-pages/`: 404 error page, sample page

#### routes/

- `index.jsx`: Main router configuration
- `MainRoutes.jsx`: Protected main routes
- `LoginRoutes.jsx`: Authentication routes
- `ProtectedRoute.jsx`: Route protection component
- `ErrorPage.jsx`: Error boundary

#### services/

- `SessionService.js`: Session management
- `api/`: API service classes (e.g., CertificateAPIService, FileUploadAPIService)

#### shared/

- `constants.js`: Application constants (messages, labels, statuses)
- `utility.js`: Utility functions (date formatting, status helpers)

#### store/

Redux store configuration:

- `index.js`: Store setup
- `actions/`: Redux actions
- `reducers/`: Redux reducers

#### themes/

Theme customization:

- `index.jsx`: Theme provider
- `palette.js`: Color palette
- `typography.js`: Typography settings
- `shadows.jsx`: Shadow definitions
- `overrides/`: Theme overrides
- `theme/`: Theme configurations

#### utils/

Utility functions:

- `getColors.js`, `getShadow.js`: Theme utilities
- `password-strength.js`, `password-validation.js`: Password utilities
- `styles.css`: Global styles

## Key Features

- Dashboard with navigation drawer
- Project management (creation, listing, viewing)
- Certificate management
- User management (internal and external users)
- Organization management
- External project handling
- Admin configuration
- Authentication and authorization
- Chatbot integration
- Document management (PDFs)
- Reporting (placeholder)

## Authentication & Authorization

- Role-based access control (Super Admin, Org Super Admin, Admin, External User)
- Protected routes
- Session management

## API Integration

- Axios for HTTP requests
- API services for different modules (certificates, files, etc.)
- SWR and React Query for data fetching

## Mind Map

```
TIC_FrontEnd (Grid Conform)
├── Build & Config
│   ├── Vite (React plugin, aliases, dev server on 3000)
│   ├── ESLint + Prettier
│   └── TypeScript/JS Config
├── UI Framework
│   ├── Material-UI
│   ├── Ant Design
│   └── Styled Components
├── State Management
│   ├── Redux (Thunk)
│   └── Context (Auth)
├── Routing
│   ├── React Router v6
│   ├── Protected Routes
│   └── Main/Login Routes
├── Pages
│   ├── Dashboard
│   ├── Projects (Listing, Creation, View)
│   ├── Certificates (Manager)
│   ├── Users (Internal/External)
│   ├── Organizations
│   ├── Admin Config
│   └── Authentication
├── Components
│   ├── Reusable UI (Cards, Forms, Modals)
│   ├── Extended (Breadcrumbs, Transitions)
│   ├── Chatbot
│   └── Third-party (Charts, Scroll)
├── Services
│   ├── API Services (Certificate, File Upload)
│   └── Session Management
├── Assets
│   ├── Images (Icons, Logos)
│   └── Documents (IEC PDFs)
├── Themes & Utils
│   ├── Palette, Typography, Shadows
│   ├── Password Utils
│   └── Global Styles
└── Shared
    ├── Constants
    └── Utilities
```

## Development Scripts

- `npm start` / `npm run dev`: Start dev server
- `npm run build`: Production build
- `npm run preview`: Preview build
- `npm run lint`: Lint code
- `npm run prettier`: Format code

## Notes

- The project uses lazy loading for pages with Loadable component
- Menu items have access control based on user roles
- Some routes are placeholders (e.g., documents, reports)
- Assets include industry-specific PDFs (IEC standards)
- The app supports external users and projects, suggesting B2B functionality
