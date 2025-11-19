import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Building, Twitter, Linkedin, Github, Briefcase, Book, FlaskConical } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { UserProfile, Publication, ResearchProject, PortfolioItem } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AcademicWorkListItem } from '@/components/AcademicWorkListItem';
import { EmptyState } from '@/components/EmptyState';
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
    </div>);
}
export function PortfolioPage() {
  const { username } = useParams<{username: string;}>();
  const { data: user, isLoading: isLoadingUser } = useQuery<UserProfile>({
    queryKey: ['user-by-username', username],
    queryFn: () => api.get(`/api/users/by-username/${username}`),
    enabled: !!username
  });
  usePageTitle(user ? `${user.name} | ScholarSphere` : 'Loading Profile...');
  useEffect(() => {
    if (user) {
      document.title = `${user.name} | ScholarSphere`;
    }
  }, [user]);
  const { data: publications, isLoading: isLoadingPubs } = useQuery<Publication[]>({
    queryKey: ['publications', user?.id],
    queryFn: () => api.get(`/api/users/${user.id}/publications`),
    enabled: !!user?.id
  });
  const { data: projects, isLoading: isLoadingProjs } = useQuery<ResearchProject[]>({
    queryKey: ['projects', user?.id],
    queryFn: () => api.get(`/api/users/${user.id}/projects`),
    enabled: !!user?.id
  });
  const { data: portfolioItems, isLoading: isLoadingPortfolio } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio', user?.id],
    queryFn: () => api.get(`/api/users/${user.id}/portfolio`),
    enabled: !!user?.id
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
      </PublicLayout>);
  }
  const userPublications = publications ?? [];
  const userProjects = projects ?? [];
  const userPortfolioItems = portfolioItems ?? [];
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24 space-y-12">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={user.photoUrl} alt={user.name} />
              <AvatarFallback className="text-4xl">{user.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
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
                {user.specializations.map((spec) =>
                <Badge key={spec} variant="secondary">{spec}</Badge>
                )}
              </div>
              <div className="mt-4 flex items-center gap-4">
                {user.socialLinks?.twitter &&
                <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Twitter className="h-5 w-5" />
                  </a>
                }
                {user.socialLinks?.linkedin &&
                <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Linkedin className="h-5 w-5" />
                  </a>
                }
                {user.socialLinks?.github &&
                <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                    <Github className="h-5 w-5" />
                  </a>
                }
              </div>
            </div>
          </div>
          <Card>
            <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
            <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{user.bio}</p></CardContent>
          </Card>
          <div>
            <Tabs defaultValue="publications" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="publications">Publications ({userPublications.length})</TabsTrigger>
                <TabsTrigger value="research">Research ({userProjects.length})</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio ({userPortfolioItems.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="publications" className="mt-6">
                {userPublications.length > 0 ? (
                  <div className="space-y-4">
                    {userPublications.map((item) => <AcademicWorkListItem key={item.id} item={item} />)}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Book className="h-8 w-8" />}
                    title="No Publications"
                    description={`${user.name} has not added any publications yet.`}
                  />
                )}
              </TabsContent>
              <TabsContent value="research" className="mt-6">
                {userProjects.length > 0 ? (
                  <div className="space-y-4">
                    {userProjects.map((item) => <AcademicWorkListItem key={item.id} item={item} />)}
                  </div>
                ) : (
                  <EmptyState
                    icon={<FlaskConical className="h-8 w-8" />}
                    title="No Research Projects"
                    description={`${user.name} has not added any research projects yet.`}
                  />
                )}
              </TabsContent>
              <TabsContent value="portfolio" className="mt-6">
                {userPortfolioItems.length > 0 ? (
                  <div className="space-y-4">
                    {userPortfolioItems.map((item) => <AcademicWorkListItem key={item.id} item={item} />)}
                  </div>
                ) : (
                  <EmptyState
                    icon={<Briefcase className="h-8 w-8" />}
                    title="No Portfolio Items"
                    description={`${user.name} has not added any portfolio items yet.`}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PublicLayout>);
}