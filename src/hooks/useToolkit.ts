import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ToolkitAssignment } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useToolkit() {
    return useQuery({
        queryKey: ["toolkit_assignments"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("toolkit_assignments")
                .select("*, employees(*)")
                .order("created_at", { ascending: false });

            if (error) throw error;
            return data as ToolkitAssignment[];
        },
    });
}

interface CreateToolkitInput {
    employee_id?: string | null;
    tool_name: string;
    serial_number?: string | null;
    assigned_date: string;
    return_date?: string | null;
    status: ToolkitAssignment["status"];
    notes?: string | null;
}

export function useCreateToolkitAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (item: CreateToolkitInput) => {
            const { data, error } = await supabase
                .from("toolkit_assignments")
                .insert(item)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["toolkit_assignments"] });
            toast({ title: "Toolkit assignment added successfully" });
        },
        onError: (error) => {
            toast({ title: "Error adding toolkit assignment", description: error.message, variant: "destructive" });
        },
    });
}

export function useUpdateToolkitAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, ...item }: Partial<ToolkitAssignment> & { id: string }) => {
            const { data, error } = await supabase
                .from("toolkit_assignments")
                .update(item)
                .eq("id", id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["toolkit_assignments"] });
            toast({ title: "Toolkit assignment updated successfully" });
        },
        onError: (error) => {
            toast({ title: "Error updating toolkit assignment", description: error.message, variant: "destructive" });
        },
    });
}

export function useDeleteToolkitAssignment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("toolkit_assignments").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["toolkit_assignments"] });
            toast({ title: "Toolkit assignment deleted successfully" });
        },
        onError: (error) => {
            toast({ title: "Error deleting toolkit assignment", description: error.message, variant: "destructive" });
        },
    });
}
