import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile, SavedItem } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Bookmark, User } from 'lucide-react';
import { RecentActivityFeed } from '@/components/RecentActivityFeed';
function SmallAcademicWorkCard({ item }: { item: SavedItem }) {
  const itemUrl = `/work/${item.id}`;
  return (
    <Link to={itemUrl} className="block">
      <div className="flex items-center gap-4 p-2 rounded-md hover:bg-muted">
        <div className="w-16 h-10 bg-muted rounded-md flex-shrink-0">
          {item.thumbnailUrl && <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover rounded-md" />}
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-sm font-medium truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">by {item.authorName}</p>
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
    queryFn: () => api.get(`/api/users/${userId}`),
    enabled: !!userId,
  });
  const savedItemIds = profile?.savedItemIds;
  const { data: savedItems, isLoading: isLoadingSavedItems } = useQuery<SavedItem[]>({
    queryKey: ['saved-items', savedItemIds],
    queryFn: () => api.post('/api/saved-items', { itemIds: savedItemIds }),
    enabled: !!savedItemIds && savedItemIds.length > 0,
  });
  const isLoading = isLoadingProfile || (!!savedItemIds && savedItemIds.length > 0 && isLoadingSavedItems);
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
          <Card className="lg:col-span-2"><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
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
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" /> Saved for Later</CardTitle>
              <CardDescription>Items you've bookmarked to read.</CardDescription>
            </CardHeader>
            <CardContent>
              {(savedItems && savedItems.length > 0) ? (
                <div className="space-y-2">
                  {savedItems.slice(0, 5).map(item => (
                    <SmallAcademicWorkCard key={item.id} item={item} />
                  ))}
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
        <RecentActivityFeed />
      </div>
    </div>
  );
}