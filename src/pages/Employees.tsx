import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmployeeFormDialog } from "@/components/employees/EmployeeFormDialog";
import {
  useEmployees,
  useDeleteEmployee,
} from "@/hooks/useEmployees";
import { Employee } from "@/types/database";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Employees() {
  const { data: employees = [], isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns = [
    { key: "name", header: "Name" },
    { key: "designation", header: "Designation" },
    { key: "department", header: "Department" },
    { key: "email", header: "Email", render: (e: Employee) => e.email || "-" },
    { key: "phone", header: "Phone", render: (e: Employee) => e.phone || "-" },
    {
      key: "created_at",
      header: "Joined",
      render: (e: Employee) => format(new Date(e.created_at), "MMM d, yyyy"),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (e: Employee) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setEditingEmployee(e);
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
              setDeleteId(e.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Employees" subtitle="Manage your team members">
      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={employees}
          isLoading={isLoading}
          emptyMessage="No employees found. Add your first team member!"
        />
      </div>

      <EmployeeFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Employee"
        description="Are you sure you want to delete this employee? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteEmployee.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteEmployee.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
