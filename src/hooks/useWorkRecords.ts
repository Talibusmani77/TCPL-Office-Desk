import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkRecord } from "@/types/database";

export const useWorkRecords = () => {
    return useQuery({
        queryKey: ["work_records"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("work_records")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching work records:", error);
                throw error;
            }
            return data as WorkRecord[];
        },
    });
};

export const useCreateWorkRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newRecord: Omit<WorkRecord, "id" | "created_at">) => {
            const { data, error } = await supabase
                .from("work_records")
                .insert([newRecord])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work_records"] });
            toast.success("Work record created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create work record");
            console.error("Create work record error:", error);
        },
    });
};

export const useUpdateWorkRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (record: Partial<WorkRecord> & { id: string }) => {
            const { data, error } = await supabase
                .from("work_records")
                .update({
                    record_type: record.record_type,
                    title: record.title,
                    challan_given: record.challan_given,
                    challan_handover_employee_id: record.challan_handover_employee_id,
                    challan_handover_custom_name: record.challan_handover_custom_name,
                    receiving_received: record.receiving_received,
                    receiving_handover_employee_id: record.receiving_handover_employee_id,
                    receiving_handover_custom_name: record.receiving_handover_custom_name,
                    stock_used: record.stock_used,
                    stock_purpose: record.stock_purpose,
                    reminder_date: record.reminder_date,
                    notes: record.notes,
                    status: record.status
                })
                .eq("id", record.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work_records"] });
            toast.success("Work record updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update work record");
            console.error("Update work record error:", error);
        },
    });
};

export const useDeleteWorkRecord = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("work_records").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["work_records"] });
            toast.success("Work record deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete work record");
            console.error("Delete work record error:", error);
        },
    });
};
