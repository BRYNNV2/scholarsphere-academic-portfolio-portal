import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from '@/hooks/use-theme';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type PasswordFormData = z.infer<typeof passwordSchema>;
function ChangePasswordForm({ onFinished }: { onFinished: () => void }) {
  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });
  const mutation = useMutation({
    mutationFn: (data: Omit<PasswordFormData, 'confirmPassword'>) =>
      api('/api/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      onFinished();
    },
    onError: (error) => {
      toast.error(`Failed to change password: ${(error as Error).message}`);
    },
  });
  const onSubmit = (data: PasswordFormData) => {
    const { confirmPassword, ...payload } = data;
    mutation.mutate(payload);
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="currentPassword" render={({ field }) => (
          <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="newPassword" render={({ field }) => (
          <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
          <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
          <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
}
export function DashboardSettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [isPasswordDialogOpen, setPasswordDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const deleteMutation = useMutation({
    mutationFn: () => api('/api/users/me', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Your account has been deleted successfully.');
      logout();
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/');
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${(error as Error).message}`);
    },
  });
  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account and application preferences.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Enable or disable the dark theme.
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={isDark}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog open={isPasswordDialogOpen} onOpenChange={setPasswordDialogOpen}>
              <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
                <div>
                    <p className="font-medium">Change Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password.</p>
                </div>
                <DialogTrigger asChild>
                  <Button variant="outline">Change Password</Button>
                </DialogTrigger>
              </div>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>Enter your current and new password below.</DialogDescription>
                </DialogHeader>
                <ChangePasswordForm onFinished={() => setPasswordDialogOpen(false)} />
              </DialogContent>
            </Dialog>
            <div className="flex items-center justify-between p-4 border border-destructive/50 border-dashed rounded-lg">
              <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all associated data.</p>
              </div>
              <Button variant="destructive" onClick={() => setAlertOpen(true)} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}