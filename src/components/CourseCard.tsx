import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@shared/types';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onClick?: () => void;
}

export function CourseCard({ course, onClick }: CourseCardProps) {
    return (
        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        {course.title}
                    </CardTitle>
                    <Badge variant="secondary">{course.code}</Badge>
                </div>
                <CardDescription>{course.semester} {course.year}</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{course.description}</p>
                <div className="mt-4 text-xs text-muted-foreground">
                    {course.studentProjectIds.length} Student Projects
                </div>
            </CardContent>
        </Card>
    );
}
