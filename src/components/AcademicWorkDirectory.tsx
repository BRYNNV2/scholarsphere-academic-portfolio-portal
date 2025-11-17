import { useState, useMemo } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from "../lib/api-client";
import { AcademicWork, UserProfile } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from 'react-use';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { AcademicWorkCard } from '@/components/AcademicWorkCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface AcademicWorkDirectoryProps {
  pageTitle: string;
  pageDescription: string;
  searchPlaceholder: string;
  apiEndpoint: string;
  queryKey: string;
}
function WorkCardSkeleton() {
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
    </Card>);

}
export function AcademicWorkDirectory({
  pageTitle,
  pageDescription,
  searchPlaceholder,
  apiEndpoint,
  queryKey
}: AcademicWorkDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 300, [searchTerm]);
  const queryParams = new URLSearchParams({
    q: debouncedSearchTerm,
    year: yearFilter
  });
  const { data: items, isLoading: isLoadingItems } = useQuery<AcademicWork[]>({
    queryKey: [queryKey, debouncedSearchTerm, yearFilter],
    queryFn: () => api(`${apiEndpoint}?${queryParams.toString()}`)
  });
  const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
    queryKey: ['users'],
    queryFn: () => api('/api/users')
  });
  const { data: availableYears = [] } = useQuery<number[]>({
    queryKey: [queryKey, 'years'],
    queryFn: () => api(`${apiEndpoint}/years`)
  });
  const usersMap = useMemo(() => {
    if (!users) return new Map<string, UserProfile>();
    return new Map(users.map((l) => [l.id, l]));
  }, [users]);
  const isLoading = isLoadingItems || isLoadingUsers;
  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-display font-bold text-foreground">{pageTitle}</h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              {pageDescription}
            </p>
          </div>
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={searchPlaceholder}
                className="w-full pl-10 py-3 text-base h-11"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} />

            </div>
            <div>
              <Select value={yearFilter || 'all'} onValueChange={(value) => setYearFilter(value === 'all' ? '' : value)}>
                <SelectTrigger className="w-full h-11">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) =>
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ?
            Array.from({ length: 6 }).map((_, index) => <WorkCardSkeleton key={index} />) :

            items?.map((item, index) =>
            <AcademicWorkCard
              key={item.id}
              item={item}
              author={usersMap.get(item.lecturerId)}
              index={index} />

            )
            }
          </div>
          {!isLoading && items?.length === 0 &&
          <div className="text-center col-span-full mt-16">
              <p className="text-muted-foreground">No items found matching your criteria.</p>
            </div>
          }
        </div>
      </div>
    </PublicLayout>);

}