import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { StudentProject } from '@shared/types';
import { ExternalLink, Users } from 'lucide-react';

interface StudentProjectCardProps {
    project: StudentProject;
    actions?: React.ReactNode;
}

export function StudentProjectCard({ project, actions }: StudentProjectCardProps) {
    return (
        <Card className="h-full overflow-hidden hover:shadow-md transition-shadow flex flex-col">
            <AspectRatio ratio={16 / 9} className="bg-muted relative group">
                {project.thumbnailUrl ? (
                    <img src={project.thumbnailUrl} alt={project.title} className="object-cover w-full h-full" />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        <Users className="h-12 w-12" />
                    </div>
                )}
                {actions && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-md shadow-sm">
                        {actions}
                    </div>
                )}
            </AspectRatio>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-1" title={project.title}>{project.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 flex-grow">
                <div className="text-sm font-medium text-primary line-clamp-1" title={project.students.join(', ')}>
                    {project.students.join(', ')}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-grow">{project.description}</p>
                {project.url && (
                    <Button variant="outline" size="sm" className="mt-auto w-full" asChild>
                        <a href={project.url} target="_blank" rel="noopener noreferrer">
                            View Project <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
