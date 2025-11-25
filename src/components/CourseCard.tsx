import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Course } from '@shared/types';
import { BookOpen } from 'lucide-react';

interface CourseCardProps {
    course: Course;
    onClick?: () => void;
    actions?: React.ReactNode;
}

export function CourseCard({ course, onClick, actions }: CourseCardProps) {
    return (
        <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col group relative" onClick={onClick}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg flex items-center gap-2 leading-tight">
                        <BookOpen className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="line-clamp-2">{course.title}</span>
                    </CardTitle>
                    <Badge variant="secondary" className="flex-shrink-0">{course.code}</Badge>
                </div>
                <CardDescription>{course.semester} {course.year}</CardDescription>
                {actions && (
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        {actions}
                    </div>
                )}
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">{course.description}</p>
                <div className="mt-auto pt-4 border-t text-xs text-muted-foreground flex justify-between items-center">
                    <span>{course.studentProjectIds.length} Student Projects</span>
                </div>
            </CardContent>
        </Card>
    );
}
