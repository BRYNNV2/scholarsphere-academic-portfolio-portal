import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
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
export function DashboardSettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const [isAlertOpen, setAlertOpen] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const deleteMutation = useMutation({
    mutationFn: () => api('/api/lecturers/me', { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Your account has been deleted successfully.');
      logout();
      queryClient.invalidateQueries({ queryKey: ['lecturers'] });
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
            <div className="flex items-center justify-between p-4 border border-dashed rounded-lg">
              <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password.</p>
              </div>
              <Button variant="outline" disabled>Coming Soon</Button>
            </div>
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