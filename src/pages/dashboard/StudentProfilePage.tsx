import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "../../lib/api-client-fixed";
import { UserProfile } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth-store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
const studentProfileSchema = z.object({
  photoUrl: z.string().optional()
});
type StudentProfileFormData = z.infer<typeof studentProfileSchema>;
export function StudentProfilePage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const userId = currentUser?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: profile, isLoading, isError } = useQuery<UserProfile>({
    queryKey: ['user', userId],
    queryFn: () => api(`/api/users/${userId}`),
    enabled: !!userId
  });
  const form = useForm<StudentProfileFormData>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      photoUrl: ''
    }
  });
  const photoUrlValue = form.watch('photoUrl');
  useEffect(() => {
    if (profile) {
      form.reset({
        photoUrl: profile.photoUrl
      });
    }
  }, [profile, form]);
  const mutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) =>
    api<UserProfile>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    onSuccess: (updatedProfile) => {
      toast.success('Profile picture updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${(error as Error).message}`);
    }
  });
  const onSubmit = (data: StudentProfileFormData) => {
    mutation.mutate(data);
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
            <div className="flex items-center gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>);

  }
  if (isError || !profile) {
    return <div>Error loading profile data. Please try again later.</div>;
  }
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Manage Profile</h1>
        <p className="text-muted-foreground">Update your profile picture.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>This image will be displayed on your comments and profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="photoUrl"
                render={({ field }) =>
                <FormItem>
                    <FormLabel>Your Avatar</FormLabel>
                    <div className="flex items-center gap-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={photoUrlValue} alt={profile.name} />
                        <AvatarFallback>{profile.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
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
                          Upload a new profile picture. Max file size: 2MB.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                } />

              <Button type="submit" disabled={mutation.isPending || !form.formState.isDirty}>
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>);

}