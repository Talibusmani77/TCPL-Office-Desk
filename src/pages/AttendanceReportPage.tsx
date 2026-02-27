import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useMonthlyAttendance } from "@/hooks/useMonthlyAttendance";

export default function AttendanceReportPage() {
  const { data: employees = [] } = useEmployees();
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState("2026-01");

  const { data: summary } = useMonthlyAttendance(employeeId, month);

  return (
    <DashboardLayout
      title="Attendance Report"
      subtitle="Monthly employee attendance summary"
    >
      <div className="space-y-6">

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={employeeId} onValueChange={setEmployeeId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded px-3 py-2"
          />
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(summary).map(([status, count]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-sm">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
