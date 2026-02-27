import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Attendance, AttendanceStatus } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useAttendance(date?: string) {
  return useQuery({
    queryKey: ["attendance", date],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select("*, employees(*)")
        .order("date", { ascending: false });

      if (date) {
        query = query.eq("date", date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Attendance[];
    },
  });
}

interface UpsertAttendanceInput {
  employee_id: string;
  date: string;
  status: AttendanceStatus;
}

export function useUpsertAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attendance: UpsertAttendanceInput) => {
      const { data, error } = await supabase
        .from("attendance")
        .upsert(attendance, { onConflict: "employee_id,date" })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Attendance updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating attendance", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attendance").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast({ title: "Attendance deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting attendance", description: error.message, variant: "destructive" });
    },
  });
}
