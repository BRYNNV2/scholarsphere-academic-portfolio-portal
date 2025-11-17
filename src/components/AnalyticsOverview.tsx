import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { AnalyticsData, AcademicWork } from '@shared/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, Bookmark, BookCopy, FlaskConical, Briefcase, TrendingUp } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const getTypeIcon = (type: AcademicWork['type']) => {
  switch (type) {
    case 'publication':
      return <BookCopy className="h-4 w-4 text-muted-foreground" />;
    case 'project':
    case 'research':
      return <FlaskConical className="h-4 w-4 text-muted-foreground" />;
    case 'portfolio':
      return <Briefcase className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};
export function AnalyticsOverview() {
  const { data: analytics, isLoading, isError } = useQuery<AnalyticsData>({
    queryKey: ['analytics', 'me'],
    queryFn: () => api.get('/api/users/me/analytics'),
  });
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }
  if (isError || !analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>Could not load analytics data. Please try again later.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  const hasEngagement = analytics.totalLikes > 0 || analytics.totalSaves > 0;
  const chartData = analytics.workBreakdown.map(item => ({
    name: item.title.length > 30 ? `${item.title.substring(0, 27)}...` : item.title,
    likes: item.likes,
    saves: item.saves,
  }));
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Overview</CardTitle>
        <CardDescription>
          See how students are engaging with your academic work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLikes}</div>
              <p className="text-xs text-muted-foreground">Across all your academic work</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Saves</CardTitle>
              <Bookmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalSaves}</div>
              <p className="text-xs text-muted-foreground">Saved by students for later</p>
            </CardContent>
          </Card>
        </div>
        {hasEngagement ? (
          <>
            <div>
              <h3 className="text-lg font-medium mb-4">Engagement Chart</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{
                      top: 5,
                      right: 20,
                      left: -10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={80} interval={0} />
                    <YAxis allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Legend />
                    <Bar dataKey="likes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="saves" fill="hsl(var(--primary) / 0.5)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Engagement Breakdown</h3>
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead className="text-center">Likes</TableHead>
                      <TableHead className="text-center">Saves</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analytics.workBreakdown.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <Link to={`/work/${item.id}`} className="font-medium hover:underline truncate" title={item.title}>
                              {item.title}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.likes}</TableCell>
                        <TableCell className="text-center">{item.saves}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<TrendingUp className="h-8 w-8" />}
            title="No Engagement Data Yet"
            description="Once students start liking or saving your work, you'll see detailed analytics here."
            className="py-12"
          />
        )}
      </CardContent>
    </Card>
  );
}