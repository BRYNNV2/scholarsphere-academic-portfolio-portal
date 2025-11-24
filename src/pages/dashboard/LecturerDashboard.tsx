import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCopy, FlaskConical, User, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnalyticsOverview } from '@/components/AnalyticsOverview';

export function LecturerDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lecturer Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Manage your academic portfolio here.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/profile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Manage Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Update your biography, contact details, and specializations.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/publications">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Publications</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Add, edit, and organize your published articles and papers.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/research">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Research</CardTitle>
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Showcase your ongoing and completed research projects.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/portfolio">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Highlight awards, grants, and other professional activities.
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors">
          <Link to="/dashboard/courses">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mata Kuliah</CardTitle>
              <BookCopy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Manage courses and student projects.
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      <AnalyticsOverview />
    </div>
  );
}