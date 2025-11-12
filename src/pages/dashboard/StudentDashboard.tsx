import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { AcademicWork, Comment, UserProfile } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Bookmark, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
function SmallAcademicWorkCard({ item, authorName }: { item: AcademicWork, authorName: string }) {
  return (
    <Link to={`/users/${item.lecturerId}`} className="block">
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
  const { data: allComments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['all-comments'],
    queryFn: () => api('/api/posts/all/comments'),
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api('/api/users'),
  });
  const isLoading = isLoadingProfile || isLoadingWork || isLoadingComments || isLoadingUsers;
  const savedItems = allAcademicWork?.filter(item => profile?.savedItemIds?.includes(item.id)) ?? [];
  const userComments = allComments?.filter(comment => comment.userId === userId).slice(0, 5) ?? [];
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/2" />
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
          <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
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
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bookmark className="h-5 w-5" /> Saved for Later</CardTitle>
            <CardDescription>Items you've bookmarked.</CardDescription>
          </CardHeader>
          <CardContent>
            {savedItems.length > 0 ? (
              <div className="space-y-2">
                {savedItems.slice(0, 5).map(item => {
                  const author = users?.find(u => u.id === item.lecturerId);
                  return <SmallAcademicWorkCard key={item.id} item={item} authorName={author?.name || '...'} />;
                })}
              </div>
            ) : <p className="text-sm text-muted-foreground">No saved items yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Recent Comments</CardTitle>
            <CardDescription>Your latest contributions.</CardDescription>
          </CardHeader>
          <CardContent>
            {userComments.length > 0 ? (
              <ul className="space-y-3">
                {userComments.map(comment => {
                  const commentedItem = allAcademicWork?.find(item => item.id === comment.postId);
                  return (
                    <li key={comment.id} className="text-sm">
                      <p className="truncate">"{comment.content}"</p>
                      {commentedItem && (
                        <p className="text-xs text-muted-foreground">
                          on <Link to={`/users/${commentedItem.lecturerId}`} className="font-medium hover:underline">{commentedItem.title}</Link>
                          {' '}({formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })})
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : <p className="text-sm text-muted-foreground">You haven't made any comments.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}