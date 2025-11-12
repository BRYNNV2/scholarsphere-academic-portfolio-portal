import { useState, useMemo } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { Publication, UserProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'react-use';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AcademicWorkCard } from '@/components/AcademicWorkCard';
function PublicationCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
export function PublicationsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300, [searchTerm]);
  const { data: publications, isLoading: isLoadingPubs } = useQuery<Publication[]>({
    queryKey: ['publications'],
    queryFn: () => api('/api/publications'),
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api('/api/users'),
  });
  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map(l => [l.id, l]));
  }, [users]);
  const filteredPublications = useMemo(() => {
    if (!publications) return [];
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return publications.filter(pub =>
      pub.title.toLowerCase().includes(lowercasedFilter) ||
      pub.authors.some(author => author.toLowerCase().includes(lowercasedFilter)) ||
      pub.journal.toLowerCase().includes(lowercasedFilter)
    );
  }, [publications, debouncedSearchTerm]);
  const isLoading = isLoadingPubs || isLoadingUsers;
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">Browse Publications</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Explore the latest research and articles from our distinguished academics.
            </p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, author, or journal..."
                className="w-full pl-10 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <PublicationCardSkeleton key={index} />)
            ) : (
              filteredPublications.map((pub, index) => (
                <AcademicWorkCard
                  key={pub.id}
                  item={pub}
                  author={usersMap.get(pub.lecturerId)}
                  index={index}
                />
              ))
            )}
          </div>
          {!isLoading && filteredPublications.length === 0 && (
            <div className="text-center col-span-full mt-16">
              <p className="text-muted-foreground">No publications found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}