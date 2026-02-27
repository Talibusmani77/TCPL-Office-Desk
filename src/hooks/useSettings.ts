import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GlobalSetting } from "@/types/database";

export const useSettings = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("global_settings")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (error) {
                console.error("Error fetching settings:", error);
                throw error;
            }
            return data as GlobalSetting | null;
        },
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newSettings: Partial<GlobalSetting>) => {
            // First check if a row exists
            const { data: existingData } = await supabase
                .from("global_settings")
                .select("id")
                .limit(1)
                .maybeSingle();

            let result;
            if (existingData) {
                // Update existing row
                result = await supabase
                    .from("global_settings")
                    .update({
                        ...newSettings,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", existingData.id)
                    .select()
                    .single();
            } else {
                // Insert new row
                result = await supabase
                    .from("global_settings")
                    .insert([{
                        ...newSettings,
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();
            }

            if (result.error) throw result.error;
            return result.data as GlobalSetting;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
        onError: (error) => {
            toast.error("Failed to update settings");
            console.error("Update settings error:", error);
        }
    });
};
