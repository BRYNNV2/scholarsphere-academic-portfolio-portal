import '@/lib/errorReporter';
import { enableMapSet } from "immer";
enableMapSet();
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
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
import { AdminManagementPage } from '@/pages/dashboard/AdminManagementPage';
import { AppLayout } from './components/layout/AppLayout';
import { Toaster } from "@/components/ui/sonner"
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
const queryClient = new QueryClient();
const DashboardLayout = () => (
  <AppLayout container>
    <Outlet />
  </AppLayout>
);
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
    path: "/directory",
    element: <DirectoryPage />,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/lecturers/:id",
    element: <PortfolioPage />,
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
        path: "admin",
        element: <AdminManagementPage />,
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