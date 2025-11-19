import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Bookmark, Book, FlaskConical, Briefcase } from 'lucide-react';
import { AcademicWork, UserProfile } from '@shared/types';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useAuthStore } from '@/stores/auth-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "@/lib/api-client-fixed";
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
interface AcademicWorkListItemProps {
  item: AcademicWork;
}
function SaveButton({ itemId }: { itemId: string }) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const canSave = currentUser?.role === 'student';
  const isSaved = (currentUser?.savedItemIds ?? []).includes(itemId);
  const saveMutation = useMutation({
    mutationFn: () => isSaved
      ? api.delete(`/api/users/me/save/${itemId}`)
      : api.post(`/api/users/me/save/${itemId}`),
    onSuccess: (updatedProfile: UserProfile) => {
      toast.success(isSaved ? 'Item unsaved!' : 'Item saved for later!');
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      updateUser(updatedProfile);
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  if (!canSave) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={(e) => {
        e.preventDefault(); // Prevent navigation
        saveMutation.mutate();
      }}
      disabled={saveMutation.isPending}
    >
      <Bookmark className={cn("mr-2 h-4 w-4", isSaved && "fill-primary text-primary")} />
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}
export function AcademicWorkListItem({ item }: AcademicWorkListItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'publication': return <Book className="h-10 w-10" />;
      case 'project':
      case 'research': return <FlaskConical className="h-10 w-10" />;
      case 'portfolio': return <Briefcase className="h-10 w-10" />;
      default: return null;
    }
  };
  const renderMeta = () => {
    switch (item.type) {
      case 'publication':
        return (
          <>
            <p className="text-sm text-muted-foreground mt-1">{item.authors.join(', ')}</p>
            <p className="text-sm text-muted-foreground mt-1"><em>{item.journal}</em>, {item.year}</p>
          </>
        );
      case 'project':
        return (
          <p className="text-sm text-muted-foreground mt-1"><strong>Role:</strong> {item.role} ({item.year})</p>
        );
      case 'portfolio':
        return (
          <p className="text-sm text-muted-foreground mt-1">{item.year} &middot; <Badge variant="outline" className="ml-1">{item.category}</Badge></p>
        );
      default:
        return null;
    }
  };
  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/3 md:w-1/4">
          <Link to={`/work/${item.id}`}>
            <AspectRatio ratio={16 / 9} className="bg-muted">
              {item.thumbnailUrl ?
                <img src={item.thumbnailUrl} alt={item.title} className="object-cover w-full h-full" /> :
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  {getIcon()}
                </div>
              }
            </AspectRatio>
          </Link>
        </div>
        <div className="flex-1">
          <CardContent className="p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <Link to={`/work/${item.id}`} className="hover:underline">
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                </Link>
                {renderMeta()}
              </div>
              <div className="flex-shrink-0">
                <SaveButton itemId={item.id} />
              </div>
            </div>
            <div className="flex justify-between items-end mt-2">
              {(item.type === 'project' || item.type === 'portfolio') && (
                <p className="text-sm text-muted-foreground flex-grow pr-4">
                  {item.description.length > 100 ? `${item.description.substring(0, 100)}...` : item.description}
                </p>
              )}
              {item.url &&
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 flex-shrink-0 ml-auto">
                  View Details <ExternalLink className="h-4 w-4" />
                </a>
              }
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}