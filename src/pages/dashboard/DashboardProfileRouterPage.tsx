import { useAuthStore } from '@/stores/auth-store';
import { DashboardProfilePage } from './DashboardProfilePage';
import { StudentProfilePage } from './StudentProfilePage';
import { Skeleton } from '@/components/ui/skeleton';
interface Card {
  id?: string | number;

  [key: string]: unknown;
}interface CardContent {id?: string | number;[key: string]: unknown;}interface CardContentProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}interface CardHeaderProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}interface CardHeaderProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}interface CardProps {children?: React.ReactNode;className?: string;style?: React.CSSProperties;[key: string]: unknown;}export function DashboardProfileRouterPage() {const user = useAuthStore((state) => state.user);if (!useAuthStore.persist.hasHydrated() || !user) {return <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>;

  }
  if (user.role === 'lecturer') {
    return <DashboardProfilePage />;
  }
  if (user.role === 'student') {
    return <StudentProfilePage />;
  }
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
      <p className="text-muted-foreground">Invalid user role. Cannot display profile page.</p>
    </div>);

}