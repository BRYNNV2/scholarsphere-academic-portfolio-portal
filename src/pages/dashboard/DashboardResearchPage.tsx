import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from '@/lib/api-client';
import { ResearchProject, LecturerProfile } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
const projectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  role: z.string().min(1, 'Role is required'),
  year: z.coerce.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 5, 'Invalid year'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
});
type ProjectFormData = z.infer<typeof projectSchema>;
function ProjectForm({ project, onFinished }: { project?: ResearchProject, onFinished: () => void }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const form = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: project?.title || '',
      description: project?.description || '',
      role: project?.role || '',
      year: project?.year || new Date().getFullYear(),
      url: project?.url || '',
    },
  });
  const mutation = useMutation({
    mutationFn: (data: Omit<ResearchProject, 'id' | 'type' | 'lecturerId'> & { lecturerId?: string }) =>
      api(project ? `/api/projects/${project.id}` : '/api/projects', {
        method: project ? 'PUT' : 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success(`Project ${project ? 'updated' : 'added'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer', currentUser?.id] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${project ? 'update' : 'add'} project: ${error.message}`);
    },
  });
  const onSubmit = (data: ProjectFormData) => {
    const payload = { ...data };
    if (project) {
      mutation.mutate(payload);
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
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="role" render={({ field }) => (
          <FormItem><FormLabel>Your Role</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
export function DashboardResearchPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedProj, setSelectedProj] = useState<ResearchProject | undefined>(undefined);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id;
  const { data: profile, isLoading: isLoadingProfile } = useQuery<LecturerProfile>({
    queryKey: ['lecturer', userId],
    queryFn: () => api(`/api/lecturers/${userId}`),
    enabled: !!userId,
  });
  const { data: allProjects, isLoading: isLoadingProjs } = useQuery<ResearchProject[]>({
    queryKey: ['projects'],
    queryFn: () => api('/api/projects'),
  });
  const userProjects = useMemo(() => {
    if (!profile || !allProjects) return [];
    const userProjIds = new Set(profile.projectIds);
    return allProjects.filter(proj => userProjIds.has(proj.id));
  }, [profile, allProjects]);
  const isLoading = isLoadingProfile || isLoadingProjs;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/projects/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Project deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['lecturer', userId] });
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
    onSettled: () => setAlertOpen(false),
  });
  const handleEdit = (proj: ResearchProject) => {
    setSelectedProj(proj);
    setFormOpen(true);
  };
  const handleAddNew = () => {
    setSelectedProj(undefined);
    setFormOpen(true);
  };
  const handleDelete = (proj: ResearchProject) => {
    setSelectedProj(proj);
    setAlertOpen(true);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Research</h1>
          <p className="text-muted-foreground">Add, edit, or delete your research projects.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProj ? 'Edit' : 'Add'} Research Project</DialogTitle>
              <DialogDescription>Fill in the details of the research project.</DialogDescription>
            </DialogHeader>
            <ProjectForm project={selectedProj} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Role</TableHead>
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
            ) : userProjects.length ? (
              userProjects.map((proj) => (
                <TableRow key={proj.id}>
                  <TableCell className="font-medium">{proj.title}</TableCell>
                  <TableCell>{proj.role}</TableCell>
                  <TableCell>{proj.year}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(proj)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(proj)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">No projects found.</TableCell>
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
              This action cannot be undone. This will permanently delete the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedProj && deleteMutation.mutate(selectedProj.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}