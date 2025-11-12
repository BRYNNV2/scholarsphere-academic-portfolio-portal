import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Search, ExternalLink, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { ResearchProject, LecturerProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'react-use';
function ProjectCardSkeleton() {
  return (
    <Card>
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
export function ResearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300, [searchTerm]);
  const { data: projects, isLoading: isLoadingProjs } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api('/api/projects'),
  });
  const { data: lecturers, isLoading: isLoadingLecturers } = useQuery<LecturerProfile[]>({
    queryKey: ['lecturers'],
    queryFn: () => api('/api/lecturers'),
  });
  const lecturersMap = useMemo(() => {
    if (!lecturers) return new Map<string, LecturerProfile>();
    return new Map(lecturers.map(l => [l.id, l]));
  }, [lecturers]);
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    const lowercasedFilter = debouncedSearchTerm.toLowerCase();
    return projects.filter(proj =>
      proj.title.toLowerCase().includes(lowercasedFilter) ||
      proj.description.toLowerCase().includes(lowercasedFilter) ||
      (lecturersMap.get(proj.lecturerId)?.name.toLowerCase().includes(lowercasedFilter))
    );
  }, [projects, debouncedSearchTerm, lecturersMap]);
  const isLoading = isLoadingProjs || isLoadingLecturers;
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">Explore Research Projects</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Discover ongoing and completed research from leading academic minds.
            </p>
          </div>
          <div className="mt-12 max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, description, or researcher..."
                className="w-full pl-10 py-3 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => <ProjectCardSkeleton key={index} />)
            ) : (
              filteredProjects.map((proj, index) => {
                const lecturer = lecturersMap.get(proj.lecturerId);
                return (
                  <motion.div
                    key={proj.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="h-full flex flex-col">
                      <CardHeader>
                        <CardTitle>{proj.title}</CardTitle>
                        <CardDescription>{proj.role} - {proj.year}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow flex flex-col">
                        <p className="text-sm text-muted-foreground flex-grow">{proj.description}</p>
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          {lecturer ? (
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/lecturers/${lecturer.id}`} className="text-sm">
                                <User className="mr-2 h-4 w-4" />
                                {lecturer.name}
                              </Link>
                            </Button>
                          ) : <div />}
                          {proj.url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={proj.url} target="_blank" rel="noopener noreferrer">
                                Learn More <ExternalLink className="ml-2 h-4 w-4" />
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
          {!isLoading && filteredProjects.length === 0 && (
            <div className="text-center col-span-full mt-16">
              <p className="text-muted-foreground">No projects found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}