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
import { DashboardProfilePage } from '@/pages/dashboard/DashboardProfilePage';
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
const queryClient = new QueryClient();
const router = createBrowserRouter([
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
    path: "/publications",
    element: <PublicationsPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/publications/:id",
    element: <AcademicWorkDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/research",
    element: <ResearchPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/research/:id",
    element: <AcademicWorkDetailPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portfolio",
    element: <PortfolioDirectoryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/portfolio/:id",
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
        element: <DashboardProfilePage />,
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
        path: "settings",
        element: <DashboardSettingsPage />,
      },
    ]
  },
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