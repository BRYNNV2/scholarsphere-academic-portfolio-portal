import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { api } from '@/lib/api-client';
import { AcademicWork, UserProfile } from '@shared/types';
import { CommentsSection } from '@/components/CommentsSection';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Book, Briefcase, Building, ExternalLink, FlaskConical, User } from 'lucide-react';
const getPathForType = (type: AcademicWork['type']) => {
  switch (type) {
    case 'publication':
      return 'publications';
    case 'project':
      return 'projects';
    case 'portfolio':
      return 'portfolio';
    default:
      // Fallback to a sensible default, though this should ideally not be reached with valid data
      return type;
  }
};
function AcademicWorkDetailPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <Skeleton className="h-8 w-1/4 mb-8" />
      <Skeleton className="h-12 w-3/4 mb-4" />
      <div className="flex items-center gap-4 mb-8">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>
      <Skeleton className="w-full h-64 mb-8" />
      <div className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-5/6" />
      </div>
    </div>
  );
}
export function AcademicWorkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading: isLoadingItem, isError } = useQuery<AcademicWork>({
    queryKey: ['academic-work', id],
    queryFn: () => api(`/api/academic-work/${id}`),
    enabled: !!id,
  });
  const { data: author, isLoading: isLoadingAuthor } = useQuery<UserProfile>({
    queryKey: ['user', item?.lecturerId],
    queryFn: () => api(`/api/users/${item?.lecturerId}`),
    enabled: !!item?.lecturerId,
  });
  const getIcon = (type: AcademicWork['type']) => {
    switch (type) {
      case 'publication': return <Book className="h-10 w-10" />;
      case 'project': return <FlaskConical className="h-10 w-10" />;
      case 'portfolio': return <Briefcase className="h-10 w-10" />;
      default: return null;
    }
  };
  const renderItemDetails = (item: AcademicWork) => {
    switch (item.type) {
      case 'publication':
        return (
          <>
            <p className="text-lg text-muted-foreground">{item.authors.join(', ')}</p>
            <p className="text-md text-muted-foreground"><em>{item.journal}</em>, {item.year}</p>
          </>
        );
      case 'project':
        return (
          <>
            <p className="text-lg text-muted-foreground"><strong>Role:</strong> {item.role} ({item.year})</p>
            <p className="mt-6 text-lg leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </>
        );
      case 'portfolio':
        return (
          <>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-base">{item.category}</Badge>
              <p className="text-lg text-muted-foreground">{item.year}</p>
            </div>
            <p className="mt-6 text-lg leading-relaxed whitespace-pre-wrap">{item.description}</p>
          </>
        );
      default:
        return null;
    }
  };
  if (isLoadingItem || isLoadingAuthor) {
    return <PublicLayout><AcademicWorkDetailPageSkeleton /></PublicLayout>;
  }
  if (isError || !item) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold">Item not found</h1>
          <p className="text-muted-foreground mt-2">The academic work you are looking for does not exist.</p>
          <Button asChild className="mt-6">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </PublicLayout>
    );
  }

  const backPath = getPathForType(item.type);
  const backPathTitle = backPath.charAt(0).toUpperCase() + backPath.slice(1);

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <Button variant="ghost" asChild className="mb-8">
          <Link to={`/${backPath}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {backPathTitle}
          </Link>
        </Button>
        <article>
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight">{item.title}</h1>
            {author && (
              <div className="mt-6 flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={author.photoUrl} alt={author.name} />
                  <AvatarFallback>{author.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <Link to={`/users/${author.id}`} className="text-lg font-semibold hover:underline">{author.name}</Link>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Building className="h-4 w-4" /> {author.university}
                  </p>
                </div>
              </div>
            )}
          </header>
          <Card className="overflow-hidden">
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {getIcon(item.type)}
                </div>
              )}
            </AspectRatio>
            <CardContent className="p-6 md:p-8 space-y-4">
              {renderItemDetails(item)}
              {item.url && (
                <Button asChild className="mt-6">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    View Source <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
            <CommentsSection postId={item.id} />
          </Card>
        </article>
      </div>
    </PublicLayout>
  );
}