import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { api } from "../../lib/api-client";
import { PortfolioItem, UserProfile } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { PlusCircle, Edit, Trash2, Image as ImageIcon, Briefcase } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { EmptyState } from '@/components/EmptyState';
const portfolioItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  year: z.number().int().min(1900, 'Invalid year').max(new Date().getFullYear() + 5, 'Invalid year'),
  url: z.string().url('Invalid URL').optional().or(z.literal('')),
  thumbnailUrl: z.string().optional()
});
type PortfolioItemFormData = z.infer<typeof portfolioItemSchema>;
function PortfolioItemForm({ item, onFinished }: {item?: PortfolioItem;onFinished: () => void;}) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const form = useForm<PortfolioItemFormData>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      title: item?.title || '',
      category: item?.category || '',
      description: item?.description || '',
      year: item?.year || new Date().getFullYear(),
      url: item?.url || '',
      thumbnailUrl: item?.thumbnailUrl || ''
    }
  });
  const thumbnailUrlValue = form.watch('thumbnailUrl');
  const mutation = useMutation({
    mutationFn: (data: Partial<PortfolioItem> & {lecturerId?: string;}) =>
    api(item ? `/api/portfolio/${item.id}` : '/api/portfolio', {
      method: item ? 'PUT' : 'POST',
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast.success(`Portfolio item ${item ? 'updated' : 'added'} successfully!`);
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to ${item ? 'update' : 'add'} item: ${(error as Error).message}`);
    }
  });
  const onSubmit = (data: PortfolioItemFormData) => {
    const payload = { ...data };
    if (item) {
      mutation.mutate(payload);
    } else {
      mutation.mutate({ ...payload, lecturerId: currentUser?.id, commentIds: [], likeIds: [] });
    }
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File is too large. Maximum size is 2MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type. Please select an image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      form.setValue('thumbnailUrl', result, { shouldValidate: true, shouldDirty: true });
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="thumbnailUrl" render={({ field }) =>
        <FormItem>
            <FormLabel>Cover Image</FormLabel>
            <div className="flex items-center gap-4">
              <div className="w-32">
                <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                  {thumbnailUrlValue ?
                <img src={thumbnailUrlValue} alt="Cover image preview" className="object-cover w-full h-full" /> :

                <div className="flex items-center justify-center h-full text-muted-foreground">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                }
                </AspectRatio>
              </div>
              <div className="flex-grow">
                <FormControl>
                  <Input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleFileChange} />

                </FormControl>
                <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}>

                  Upload Image
                </Button>
                <FormDescription className="mt-2">
                  Optional. Max file size: 2MB.
                </FormDescription>
                <FormMessage />
              </div>
            </div>
          </FormItem>
        } />
        <FormField control={form.control} name="title" render={({ field }) =>
        <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        } />
        <FormField control={form.control} name="category" render={({ field }) =>
        <FormItem><FormLabel>Category</FormLabel><FormControl><Input placeholder="e.g., Award, Grant, Teaching" {...field} /></FormControl><FormMessage /></FormItem>
        } />
        <FormField control={form.control} name="description" render={({ field }) =>
        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        } />
        <FormField control={form.control} name="year" render={({ field }) =>
        <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} /></FormControl><FormMessage /></FormItem>
        } />
        <FormField control={form.control} name="url" render={({ field }) =>
        <FormItem><FormLabel>URL</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
        } />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </form>
    </Form>);

}
export function DashboardPortfolioPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | undefined>(undefined);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const userId = currentUser?.id;
  const { data: profile, isLoading: isLoadingProfile } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => api(`/api/users/${userId}`),
    enabled: !!userId
  });
  const { data: allItems, isLoading: isLoadingItems } = useQuery<PortfolioItem[]>({
    queryKey: ['portfolio'],
    queryFn: () => api('/api/portfolio')
  });
  const userPortfolioItems = useMemo(() => {
    if (!profile || !allItems) return [];
    const userItemIds = new Set(profile.portfolioItemIds);
    return allItems.filter((item) => userItemIds.has(item.id));
  }, [profile, allItems]);
  const isLoading = isLoadingProfile || isLoadingItems;
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/api/portfolio/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Portfolio item deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
    },
    onError: (error) => {
      toast.error(`Failed to delete item: ${(error as Error).message}`);
    },
    onSettled: () => setAlertOpen(false)
  });
  const handleEdit = (item: PortfolioItem) => {
    setSelectedItem(item);
    setFormOpen(true);
  };
  const handleAddNew = () => {
    setSelectedItem(undefined);
    setFormOpen(true);
  };
  const handleDelete = (item: PortfolioItem) => {
    setSelectedItem(item);
    setAlertOpen(true);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Portfolio</h1>
          <p className="text-muted-foreground">Add, edit, or delete your professional activities.</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4" /> Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedItem ? 'Edit' : 'Add'} Portfolio Item</DialogTitle>
              <DialogDescription>Fill in the details of your award, grant, or other activity.</DialogDescription>
            </DialogHeader>
            <PortfolioItemForm item={selectedItem} onFinished={() => setFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ?
            Array.from({ length: 3 }).map((_, i) =>
            <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                </TableRow>
            ) :
            userPortfolioItems.length > 0 ?
            userPortfolioItems.map((item) =>
            <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.year}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(item)}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
            ) :

            <TableRow>
                <TableCell colSpan={4} className="p-0">
                   <EmptyState
                  icon={<Briefcase className="h-8 w-8" />}
                  title="No Portfolio Items Yet"
                  description="Highlight your awards, grants, and other activities by adding them here."
                  action={{ label: 'Add Item', onClick: handleAddNew }} />

                </TableCell>
              </TableRow>
            }
          </TableBody>
        </Table>
      </div>
       <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this portfolio item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => selectedItem && deleteMutation.mutate(selectedItem.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);

}