import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { BookOpenCheck } from 'lucide-react';
import { MOCK_LECTURERS } from '@shared/mock-data';
import { LecturerProfile } from '@shared/types';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);
  // In a real app, this would be a form with username/password.
  // For this mock, we'll just "log in" as the first mock user.
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // We fetch the user profile to simulate a real login process
      const userToLogin = await api<LecturerProfile>(`/api/lecturers/${MOCK_LECTURERS[0].id}`);
      login(userToLogin);
      toast.success(`Welcome back, ${userToLogin.name}!`);
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2">
            <BookOpenCheck className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">ScholarSphere</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value="e.reed@stanford.edu" readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value="●●●●●●●●" readOnly />
            </div>
            <p className="text-xs text-center text-muted-foreground pt-2">
              (Demo login with pre-filled credentials)
            </p>
            <Button onClick={handleLogin} disabled={isLoading} className="w-full">
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}