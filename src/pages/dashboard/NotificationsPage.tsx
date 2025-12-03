import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { api } from "@/lib/api-client";
import { Notification } from "@shared/types";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function NotificationsPage() {
    const user = useAuthStore((state) => state.user);
    const queryClient = useQueryClient();

    const { data: notifications, isLoading } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            return await api<Notification[]>("/api/notifications");
        },
        enabled: !!user,
    });

    const markReadMutation = useMutation({
        mutationFn: async (id: string) => {
            await api(`/api/notifications/${id}/read`, { method: "PUT" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const markAllReadMutation = useMutation({
        mutationFn: async () => {
            await api("/api/notifications/read-all", { method: "PUT" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("All caught up!", {
                description: "All notifications marked as read.",
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api(`/api/notifications/${id}`, { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("Notification deleted");
        },
    });

    const deleteAllMutation = useMutation({
        mutationFn: async () => {
            await api("/api/notifications", { method: "DELETE" });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            toast.success("All notifications cleared");
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

    return (
        <div className="container max-w-4xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">
                            You have {unreadCount} unread notification{unreadCount !== 1 && "s"}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button
                            variant="outline"
                            onClick={() => markAllReadMutation.mutate()}
                            disabled={markAllReadMutation.isPending}
                        >
                            {markAllReadMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Check className="h-4 w-4 mr-2" />
                            )}
                            Mark all as read
                        </Button>
                    )}
                    {notifications && notifications.length > 0 && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Are you sure you want to clear all notifications?")) {
                                    deleteAllMutation.mutate();
                                }
                            }}
                            disabled={deleteAllMutation.isPending}
                        >
                            {deleteAllMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Clear all
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {notifications?.length === 0 ? (
                    <div className="text-center py-12 bg-muted/30 rounded-lg border border-dashed">
                        <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium">No notifications yet</h3>
                        <p className="text-muted-foreground">
                            When you get comments or likes, they'll show up here.
                        </p>
                    </div>
                ) : (
                    notifications?.map((notification) => (
                        <Card
                            key={notification.id}
                            className={`transition-colors ${!notification.isRead ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                                }`}
                        >
                            <CardContent className="p-4 flex gap-4 items-start">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={notification.actorPhotoUrl} />
                                    <AvatarFallback>{notification.actorName[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm leading-none">
                                        <span className="font-semibold">{notification.actorName}</span>{" "}
                                        <span className="text-muted-foreground">
                                            {notification.type === "comment" ? "commented on" : "liked"} your{" "}
                                            {notification.resourceType}
                                        </span>
                                    </p>
                                    <Link
                                        to={`/work/${notification.resourceId}`}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                markReadMutation.mutate(notification.id);
                                            }
                                        }}
                                        className="text-sm font-medium hover:underline block text-foreground/90"
                                    >
                                        "{notification.resourceTitle}"
                                    </Link>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {!notification.isRead && (
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                            onClick={() => markReadMutation.mutate(notification.id)}
                                            title="Mark as read"
                                        >
                                            <div className="h-2 w-2 rounded-full bg-primary" />
                                        </Button>
                                    )}
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => deleteMutation.mutate(notification.id)}
                                        title="Delete notification"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
