import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Search, ExternalLink, User, Briefcase } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { PortfolioItem, UserProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'react-use';
import { AspectRatio } from '@/components/ui/aspect-ratio';
function PortfolioItemCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <AspectRatio ratio={16 / 9}>
        <Skeleton className="h-full w-full" />
      </AspectRatio>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}
export function PortfolioDirectoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300, [searchTerm]);
  const { data: portfolioItems, isLoading: isLoadingItems } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio'],
    queryFn: () => api('/api/portfolio'),
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api('/api/users'),
  });
  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map(l => [l.id, l]));
  }, [users]);
  const filteredItems = useMemo(() => {
    if (!portfolioItems) return [];
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return portfolioItems.filter(item =>
      item.title.toLowerCase().includes(lowercasedFilter) ||
      item.description.toLowerCase().includes(lowercasedFilter) ||
      item.category.toLowerCase().includes(lowercasedFilter) ||
      (usersMap.get(item.lecturerId)?.name.toLowerCase().includes(lowercasedFilter))
    );
  }, [portfolioItems, debouncedSearchTerm, usersMap]);
  const isLoading = isLoadingItems || isLoadingUsers;
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">Explore Portfolios</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Discover awards, grants, and other professional activities from our community.
            </p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, category, or researcher..."
                className="w-full pl-10 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <PortfolioItemCardSkeleton key={index} />)
            ) : (
              filteredItems.map((item, index) => {
                const user = usersMap.get(item.lecturerId);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1">
                       <AspectRatio ratio={16 / 9} className="bg-muted">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" />
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            <Briefcase className="h-12 w-12" />
                          </div>
                        )}
                      </AspectRatio>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="flex-grow pr-2">{item.title}</CardTitle>
                          <Badge variant="outline">{item.category}</Badge>
                        </div>
                        <CardDescription>{item.year}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <p className="text-sm text-muted-foreground flex-grow">{item.description}</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          {user ? (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/users/${user.id}`} className="text-sm">
                                <User className="mr-2 h-4 w-4" />
                                {user.name}
                              </Link>
                            </Button>
                          ) : <div />}
                          {item.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={item.url} target="_blank" rel="noopener noreferrer">
                                View <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </div>
          {!isLoading && filteredItems.length === 0 && (
            <div className="text-center col-span-full mt-16">
              <p className="text-muted-foreground">No portfolio items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}