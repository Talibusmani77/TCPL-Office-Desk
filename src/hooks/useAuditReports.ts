import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AuditReport } from "@/types/database";
import { toast } from "@/hooks/use-toast";

export function useAuditReports() {
  return useQuery({
    queryKey: ["audit-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditReport[];
    },
  });
}

interface CreateAuditReportInput {
  title: string;
  report_type: string;
  period_from: string;
  period_to: string;
  remarks?: string;
}

export function useCreateAuditReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (report: CreateAuditReportInput) => {
      const { data, error } = await supabase
        .from("audit_reports")
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-reports"] });
      toast({ title: "Audit report created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error creating audit report", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateAuditReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...report }: Partial<AuditReport> & { id: string }) => {
      const { data, error } = await supabase
        .from("audit_reports")
        .update(report)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-reports"] });
      toast({ title: "Audit report updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error updating audit report", description: error.message, variant: "destructive" });
    },
  });
}

export function useDeleteAuditReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("audit_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["audit-reports"] });
      toast({ title: "Audit report deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error deleting audit report", description: error.message, variant: "destructive" });
    },
  });
}
