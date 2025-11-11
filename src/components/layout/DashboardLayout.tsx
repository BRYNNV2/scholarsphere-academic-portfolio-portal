import { Outlet } from "react-router-dom";
import { AppLayout } from './AppLayout';
export function DashboardLayout() {
  return (
    <AppLayout container>
      <Outlet />
    </AppLayout>
  );
}