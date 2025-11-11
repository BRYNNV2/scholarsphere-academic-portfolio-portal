import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
export function DashboardPage() {
  return (
    <AppLayout container>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your academic portfolio here.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
            <CardDescription>
              This is where your portfolio management tools will live. Use the sidebar to navigate between sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Content management forms and tables for publications, projects, and profile details will be implemented in the next phase.</p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}