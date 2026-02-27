import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ToolkitFormDialog } from "@/components/toolkit/ToolkitFormDialog";
import { useToolkit, useDeleteToolkitAssignment } from "@/hooks/useToolkit";
import { ToolkitAssignment } from "@/types/database";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { format } from "date-fns";

const getToolkitStatusVariant = (status: string) => {
    switch (status) {
        case "Assigned": return "info" as const;
        case "Returned": return "success" as const;
        case "Lost": return "destructive" as const;
        case "Damaged": return "warning" as const;
        default: return "secondary" as const;
    }
};

export default function Toolkit() {
    const { data: assignments = [], isLoading } = useToolkit();
    const deleteAssignment = useDeleteToolkitAssignment();

    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ToolkitAssignment | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const columns = [
        { key: "tool_name", header: "Tool Name" },
        {
            key: "serial_number",
            header: "Serial No.",
            render: (a: ToolkitAssignment) => a.serial_number || "-",
        },
        {
            key: "employee",
            header: "Assigned To",
            render: (a: ToolkitAssignment) => a.employees?.name || "Unassigned",
        },
        {
            key: "assigned_date",
            header: "Assigned",
            render: (a: ToolkitAssignment) =>
                format(new Date(a.assigned_date), "MMM d, yyyy"),
        },
        {
            key: "return_date",
            header: "Return",
            render: (a: ToolkitAssignment) =>
                a.return_date ? format(new Date(a.return_date), "MMM d, yyyy") : "-",
        },
        {
            key: "status",
            header: "Status",
            render: (a: ToolkitAssignment) => (
                <StatusBadge variant={getToolkitStatusVariant(a.status)}>
                    {a.status}
                </StatusBadge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-24",
            render: (a: ToolkitAssignment) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(ev) => {
                            ev.stopPropagation();
                            setEditingItem(a);
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
                            setDeleteId(a.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Toolkit Assigned" subtitle="Track tools and equipment assigned to employees">
            <div className="space-y-4">
                <div className="flex justify-end">
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Assign Toolkit
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={assignments}
                    isLoading={isLoading}
                    emptyMessage="No toolkit assignments found. Assign your first tool!"
                />
            </div>

            <ToolkitFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingItem(null);
                }}
                assignment={editingItem}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Assignment"
                description="Are you sure you want to delete this toolkit assignment? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteAssignment.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deleteAssignment.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                        });
                    }
                }}
            />
        </DashboardLayout>
    );
}
