import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Measurement } from "@/types/database";

export const useMeasurements = () => {
    return useQuery({
        queryKey: ["measurements"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("measurements")
                .select(`
          *,
          employees (
            name,
            designation
          )
        `)
                .order("measurement_date", { ascending: false });

            if (error) {
                console.error("Error fetching measurements:", error);
                throw error;
            }
            return data as Measurement[];
        },
    });
};

export const useCreateMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newMeasurement: Omit<Measurement, "id" | "created_at" | "employees">) => {
            const { data, error } = await supabase
                .from("measurements")
                .insert([newMeasurement])
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["measurements"] });
            toast.success("Measurement record created successfully");
        },
        onError: (error) => {
            toast.error("Failed to create measurement record");
            console.error("Create measurement error:", error);
        },
    });
};

export const useUpdateMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (measurement: Partial<Measurement> & { id: string }) => {
            const { data, error } = await supabase
                .from("measurements")
                .update({
                    employee_id: measurement.employee_id,
                    site_location: measurement.site_location,
                    site_address: measurement.site_address,
                    length_feet: measurement.length_feet,
                    length_inches: measurement.length_inches,
                    length_mm: measurement.length_mm,
                    length_cm: measurement.length_cm,
                    length_m: measurement.length_m,
                    breadth_feet: measurement.breadth_feet,
                    breadth_inches: measurement.breadth_inches,
                    breadth_mm: measurement.breadth_mm,
                    breadth_cm: measurement.breadth_cm,
                    breadth_m: measurement.breadth_m,
                    measurement_date: measurement.measurement_date,
                    notes: measurement.notes
                })
                .eq("id", measurement.id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["measurements"] });
            toast.success("Measurement record updated successfully");
        },
        onError: (error) => {
            toast.error("Failed to update measurement record");
            console.error("Update measurement error:", error);
        },
    });
};

export const useDeleteMeasurement = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from("measurements").delete().eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["measurements"] });
            toast.success("Measurement record deleted successfully");
        },
        onError: (error) => {
            toast.error("Failed to delete measurement record");
            console.error("Delete measurement error:", error);
        },
    });
};
