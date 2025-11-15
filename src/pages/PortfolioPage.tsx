import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Building, Book, FlaskConical, ExternalLink, Twitter, Linkedin, Github, Briefcase, Bookmark } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { UserProfile, Publication, ResearchProject, PortfolioItem } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { CommentsSection } from '@/components/CommentsSection';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { FollowButton } from '@/components/FollowButton';
function SaveButton({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const canSave = currentUser?.role === 'student';
  const isSaved = (currentUser?.savedItemIds ?? []).includes(itemId);
  const saveMutation = useMutation({
    mutationFn: () => isSaved
      ? api(`/api/users/me/save/${itemId}`, { method: 'DELETE' })
      : api(`/api/users/me/save/${itemId}`, { method: 'POST' }),
    onSuccess: (updatedProfile: UserProfile) => {
      toast.success(isSaved ? 'Item unsaved!' : 'Item saved for later!');
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    },
  });
  if (!canSave) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => saveMutation.mutate()}
      disabled={saveMutation.isPending}
    >
      <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-primary text-primary")} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}
function PortfolioPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <Skeleton className="h-32 w-32 md:h-40 md:w-40 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-40 w-full mt-12" />
      <Skeleton className="h-10 w-1/3 mt-12" />
      <Skeleton className="h-24 w-full mt-6" />
      <Skeleton className="h-24 w-full mt-4" />
    </div>
  );
}
export function PortfolioPage() {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading: isLoadingUser } = useQuery<UserProfile>({
    queryKey: ['user', id],
    queryFn: () => api(`/api/users/${id}`),
    enabled: !!id,
  });
  const { data: publications, isLoading: isLoadingPubs } = useQuery<Publication[]>({
    queryKey: ['publications'],
    queryFn: () => api('/api/publications'),
  });
  const { data: projects, isLoading: isLoadingProjs } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api('/api/projects'),
  });
  const { data: portfolioItems, isLoading: isLoadingPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio'],
    queryFn: () => api('/api/portfolio'),
  });
  const isLoading = isLoadingUser || isLoadingPubs || isLoadingProjs || isLoadingPortfolio;
  if (isLoading) {
    return <PublicLayout><PortfolioPageSkeleton /></PublicLayout>;
  }
  if (!user) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground mt-2">The profile you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/directory">Back to Directory</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }
  const userPublications = publications?.filter(p => user.publicationIds.includes(p.id)) ?? [];
  const userProjects = projects?.filter(p => user.projectIds.includes(p.id)) ?? [];
  const userPortfolioItems = portfolioItems?.filter(p => user.portfolioItemIds.includes(p.id)) ?? [];
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={user.photoUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-foreground">{user.name}</h1>
              <p className="text-xl text-primary mt-1">{user.title}</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>{user.department}, {user.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${user.email}`} className="hover:text-primary">{user.email}</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {user.specializations.map(spec => (
                  <Badge key={spec} variant="secondary">{spec}</Badge>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-4">
                {user.socialLinks?.twitter && (
                  <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <FollowButton lecturer={user} />
            </div>
          </div>
          <div className="mt-12">
            <Card>
              <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p></CardContent>
            </Card>
          </div>
          {userPortfolioItems.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><Briefcase /> Portfolio</h2>
              <div className="mt-6 space-y-4">
                {userPortfolioItems.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Briefcase className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                            </div>
                            <div className="flex-shrink-0"><SaveButton itemId={item.id} /></div>
                          </div>
                          <div className="flex justify-between items-end mt-2">
                            <p className="text-sm text-muted-foreground">{item.year} &middot; <Badge variant="outline" className="ml-1">{item.category}</Badge></p>
                            {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">View Details <ExternalLink className="h-4 w-4" /></a>}
                          </div>
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={item.id} />
                  </Card>
                ))}
              </div>
            </div>
          )}
          {userPublications.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><Book /> Publications</h2>
              <div className="mt-6 space-y-4">
                {userPublications.map(pub => (
                  <Card key={pub.id} className="overflow-hidden">
                     <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {pub.thumbnailUrl ? (
                            <img src={pub.thumbnailUrl} alt={pub.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <Book className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-semibold text-lg flex-grow">{pub.title}</h3>
                            <div className="flex-shrink-0"><SaveButton itemId={pub.id} /></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{pub.authors.join(', ')}</p>
                          <p className="text-sm text-muted-foreground mt-1"><em>{pub.journal}</em>, {pub.year}</p>
                          {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">View Publication <ExternalLink className="h-4 w-4" /></a>}
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={pub.id} />
                  </Card>
                ))}
              </div>
            </div>
          )}
          {userProjects.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><FlaskConical /> Research Projects</h2>
              <div className="mt-6 space-y-4">
                {userProjects.map(proj => (
                  <Card key={proj.id} className="overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-1/3 md:w-1/4">
                        <AspectRatio ratio={16 / 9} className="bg-muted">
                          {proj.thumbnailUrl ? (
                            <img src={proj.thumbnailUrl} alt={proj.title} className="object-cover w-full h-full" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                              <FlaskConical className="h-10 w-10" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div className="flex-1">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <h3 className="font-semibold text-lg flex-grow">{proj.title}</h3>
                            <div className="flex-shrink-0"><SaveButton itemId={proj.id} /></div>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1"><strong>Role:</strong> {proj.role} ({proj.year})</p>
                          <p className="text-sm text-muted-foreground mt-2">{proj.description}</p>
                          {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">Learn More <ExternalLink className="h-4 w-4" /></a>}
                        </CardContent>
                      </div>
                    </div>
                    <CommentsSection postId={proj.id} />
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}