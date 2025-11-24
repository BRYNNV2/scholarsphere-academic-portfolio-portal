import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client-fixed';
import { Course, UserProfile } from '@shared/types';
import { Search, GraduationCap, User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function CoursesDirectoryPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: courses, isLoading: isLoadingCourses } = useQuery<Course[]>({
        queryKey: ['public-courses'],
        queryFn: () => api.get('/api/courses')
    });

    const { data: users } = useQuery<UserProfile[]>({
        queryKey: ['users'],
        queryFn: () => api.get('/api/users')
    });

    const filteredCourses = courses?.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getLecturer = (lecturerId: string) => {
        return users?.find(u => u.id === lecturerId);
    };

    return (
        <PublicLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <h1 className="text-4xl font-display font-bold text-foreground mb-4">Browse Courses</h1>
                    <p className="text-xl text-muted-foreground">
                        Explore courses taught by our distinguished academics.
                    </p>
                </div>

                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title, code, or description..."
                            className="pl-10 h-12"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingCourses ? (
                    <div className="text-center py-12">Loading courses...</div>
                ) : filteredCourses && filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => {
                            const lecturer = getLecturer(course.lecturerId);
                            return (
                                <Link key={course.id} to={`/users/${course.lecturerId}`}>
                                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                                        <CardContent className="p-6 flex flex-col h-full">
                                            <div className="flex items-start gap-3 mb-4">
                                                <GraduationCap className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                                                <div>
                                                    <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                                                    <p className="text-sm font-medium text-muted-foreground">{course.code}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Semester {course.semester} - {course.title}
                                                    </p>
                                                </div>
                                            </div>

                                            <p className="text-muted-foreground text-sm line-clamp-4 mb-6 flex-grow">
                                                {course.description}
                                            </p>

                                            <div className="pt-4 border-t flex items-center gap-2">
                                                {lecturer?.photoUrl ? (
                                                    <img src={lecturer.photoUrl} alt={lecturer.name} className="h-6 w-6 rounded-full object-cover" />
                                                ) : (
                                                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-3 w-3 text-muted-foreground" />
                                                    </div>
                                                )}
                                                <span className="text-sm font-medium text-foreground">{lecturer?.name || 'Unknown Lecturer'}</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        No courses found matching your search.
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
