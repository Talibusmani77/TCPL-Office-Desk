import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMonthlyAttendance(
  employeeId: string,
  month: string // format: "2026-01"
) {
  return useQuery({
    queryKey: ["attendance-summary", employeeId, month],
    queryFn: async () => {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;

      const { data, error } = await supabase
        .from("attendance")
        .select("status")
        .eq("employee_id", employeeId)
        .gte("date", startDate)
        .lte("date", endDate);

      if (error) throw error;

      const summary = {
        Present: 0,
        Absent: 0,
        "Half Day": 0,
        Leave: 0,
      };

      data.forEach((a) => {
        summary[a.status]++;
      });

      return summary;
    },
    enabled: !!employeeId && !!month,
  });
}
