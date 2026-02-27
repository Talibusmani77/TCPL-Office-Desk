import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function usePayments() {
    return useQuery({
        queryKey: ["payments"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("payments")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Payment[];
        },
    });
}

interface CreatePaymentInput {
    client_name: string;
    description: string;
    total_amount: number;
    advance_payment: number;
    final_payment: number;
    status: Payment["status"];
    payment_date: string;
    notes?: string | null;
}

export function useCreatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payment: CreatePaymentInput) => {
            const { data, error } = await supabase
                .from("payments")
                .insert(payment)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            toast({ title: "Payment recorded successfully" });
        },
        onError: (error) => {
            toast({ title: "Error recording payment", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdatePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...payment }: Partial<Payment> & { id: string }) => {
            const { data, error } = await supabase
                .from("payments")
                .update(payment)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            toast({ title: "Payment updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error updating payment", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeletePayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("payments").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["payments"] });
            toast({ title: "Payment deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting payment", description: error.message, variant: "destructive" });
        },
    });
}
