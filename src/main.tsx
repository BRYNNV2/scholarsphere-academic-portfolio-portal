import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary';
import '@/index.css'
import { HomePage } from '@/pages/HomePage';
import { DirectoryPage } from '@/pages/DirectoryPage';
import { PortfolioPage } from '@/pages/PortfolioPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DashboardPublicationsPage } from '@/pages/dashboard/DashboardPublicationsPage';
import { DashboardResearchPage } from '@/pages/dashboard/DashboardResearchPage';
import { DashboardSettingsPage } from '@/pages/dashboard/DashboardSettingsPage';
import { DashboardPortfolioPage } from '@/pages/dashboard/DashboardPortfolioPage';
import { Toaster } from "@/components/ui/sonner"
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { PublicationsPage } from './pages/PublicationsPage';
import { ResearchPage } from './pages/ResearchPage';
import { PortfolioDirectoryPage } from './pages/PortfolioDirectoryPage';
import { AcademicWorkDetailPage } from './pages/AcademicWorkDetailPage';
import { TermsOfServicePage } from './pages/TermsOfServicePage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { DashboardProfileRouterPage } from './pages/dashboard/DashboardProfileRouterPage';
import { ReportProblemPage } from './pages/dashboard/ReportProblemPage';
import { SupportPage } from './pages/dashboard/SupportPage';
import { TermsAndPoliciesPage } from './pages/dashboard/TermsAndPoliciesPage';
import { CoursesPage } from './pages/dashboard/CoursesPage';
import { CoursesDirectoryPage } from './pages/CoursesDirectoryPage';
import NotificationsPage from "./pages/dashboard/NotificationsPage";
import { RootLayout } from './components/layout/RootLayout';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/login",
        element: <LoginPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/register",
        element: <RegistrationPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/directory",
        element: <DirectoryPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/users/:id",
        element: <PortfolioPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/u/:username",
        element: <PortfolioPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/publications",
        element: <PublicationsPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/projects",
        element: <ResearchPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/portfolio",
        element: <PortfolioDirectoryPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/courses",
        element: <CoursesDirectoryPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/work/:id",
        element: <AcademicWorkDetailPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfServicePage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicyPage />,
        errorElement: <RouteErrorBoundary />,
      },
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        errorElement: <RouteErrorBoundary />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: "profile",
            element: <DashboardProfileRouterPage />,
          },
          {
            path: "publications",
            element: <DashboardPublicationsPage />,
          },
          {
            path: "research",
            element: <DashboardResearchPage />,
          },
          {
            path: "portfolio",
            element: <DashboardPortfolioPage />,
          },
          {
            path: "courses",
            element: <CoursesPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "settings",
            element: <DashboardSettingsPage />,
          },
          {
            path: "support",
            element: <SupportPage />,
          },
          {
            path: "report-problem",
            element: <ReportProblemPage />,
          },
          {
            path: "terms-and-policies",
            element: <TermsAndPoliciesPage />,
          },
        ]
      },
    ]
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)