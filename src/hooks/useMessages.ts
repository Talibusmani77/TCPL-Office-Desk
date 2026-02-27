import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useMessages() {
    return useQuery({
        queryKey: ["messages"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("messages")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Message[];
        },
    });
}

export function useCreateMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (msg: Omit<Message, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("messages")
                .insert(msg)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            toast({ title: "Message published successfully" });
        },
        onError: (error) => {
            toast({ title: "Error publishing message", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("messages").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["messages"] });
            toast({ title: "Message deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting message", description: error.message, variant: "destructive" });
        },
    });
}
