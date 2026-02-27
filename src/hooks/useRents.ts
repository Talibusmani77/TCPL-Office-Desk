import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Rent } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useRents() {
    return useQuery({
        queryKey: ["rents"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("rents")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Rent[];
        },
    });
}

interface CreateRentInput {
    tenant_name: string;
    space_description: string;
    rent_amount: number;
    amount_received: number;
    balance_due: number;
    rent_month: string;
    status: Rent["status"];
    notes?: string | null;
}

export function useCreateRent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (rent: CreateRentInput) => {
            const { data, error } = await supabase
                .from("rents")
                .insert(rent)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rents"] });
            toast({ title: "Rent record added successfully" });
        },
        onError: (error) => {
            toast({ title: "Error adding rent record", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdateRent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...rent }: Partial<Rent> & { id: string }) => {
            const { data, error } = await supabase
                .from("rents")
                .update(rent)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rents"] });
            toast({ title: "Rent record updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error updating rent record", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteRent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("rents").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["rents"] });
            toast({ title: "Rent record deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting rent record", description: error.message, variant: "destructive" });
        },
    });
}
