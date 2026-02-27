import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AuditReportFormDialog } from "@/components/audit-reports/AuditReportFormDialog";
import { Badge } from "@/components/ui/badge";
import { useAuditReports, useDeleteAuditReport } from "@/hooks/useAuditReports";
import { AuditReport } from "@/types/database";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export default function AuditReports() {
  const { data: reports = [], isLoading } = useAuditReports();
  const deleteReport = useDeleteAuditReport();

  const [formOpen, setFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<AuditReport | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return reports;
    const q = searchQuery.toLowerCase();
    return reports.filter((r) => r.title.toLowerCase().includes(q));
  }, [reports, searchQuery]);

  const columns = [
    { key: "title", header: "Title", className: "max-w-[200px]" },
    {
      key: "report_type",
      header: "Type",
      render: (r: AuditReport) => (
        <Badge variant="secondary">{r.report_type}</Badge>
      ),
    },
    {
      key: "period",
      header: "Period",
      render: (r: AuditReport) =>
        `${format(new Date(r.period_from), "MMM d")} - ${format(
          new Date(r.period_to),
          "MMM d, yyyy"
        )}`,
    },
    {
      key: "remarks",
      header: "Remarks",
      className: "max-w-[250px]",
      render: (r: AuditReport) => (
        <span className="truncate block">{r.remarks || "-"}</span>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (r: AuditReport) =>
        format(new Date(r.created_at), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (r: AuditReport) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setEditingReport(r);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setDeleteId(r.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="Audit Reports"
      subtitle="Create and manage audit reports"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by audit name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filteredReports}
          isLoading={isLoading}
          emptyMessage="No audit reports found. Create your first report!"
        />
      </div>

      <AuditReportFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingReport(null);
        }}
        report={editingReport}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Audit Report"
        description="Are you sure you want to delete this audit report? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteReport.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteReport.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
