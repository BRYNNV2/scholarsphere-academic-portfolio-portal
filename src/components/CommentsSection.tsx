import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from "../lib/api-client-fixed";
import { Comment, Like } from '@shared/types';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageSquare, Lock, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
interface CommentsSectionProps {
  postId: string;
  authorId: string;
}
export function CommentsSection({ postId, authorId }: CommentsSectionProps) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [deletingComment, setDeletingComment] = useState<Comment | null>(null);
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
    mutationFn: (data: { content: string; visibility: 'public' | 'private' }) => api.post('/api/comments', { postId, ...data }),
    onSuccess: () => {
      setComment('');
      setVisibility('public');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['my-comments', currentUser?.id] });
      toast.success('Comment posted!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  const updateCommentMutation = useMutation({
    mutationFn: (data: { commentId: string; content: string }) => api.put(`/api/comments/${data.commentId}`, { content: data.content }),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditedContent('');
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['my-comments', currentUser?.id] });
      toast.success('Comment updated!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => api.delete(`/api/comments/${commentId}`),
    onSuccess: () => {
      setDeletingComment(null);
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['my-comments', currentUser?.id] });
      toast.success('Comment deleted!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  const updateVisibilityMutation = useMutation({
    mutationFn: (data: { commentId: string; visibility: 'public' | 'private' }) =>
      api.put(`/api/comments/${data.commentId}/visibility`, { visibility: data.visibility }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      toast.success('Comment visibility updated!');
    },
    onError: (error) => {
      toast.error((error as Error).message);
    }
  });
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    commentMutation.mutate({ content: comment.trim(), visibility });
  };
  const handleUpdateSubmit = () => {
    if (!editedContent.trim() || !editingCommentId) return;
    updateCommentMutation.mutate({ commentId: editingCommentId, content: editedContent.trim() });
  };
  const canInteract = isAuthenticated;
  const isAuthor = currentUser?.id === authorId;
  return (
    <>
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
              <div className="flex justify-between items-center">
                {currentUser?.role !== 'student' ? (
                  <RadioGroup defaultValue="public" value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)} className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="public" id={`r1-${postId}`} />
                      <Label htmlFor={`r1-${postId}`}>Public</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="private" id={`r2-${postId}`} />
                      <Label htmlFor={`r2-${postId}`}>Private</Label>
                    </div>
                  </RadioGroup>
                ) : <div />}
                <Button type="submit" size="sm" disabled={commentMutation.isPending}>
                  {commentMutation.isPending ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
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
          comments.map((c) =>
          <div key={c.id} className="flex items-start gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={c.userPhotoUrl} alt={c.userName} />
                  <AvatarFallback>{c.userName.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-semibold">{c.userName}</span>
                        <span className="text-muted-foreground">{formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}</span>
                        {c.visibility === 'private' && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Lock className="h-3 w-3" /> Private
                          </Badge>
                        )}
                      </div>
                      {editingCommentId === c.id ? (
                        <div className="mt-2">
                          <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="mb-2" />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleUpdateSubmit} disabled={updateCommentMutation.isPending}>
                              {updateCommentMutation.isPending ? 'Saving...' : 'Save'}
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCommentId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{c.content}</p>
                      )}
                    </div>
                    {(currentUser?.id === c.userId || isAuthor) && editingCommentId !== c.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {currentUser?.id === c.userId && (
                            <>
                              <DropdownMenuItem onClick={() => { setEditingCommentId(c.id); setEditedContent(c.content); }}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setDeletingComment(c)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </>
                          )}
                          {isAuthor && (
                            <>
                              {currentUser?.id === c.userId && <DropdownMenuSeparator />}
                              {c.visibility === 'public' ? (
                                <DropdownMenuItem onClick={() => updateVisibilityMutation.mutate({ commentId: c.id, visibility: 'private' })}>
                                  <EyeOff className="mr-2 h-4 w-4" /> Make Private
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => updateVisibilityMutation.mutate({ commentId: c.id, visibility: 'public' })}>
                                  <Eye className="mr-2 h-4 w-4" /> Make Public
                                </DropdownMenuItem>
                              )}
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
          ) :
          <p className="text-sm text-muted-foreground">No comments yet.</p>
          }
        </div>
      </div>
      <AlertDialog open={!!deletingComment} onOpenChange={(open) => !open && setDeletingComment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingComment && deleteCommentMutation.mutate(deletingComment.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteCommentMutation.isPending}
            >
              {deleteCommentMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}