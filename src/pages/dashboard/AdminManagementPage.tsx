import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { LecturerProfile } from '@shared/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from '@/components/ui/sonner';
export function AdminManagementPage() {
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedLecturer, setSelectedLecturer] = useState<LecturerProfile | null>(null);
  const queryClient = useQueryClient();
  const { data: lecturers, isLoading, isError } = useQuery<LecturerProfile[]>({
    queryKey: ['lecturers'],
    queryFn: () => api('/api/lecturers'),
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/lecturers/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Lecturer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete lecturer: ${error.message}`);
    },
    onSettled: () => {
      setAlertOpen(false);
      setSelectedLecturer(null);
    },
  });
  const handleDeleteClick = (lecturer: LecturerProfile) => {
    setSelectedLecturer(lecturer);
    setAlertOpen(true);
  };
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
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-destructive">Failed to load users.</TableCell>
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
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteClick(lecturer)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">No lecturers found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the account for <strong>{selectedLecturer?.name}</strong> and all of their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedLecturer(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedLecturer && deleteMutation.mutate(selectedLecturer.id)}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}