import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { LecturerProfile } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
export function AdminManagementPage() {
  const { data: lecturers, isLoading, isError } = useQuery<LecturerProfile[]>({
    queryKey: ['lecturers'],
    queryFn: () => api('/api/lecturers'),
  });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Management</h1>
        <p className="text-muted-foreground">View and manage all registered lecturers.</p>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>University</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><Skeleton className="h-5 w-32" /></div></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load users.</TableCell>
              </TableRow>
            ) : lecturers?.length ? (
              lecturers.map((lecturer) => (
                <TableRow key={lecturer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={lecturer.photoUrl} alt={lecturer.name} />
                        <AvatarFallback>{lecturer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{lecturer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lecturer.title}</TableCell>
                  <TableCell>{lecturer.university}</TableCell>
                  <TableCell><a href={`mailto:${lecturer.email}`} className="hover:underline">{lecturer.email}</a></TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No lecturers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}