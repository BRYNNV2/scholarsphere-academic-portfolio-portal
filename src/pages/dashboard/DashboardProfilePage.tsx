import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { UserProfile } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  university: z.string().min(1, 'University is required'),
  department: z.string().min(1, 'Department is required'),
  email: z.string().email('Invalid email address'),
  bio: z.string().min(10, 'Biography must be at least 10 characters'),
  photoUrl: z.string().optional(),
  specializations: z.string().min(1, 'At least one specialization is required'),
  socialLinks: z.object({
    twitter: z.string().url().optional().or(z.literal('')),
    linkedin: z.string().url().optional().or(z.literal('')),
    github: z.string().url().optional().or(z.literal('')),
  }).optional(),
});
type ProfileFormData = z.infer<typeof profileSchema>;
export function DashboardProfilePage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const userId = currentUser?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => api(`/api/users/${userId}`),
    enabled: !!userId, // Only run query if userId is available
  });
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      title: '',
      university: '',
      department: '',
      email: '',
      bio: '',
      photoUrl: '',
      specializations: '',
      socialLinks: {
        twitter: '',
        linkedin: '',
        github: '',
      },
    },
  });
  const photoUrlValue = form.watch('photoUrl');
  useEffect(() => {
    if (profile) {
      form.reset({
        ...profile,
        specializations: profile.specializations.join(', '),
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          linkedin: profile.socialLinks?.linkedin || '',
          github: profile.socialLinks?.github || '',
        }
      });
    }
  }, [profile, form]);
  const mutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
      api<UserProfile>(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (updatedProfile) => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
  const onSubmit = (data: ProfileFormData) => {
    const payload = {
      ...data,
      specializations: data.specializations.split(',').map(s => s.trim()).filter(Boolean),
    };
    mutation.mutate(payload);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
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
      form.setValue('photoUrl', result, { shouldValidate: true, shouldDirty: true });
    };
    reader.onerror = () => {
      toast.error('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/4" />
        <Skeleton className="h-4 w-1/2" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }
  if (isError || !profile) {
    return <div>Error loading profile data. Please try again later.</div>;
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Profile</h1>
        <p className="text-muted-foreground">Update your personal and professional information.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>This information will be displayed on your public portfolio page.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="photoUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Picture</FormLabel>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={photoUrlValue} alt={profile.name} />
                      <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow">
                      <FormControl>
                        <Input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleFileChange}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Image
                      </Button>
                      <FormDescription className="mt-2">
                        Upload a new profile picture. Max file size: 2MB.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </div>
                </FormItem>
              )} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="title" render={({ field }) => (
                  <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Professor of Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="university" render={({ field }) => (
                  <FormItem><FormLabel>University</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="department" render={({ field }) => (
                  <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem><FormLabel>Biography</FormLabel><FormControl><Textarea rows={5} {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="specializations" render={({ field }) => (
                <FormItem><FormLabel>Specializations</FormLabel><FormControl><Input {...field} /></FormControl><FormDescription>Enter a comma-separated list of your specializations.</FormDescription><FormMessage /></FormItem>
              )} />
              <div>
                <h3 className="text-lg font-medium">Social Links</h3>
                <div className="space-y-4 mt-2">
                  <FormField control={form.control} name="socialLinks.twitter" render={({ field }) => (
                    <FormItem><FormLabel>Twitter URL</FormLabel><FormControl><Input placeholder="https://twitter.com/username" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="socialLinks.linkedin" render={({ field }) => (
                    <FormItem><FormLabel>LinkedIn URL</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/username" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="socialLinks.github" render={({ field }) => (
                    <FormItem><FormLabel>GitHub URL</FormLabel><FormControl><Input placeholder="https://github.com/username" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </div>
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}