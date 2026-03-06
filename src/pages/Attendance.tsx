import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge, getAttendanceVariant } from "@/components/ui/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAttendance, useUpsertAttendance, useBulkUpsertAttendance } from "@/hooks/useAttendance";
import { useEmployees } from "@/hooks/useEmployees";
import { Attendance, AttendanceStatus } from "@/types/database";
import { format } from "date-fns";
import { CalendarCheck, Save, Eye, Download, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useMonthlyAttendance } from "@/hooks/useMonthlyAttendance";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportToExcel } from "@/utils/exportToExcel";
import { ExportPasswordDialog } from "@/components/shared/ExportPasswordDialog";

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["Present", "Absent", "Half Day", "Leave"];

export default function AttendancePage() {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus | "Unmarked">>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Modal state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");
  const [reportMonth, setReportMonth] = useState(selectedDate.slice(0, 7)); // yyyy-MM

  const { data: employees = [], isLoading: loadingEmployees } = useEmployees();
  const { data: attendanceData = [], isLoading: loadingAttendance } = useAttendance(selectedDate);
  const upsertAttendance = useUpsertAttendance();
  const bulkUpsertAttendance = useBulkUpsertAttendance();

  // Monthly summary for modal
  const { data: monthlySummary } = useMonthlyAttendance(selectedEmployeeId, reportMonth);

  // Build current attendance state
  const getEmployeeStatus = (employeeId: string): AttendanceStatus | "Unmarked" => {
    if (attendanceMap[employeeId] !== undefined) return attendanceMap[employeeId];
    const existing = attendanceData.find((a) => a.employee_id === employeeId);
    return existing?.status || "Unmarked";
  };

  const handleStatusChange = (employeeId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({ ...prev, [employeeId]: status }));
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    const records = Object.entries(attendanceMap).map(([employee_id, status]) => ({
      employee_id,
      date: selectedDate,
      status: status === "Unmarked" ? "Present" : status as AttendanceStatus
    }));

    if (records.length === 0) return;

    try {
      await bulkUpsertAttendance.mutateAsync(records);
      setAttendanceMap({});
      setHasChanges(false);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleMarkAllPresent = () => {
    const updates: Record<string, AttendanceStatus> = {};
    employees.forEach(emp => {
      const currentStatus = getEmployeeStatus(emp.id);
      if (currentStatus === "Unmarked") {
        updates[emp.id] = "Present";
      }
    });

    if (Object.keys(updates).length > 0) {
      setAttendanceMap(prev => ({ ...prev, ...updates }));
      setHasChanges(true);
      toast({ title: `Marked ${Object.keys(updates).length} employees as Present` });
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setAttendanceMap({});
    setHasChanges(false);
  };

  // Stats for selected date
  const presentCount = employees.filter((e) => getEmployeeStatus(e.id) === "Present").length;
  const absentCount = employees.filter((e) => getEmployeeStatus(e.id) === "Absent").length;
  const markedCount = employees.filter((e) => getEmployeeStatus(e.id) !== "Unmarked").length;
  const pendingCount = employees.length - markedCount;

  const columns = [
    { key: "name", header: "Employee" },
    { key: "department", header: "Department" },
    {
      key: "status",
      header: "Status",
      render: (emp: { id: string }) => {
        const status = getEmployeeStatus(emp.id);
        return (
          <Select value={status} onValueChange={(value) => handleStatusChange(emp.id, value as AttendanceStatus)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ATTENDANCE_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      },
    },
    {
      key: "badge",
      header: "",
      render: (emp: { id: string }) => {
        const status = getEmployeeStatus(emp.id);
        return (
          <div className="flex items-center justify-between w-full">
            <StatusBadge variant={getAttendanceVariant(status)}>
              {status}
            </StatusBadge>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedEmployeeId(emp.id);
                setReportMonth(selectedDate.slice(0, 7));
                setReportModalOpen(true);
              }}
            >
              <Eye className="h-4 w-4 mr-1" /> View
            </Button>
          </div>

        );
      },
    },
  ];

  return (
    <DashboardLayout title="Attendance" subtitle="Mark and track attendance">
      <div className="space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-muted-foreground" />
              <Input type="date" value={selectedDate} onChange={(e) => handleDateChange(e.target.value)} className="w-44" />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleMarkAllPresent} disabled={pendingCount === 0}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark All Present
            </Button>
            <Button variant="outline" onClick={() => setExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export Today
            </Button>
            <Button onClick={handleSaveAll} disabled={!hasChanges || bulkUpsertAttendance.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {bulkUpsertAttendance.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Marked Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-primary">{markedCount}</p>
                <p className="text-sm text-muted-foreground">/ {employees.length}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{pendingCount} employees pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Present Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success">{presentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Absent Today</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-destructive">{absentCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{markedCount > 0 ? Math.round((presentCount / markedCount) * 100) : 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Based on marked records</p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Table */}
        <DataTable columns={columns} data={employees.map((e) => ({ ...e, id: e.id }))} isLoading={loadingEmployees || loadingAttendance} emptyMessage="No employees found. Add employees first!" />
      </div>

      {/* Monthly Report Modal */}
      <Dialog open={reportModalOpen} onOpenChange={setReportModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly Attendance Summary</DialogTitle>
          </DialogHeader>

          {/* Month Selector */}
          <div className="mb-4">
            <input
              type="month"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            {monthlySummary &&
              Object.entries(monthlySummary).map(([status, count]) => (
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
        </DialogContent>
      </Dialog>

      <ExportPasswordDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onSuccess={() => {
          const exportData = employees.map(e => ({
            Employee: e.name,
            Department: e.department || "-",
            Date: selectedDate,
            Status: getEmployeeStatus(e.id),
          }));
          exportToExcel(exportData, `Attendance_${selectedDate}`);
        }}
        moduleName="Attendance"
      />
    </DashboardLayout >
  );
}
