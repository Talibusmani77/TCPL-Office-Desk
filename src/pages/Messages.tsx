import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { MessageFormDialog } from "@/components/messages/MessageFormDialog";
import { useMessages, useDeleteMessage } from "@/hooks/useMessages";
import { Plus, Trash2, MessageCircle, User } from "lucide-react";
import { format } from "date-fns";

export default function Messages() {
    const { data: messages = [], isLoading } = useMessages();
    const deleteMessage = useDeleteMessage();

    const [formOpen, setFormOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        localStorage.setItem("last_seen_messages", new Date().toISOString());
        window.dispatchEvent(new Event('messages_seen'));
    }, [messages]);

    return (
        <DashboardLayout title="Messages" subtitle="Team announcements and messages">
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Publish Message
                    </Button>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-muted-foreground">Loading messages...</p>
                    </div>
                ) : messages.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <MessageCircle className="h-12 w-12 text-muted-foreground/40 mb-4" />
                            <p className="text-muted-foreground text-sm">
                                No messages yet. Publish your first message!
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {messages.map((msg) => (
                            <Card key={msg.id} className="group relative">
                                <CardContent className="pt-6">
                                    {/* Author & Time */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                                <User className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm leading-none">
                                                    {msg.author_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {format(new Date(msg.created_at), "MMM d, yyyy · h:mm a")}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                                            onClick={() => setDeleteId(msg.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>

                                    {/* Message Body */}
                                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                                        {msg.message}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <MessageFormDialog open={formOpen} onOpenChange={setFormOpen} />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Message"
                description="Are you sure you want to delete this message? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteMessage.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deleteMessage.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                        });
                    }
                }}
            />
        </DashboardLayout>
    );
}
