import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useStock() {
    return useQuery({
        queryKey: ["stock_items"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("stock_items")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as StockItem[];
        },
    });
}

export function useCreateStockItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: Omit<StockItem, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("stock_items")
                .insert(item)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock_items"] });
            toast({ title: "Stock item added successfully" });
        },
        onError: (error) => {
            toast({ title: "Error adding stock item", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdateStockItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...item }: Partial<StockItem> & { id: string }) => {
            const { data, error } = await supabase
                .from("stock_items")
                .update(item)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock_items"] });
            toast({ title: "Stock item updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error updating stock item", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteStockItem() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("stock_items").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["stock_items"] });
            toast({ title: "Stock item deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting stock item", description: error.message, variant: "destructive" });
        },
    });
}
