import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, FlaskConical, User, Briefcase, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { UserProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function LecturerDashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['user', currentUser?.id],
    queryFn: () => api(`/api/users/${currentUser?.id}`),
    enabled: !!currentUser?.id,
  });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your academic portfolio here.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/profile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Update your biography, contact details, and specializations.
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/publications">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publications</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, and organize your published articles and papers.
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/research">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Showcase your ongoing and completed research projects.
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/portfolio">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Highlight awards, grants, and other professional activities.
              </p>
            </CardContent>
          </Link>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-8" />
            ) : (
              <div className="text-2xl font-bold">{profile?.followerIds?.length ?? 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total followers on the platform.
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Overview</CardTitle>
          <CardDescription>
            This is your central hub. Use the links above or the sidebar to navigate through your portfolio sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>Your public portfolio is a reflection of your academic journey. Keep it updated to showcase your latest achievements to the world.</p>
        </CardContent>
      </Card>
    </div>
  );
}