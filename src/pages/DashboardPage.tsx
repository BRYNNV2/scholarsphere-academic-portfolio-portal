import { useAuthStore } from '@/stores/auth-store';
import { LecturerDashboard } from './dashboard/LecturerDashboard';
import { StudentDashboard } from './dashboard/StudentDashboard';
import { Skeleton } from '@/components/ui/skeleton';
export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  if (!useAuthStore.persist.hasHydrated() || !user) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }
  if (user.role === 'lecturer') {
    return <LecturerDashboard />;
  }
  if (user.role === 'student') {
    return <StudentDashboard />;
  }
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-muted-foreground">Invalid user role.</p>
    </div>
  );
}