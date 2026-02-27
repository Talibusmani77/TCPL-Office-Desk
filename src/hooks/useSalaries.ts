import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Salary } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useSalaries() {
    return useQuery({
        queryKey: ["salaries"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("salaries")
                .select("*, employees(*)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as Salary[];
        },
    });
}

interface CreateSalaryInput {
    employee_id?: string | null;
    month: string;
    total_salary: number;
    advance_given: number;
    amount_paid: number;
    balance: number;
    status: Salary["status"];
    notes?: string | null;
}

export function useCreateSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (salary: CreateSalaryInput) => {
            const { data, error } = await supabase
                .from("salaries")
                .insert(salary)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salaries"] });
            toast({ title: "Salary record added successfully" });
        },
        onError: (error) => {
            toast({ title: "Error adding salary record", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdateSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...salary }: Partial<Salary> & { id: string }) => {
            const { data, error } = await supabase
                .from("salaries")
                .update(salary)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salaries"] });
            toast({ title: "Salary record updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error updating salary record", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteSalary() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("salaries").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["salaries"] });
            toast({ title: "Salary record deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting salary record", description: error.message, variant: "destructive" });
        },
    });
}
