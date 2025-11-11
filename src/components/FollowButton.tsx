import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth-store';
import { UserProfile } from '@shared/types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { UserPlus, UserCheck } from 'lucide-react';
interface FollowButtonProps {
  lecturer: UserProfile;
}
export function FollowButton({ lecturer }: FollowButtonProps) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const isFollowing = currentUser?.followingIds?.includes(lecturer.id) ?? false;
  const mutation = useMutation({
    mutationFn: () => {
      const url = `/api/users/${lecturer.id}/follow`;
      const method = isFollowing ? 'DELETE' : 'POST';
      return api<UserProfile>(url, { method });
    },
    onSuccess: (updatedCurrentUserProfile) => {
      toast.success(isFollowing ? `Unfollowed ${lecturer.name}` : `Now following ${lecturer.name}`);
      // Update the current user's state in zustand
      updateUser(updatedCurrentUserProfile);
      // Invalidate queries to refetch data for both users
      queryClient.invalidateQueries({ queryKey: ['user', currentUser?.id] });
      queryClient.invalidateQueries({ queryKey: ['user', lecturer.id] });
    },
    onError: (error) => {
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'}: ${(error as Error).message}`);
    },
  });
  const canFollow = currentUser && currentUser.role === 'student' && currentUser.id !== lecturer.id;
  return (
    <div className="flex items-center gap-4">
      <div className="text-center">
        <p className="font-bold text-lg">{lecturer.followerIds?.length ?? 0}</p>
        <p className="text-sm text-muted-foreground">Followers</p>
      </div>
      {canFollow && (
        <Button
          variant={isFollowing ? 'outline' : 'default'}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {isFollowing ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" /> Following
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" /> Follow
            </>
          )}
        </Button>
      )}
    </div>
  );
}