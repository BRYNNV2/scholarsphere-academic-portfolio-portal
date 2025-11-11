import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { AcademicWork, UserProfile } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { BookCopy, FlaskConical, Briefcase, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useMemo } from 'react';
const getTypeIcon = (type: AcademicWork['type']) => {
  switch (type) {
    case 'publication':
      return <BookCopy className="h-4 w-4 text-muted-foreground" />;
    case 'project':
    case 'research':
      return <FlaskConical className="h-4 w-4 text-muted-foreground" />;
    case 'portfolio':
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};
function ActivityItem({ item, authorName }: { item: AcademicWork; authorName: string }) {
  return (
    <Link to={`/work/${item.id}`} className="block p-3 rounded-md hover:bg-muted">
      <div className="flex items-start gap-3">
        <div className="mt-1">{getTypeIcon(item.type)}</div>
        <div className="flex-1">
          <p className="text-sm font-medium leading-snug">{item.title}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Published by {authorName} &middot; {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </Link>
  );
}
export function RecentActivityFeed() {
  const { data: recentWork, isLoading: isLoadingWork } = useQuery<AcademicWork[]>({
    queryKey: ['recent-activity'],
    queryFn: () => api.get('/api/activity/recent'),
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users'),
  });
  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map((u) => [u.id, u]));
  }, [users]);
  const isLoading = isLoadingWork || isLoadingUsers;
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" /> Recent Activity
        </CardTitle>
        <CardDescription>The latest academic work from across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : recentWork && recentWork.length > 0 ? (
          <div className="space-y-2">
            {recentWork.map((item) => (
              <ActivityItem
                key={item.id}
                item={item}
                authorName={usersMap.get(item.lecturerId)?.name || 'Unknown Author'}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No recent activity to display.
          </p>
        )}
      </CardContent>
    </Card>
  );
}