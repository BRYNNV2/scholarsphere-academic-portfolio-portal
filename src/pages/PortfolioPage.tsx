import { useParams, Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Building, Book, FlaskConical, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { LecturerProfile, Publication, ResearchProject } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
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
  const { data: lecturer, isLoading: isLoadingLecturer } = useQuery<LecturerProfile>({
    queryKey: ['lecturer', id],
    queryFn: () => api(`/api/lecturers/${id}`),
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
  const isLoading = isLoadingLecturer || isLoadingPubs || isLoadingProjs;
  if (isLoading) {
    return <PublicLayout><PortfolioPageSkeleton /></PublicLayout>;
  }
  if (!lecturer) {
    return (
      <PublicLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">Lecturer not found</h1>
          <p className="text-muted-foreground mt-2">The profile you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/directory">Back to Directory</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }
  const lecturerPublications = publications?.filter(p => lecturer.publicationIds.includes(p.id)) ?? [];
  const lecturerProjects = projects?.filter(p => lecturer.projectIds.includes(p.id)) ?? [];
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-start gap-8">
            <Avatar className="h-32 w-32 md:h-40 md:w-40">
              <AvatarImage src={lecturer.photoUrl} alt={lecturer.name} />
              <AvatarFallback className="text-4xl">{lecturer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-4xl font-display font-bold text-foreground">{lecturer.name}</h1>
              <p className="text-xl text-primary mt-1">{lecturer.title}</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  <span>{lecturer.department}, {lecturer.university}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${lecturer.email}`} className="hover:text-primary">{lecturer.email}</a>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {lecturer.specializations.map(spec => (
                  <Badge key={spec} variant="secondary">{spec}</Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12">
            <Card>
              <CardHeader><CardTitle>Biography</CardTitle></CardHeader>
              <CardContent><p className="text-muted-foreground whitespace-pre-wrap">{lecturer.bio}</p></CardContent>
            </Card>
          </div>
          {lecturerPublications.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><Book /> Publications</h2>
              <div className="mt-6 space-y-4">
                {lecturerPublications.map(pub => (
                  <Card key={pub.id}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{pub.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{pub.authors.join(', ')}</p>
                      <p className="text-sm text-muted-foreground mt-1"><em>{pub.journal}</em>, {pub.year}</p>
                      {pub.url && <a href={pub.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">View Publication <ExternalLink className="h-4 w-4" /></a>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
          {lecturerProjects.length > 0 && (
            <div className="mt-12">
              <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3"><FlaskConical /> Research Projects</h2>
              <div className="mt-6 space-y-4">
                {lecturerProjects.map(proj => (
                  <Card key={proj.id}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-lg">{proj.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1"><strong>Role:</strong> {proj.role} ({proj.year})</p>
                      <p className="text-sm text-muted-foreground mt-2">{proj.description}</p>
                      {proj.url && <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-2">Learn More <ExternalLink className="h-4 w-4" /></a>}
                    </CardContent>
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