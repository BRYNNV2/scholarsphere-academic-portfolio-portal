import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { Comment, Like } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CommentsSectionProps {
  postId: string;
  postOwnerId?: string; // Optional: ID of the user who owns the post (for lecturer deletion)
}

export function CommentsSection({ postId, postOwnerId }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: comments, isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['comments', postId],
    queryFn: () => api.get(`/api/posts/${postId}/comments`)
  });

  const { data: likes, isLoading: isLoadingLikes } = useQuery<Like[]>({
    queryKey: ['likes', postId],
    queryFn: () => api.get(`/api/posts/${postId}/likes`)
  });

  const hasLiked = likes?.some((like) => like.userId === currentUser?.id);

  const likeMutation = useMutation({
    mutationFn: () => hasLiked ? api.delete(`/api/likes/${postId}`) : api.post('/api/likes', { postId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['likes', postId] });
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  const commentMutation = useMutation({
    mutationFn: (content: string) => api.post('/api/comments', { postId, content }),
    onSuccess: () => {
      setComment('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment posted!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/api/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment deleted');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate(comment.trim());
  };

  const canInteract = isAuthenticated && currentUser?.role === 'student';

  const canDelete = (comment: Comment) => {
    if (!currentUser) return false;
    // User can delete their own comment
    if (comment.userId === currentUser.id) return true;
    // Lecturer can delete comments on their own posts
    if (currentUser.role === 'lecturer' && postOwnerId === currentUser.id) return true;
    return false;
  };

  return (
    <div className="border-t p-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" size="sm" onClick={() => likeMutation.mutate()} disabled={!canInteract || likeMutation.isPending}>
          <Heart className={cn("mr-2 h-4 w-4", hasLiked && "fill-red-500 text-red-500")} />
          {isLoadingLikes ? <Skeleton className="h-4 w-4" /> : likes?.length || 0}
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          {isLoadingComments ? <Skeleton className="h-4 w-4" /> : comments?.length || 0}
        </div>
      </div>

      {canInteract &&
        <form onSubmit={handleCommentSubmit} className="flex items-start gap-4 mb-6">
          <Avatar className="h-9 w-9">
            <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-2" />

            <Button type="submit" size="sm" disabled={commentMutation.isPending}>
              {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
            </Button>
          </div>
        </form>
      }

      <div className="space-y-4">
        {isLoadingComments ?
          <div className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div> :
          comments && comments.length > 0 ?
            comments.map((c) => (
              <div key={c.id} className="flex items-start gap-4 group">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={c.userPhotoUrl} alt={c.userName} />
                  <AvatarFallback>{c.userName.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold">{c.userName}</span>
                      <span className="text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                    </div>
                    {canDelete(c) && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteCommentMutation.mutate(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
                </div>
              </div>
            )) :
            <p className="text-sm text-muted-foreground">No comments yet.</p>
        }
      </div>
    </div>
  );
}