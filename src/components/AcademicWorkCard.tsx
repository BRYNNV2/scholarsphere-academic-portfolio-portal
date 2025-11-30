import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { ExternalLink, User, BookCopy, FlaskConical, Briefcase, Bookmark } from 'lucide-react';
import { AcademicWork, UserProfile } from '@shared/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { toast } from 'sonner';
import { cn, getProfileUrl } from '@/lib/utils';
interface AcademicWorkCardProps {
  item: AcademicWork;
  author?: UserProfile;
  index: number;
}
export function AcademicWorkCard({ item, author, index }: AcademicWorkCardProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const canSave = currentUser?.role === 'student';
  const isSaved = (currentUser?.savedItemIds ?? []).includes(item.id);
  const saveMutation = useMutation({
    mutationFn: () => isSaved ?
      api.delete(`/api/users/me/save/${item.id}`) :
      api.post(`/api/users/me/save/${item.id}`, {}),
    onSuccess: (updatedProfile: UserProfile) => {
      toast.success(isSaved ? 'Item unsaved!' : 'Item saved for later!');
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  const getIcon = () => {
    switch (item.type) {
      case 'publication': return <BookCopy className="h-12 w-12" />;
      case 'project': return <FlaskConical className="h-12 w-12" />;
      case 'portfolio': return <Briefcase className="h-12 w-12" />;
      default: return null;
    }
  };
  const itemUrl = `/work/${item.id}`;
  return (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="h-full">

      <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 relative">
        {canSave &&
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 bg-background/70 hover:bg-background"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}>

            <Bookmark className={cn("h-5 w-5", isSaved && "fill-primary text-primary")} />
          </Button>
        }
        <Link to={itemUrl}>
          <AspectRatio ratio={16 / 9} className="bg-muted">
            {item.thumbnailUrl ?
              <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" /> :

              <div className="flex items-center justify-center h-full text-muted-foreground">
                {getIcon()}
              </div>
            }
          </AspectRatio>
        </Link>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg flex-grow pr-2">
              <Link to={itemUrl} className="hover:underline">{item.title}</Link>
            </CardTitle>
            {item.type === 'portfolio' && <Badge variant="outline">{item.category}</Badge>}
          </div>
          {item.type !== 'publication' && <CardDescription>{item.year}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow flex flex-col">
          <div className="text-sm text-muted-foreground flex-grow">
            {item.type === 'publication' && <p>{item.authors.join(', ')}</p>}
            {item.type === 'publication' && <p><em>{item.journal}</em>, {item.year}</p>}
            {item.type === 'project' && <p>{item.description}</p>}
            {item.type === 'portfolio' && <p>{item.description}</p>}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            {author ?
              <Button variant="ghost" size="sm" asChild>
                <Link to={getProfileUrl(author)} className="text-sm">
                  <User className="mr-2 h-4 w-4" />
                  {author.name}
                </Link>
              </Button> :
              <div />}
            {item.url &&
              <Button variant="outline" size="sm" asChild>
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  View <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            }
          </div>
        </CardContent>
      </Card>
    </motion.div>);

}