import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { AcademicWork, UserProfile } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Bookmark, User } from 'lucide-react';
function SmallAcademicWorkCard({ item, authorName }: { item: AcademicWork, authorName: string }) {
  const itemUrl = `/${item.type === 'project' ? 'research' : item.type}s/${item.id}`;
  return (
    <Link to={itemUrl} className="block">
      <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
        <div className="w-16 h-10 bg-muted rounded-md flex-shrink-0">
          {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover rounded-md" />}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">by {authorName}</p>
        </div>
      </div>
    </Link>
  );
}
export function StudentDashboard() {
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id;
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => api(`/api/users/${userId}`),
    enabled: !!userId,
  });
  const { data: allAcademicWork, isLoading: isLoadingWork } = useQuery<(AcademicWork)[]>({
    queryKey: ['all-academic-work'],
    queryFn: async () => {
      const [publications, projects, portfolio] = await Promise.all([
        api<AcademicWork[]>('/api/publications'),
        api<AcademicWork[]>('/api/projects'),
        api<AcademicWork[]>('/api/portfolio'),
      ]);
      return [...publications, ...projects, ...portfolio];
    },
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api('/api/users'),
  });
  const isLoading = isLoadingProfile || isLoadingWork || isLoadingUsers;
  const savedItems = allAcademicWork?.filter(item => profile?.savedItemIds?.includes(item.id)) ?? [];
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /></CardContent></Card>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Dashboard</h1>
        <p className="text-muted-foreground">Welcome, {currentUser?.name}! Here's your activity overview.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" /> Saved for Later</CardTitle>
            <CardDescription>Items you've bookmarked to read.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedItems.length > 0 ? (
              <div className="space-y-2">
                {savedItems.slice(0, 5).map(item => {
                  const author = users?.find(u => u.id === item.lecturerId);
                  return <SmallAcademicWorkCard key={item.id} item={item} authorName={author?.name || '...'} />;
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground">No saved items yet. You can save items from any directory page.</p>}
          </CardContent>
        </Card>
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/profile" className="block h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Manage Profile</CardTitle>
              <CardDescription>Update your profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Keep your profile image up to date so others can recognize you.</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}