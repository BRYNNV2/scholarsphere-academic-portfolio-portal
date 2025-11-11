import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { Publication, LecturerProfile } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
const publicationSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.string().min(1, 'Authors are required'),
  journal: z.string().min(1, 'Journal is required'),
  year: z.coerce.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 1, 'Invalid year'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});
type PublicationFormData = z.infer<typeof publicationSchema>;
function PublicationForm({ publication, onFinished }: { publication?: Publication, onFinished: () => void }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const form = useForm<PublicationFormData>({
    resolver: zodResolver(publicationSchema),
    defaultValues: {
      title: publication?.title || '',
      authors: publication?.authors.join(', ') || '',
      journal: publication?.journal || '',
      year: publication?.year || new Date().getFullYear(),
      url: publication?.url || '',
    },
  });
  const mutation = useMutation({
    mutationFn: (data: Omit<Publication, 'id' | 'type'> & { lecturerId?: string }) =>
      api(publication ? `/api/publications/${publication.id}` : '/api/publications', {
        method: publication ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(`Publication ${publication ? 'updated' : 'added'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer', currentUser?.id] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${publication ? 'update' : 'add'} publication: ${error.message}`);
    },
  });
  const onSubmit = (data: PublicationFormData) => {
    const payload = {
      ...data,
      authors: data.authors.split(',').map(a => a.trim()),
    };
    if (publication) {
      mutation.mutate({ ...payload, id: publication.id });
    } else {
      mutation.mutate({ ...payload, lecturerId: currentUser?.id });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="authors" render={({ field }) => (
          <FormItem><FormLabel>Authors (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="journal" render={({ field }) => (
          <FormItem><FormLabel>Journal/Conference</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="year" render={({ field }) => (
          <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="url" render={({ field }) => (
          <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export function DashboardPublicationsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState<Publication | undefined>(undefined);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id;
  const { data: profile, isLoading: isLoadingProfile } = useQuery<LecturerProfile>({
    queryKey: ['lecturer', userId],
    queryFn: () => api(`/api/lecturers/${userId}`),
    enabled: !!userId,
  });
  const { data: allPublications, isLoading: isLoadingPubs } = useQuery<Publication[]>({
    queryKey: ['publications'],
    queryFn: () => api('/api/publications'),
  });
  const userPublications = useMemo(() => {
    if (!profile || !allPublications) return [];
    const userPubIds = new Set(profile.publicationIds);
    return allPublications.filter(pub => userPubIds.has(pub.id));
  }, [profile, allPublications]);
  const isLoading = isLoadingProfile || isLoadingPubs;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/publications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Publication deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['publications'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer', userId] });
    },
    onError: (error) => {
      toast.error(`Failed to delete publication: ${error.message}`);
    },
    onSettled: () => setAlertOpen(false),
  });
  const handleEdit = (pub: Publication) => {
    setSelectedPub(pub);
    setFormOpen(true);
  };
  const handleAddNew = () => {
    setSelectedPub(undefined);
    setFormOpen(true);
  };
  const handleDelete = (pub: Publication) => {
    setSelectedPub(pub);
    setAlertOpen(true);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Publications</h1>
          <p className="text-muted-foreground">Add, edit, or delete your academic publications.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedPub ? 'Edit' : 'Add'} Publication</DialogTitle>
              <DialogDescription>Fill in the details of the academic publication.</DialogDescription>
            </DialogHeader>
            <PublicationForm publication={selectedPub} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Journal</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : userPublications.length ? (
              userPublications.map((pub) => (
                <TableRow key={pub.id}>
                  <TableCell className="font-medium">{pub.title}</TableCell>
                  <TableCell>{pub.journal}</TableCell>
                  <TableCell>{pub.year}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(pub)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(pub)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No publications found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the publication.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedPub && deleteMutation.mutate(selectedPub.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}