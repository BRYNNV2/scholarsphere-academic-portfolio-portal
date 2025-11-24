import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { StudentProject } from '@shared/types';
import { ExternalLink, Users } from 'lucide-react';

interface StudentProjectCardProps {
    project: StudentProject;
}

export function StudentProjectCard({ project }: StudentProjectCardProps) {
    return (
        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
            <AspectRatio ratio={16 / 9} className="bg-muted">
                {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="object-cover w-full h-full" />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Users className="h-12 w-12" />
                    </div>
                )}
            </AspectRatio>
            <CardHeader>
                <CardTitle className="text-lg">{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <div className="text-sm font-medium text-primary">
                    {project.students.join(', ')}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                {project.url && (
                    <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                            View Project <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
