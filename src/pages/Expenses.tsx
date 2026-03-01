import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ExpenseFormDialog } from "@/components/expenses/ExpenseFormDialog";
import { Card, CardContent } from "@/components/ui/card";
import { useExpenses, useDeleteExpense } from "@/hooks/useExpenses";
import { useEmployees } from "@/hooks/useEmployees";
import { Expense } from "@/types/database";
import { Plus, Pencil, Trash2, Receipt, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { exportToExcel } from "@/utils/exportToExcel";
import { ExportPasswordDialog } from "@/components/shared/ExportPasswordDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EXPENSE_CATEGORIES = [
  "Travel",
  "Office Supplies",
  "Equipment",
  "Utilities",
  "Marketing",
  "Software",
  "Meals",
  "Other",
];

export default function Expenses() {
  const { data: expenses = [], isLoading } = useExpenses();
  const { data: employees = [] } = useEmployees();
  const deleteExpense = useDeleteExpense();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [employeeFilter, setEmployeeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const filteredExpenses = expenses.filter((expense) => {
    if (categoryFilter !== "all" && expense.category !== categoryFilter)
      return false;
    if (employeeFilter !== "all" && expense.employee_id !== employeeFilter)
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesAmount = String(expense.amount).includes(q);
      const matchesEmployee = expense.employees?.name?.toLowerCase().includes(q);
      if (!matchesAmount && !matchesEmployee) return false;
    }
    return true;
  });

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  }, [filteredExpenses]);

  const columns = [
    {
      key: "expense_date",
      header: "Date",
      render: (e: Expense) => format(new Date(e.expense_date), "MMM d, yyyy"),
    },
    {
      key: "employee",
      header: "Employee",
      render: (e: Expense) => e.employees?.name || "N/A",
    },
    { key: "category", header: "Category" },
    {
      key: "amount",
      header: "Amount",
      render: (e: Expense) => `₹${Number(e.amount).toLocaleString()}`,
    },
    {
      key: "description",
      header: "Description",
      className: "max-w-[200px]",
      render: (e: Expense) => e.description || "-",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (e: Expense) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setEditingExpense(e);
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
    <DashboardLayout title="Expenses" subtitle="Track and manage expenses">
      <div className="space-y-4">
        {/* Summary Card */}
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold">
                  ₹{totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {filteredExpenses.length} records
            </p>
          </CardContent>
        </Card>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by amount or employee..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={employeeFilter} onValueChange={setEmployeeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Employee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Employees</SelectItem>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setExportDialogOpen(true)} className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredExpenses}
          isLoading={isLoading}
          emptyMessage="No expenses found. Add your first expense!"
        />
      </div>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingExpense(null);
        }}
        expense={editingExpense}
        categories={EXPENSE_CATEGORIES}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteExpense.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteExpense.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
      />

      <ExportPasswordDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onSuccess={() => {
          const exportData = filteredExpenses.map(e => ({
            Date: format(new Date(e.expense_date), "MMM d, yyyy"),
            Employee: e.employees?.name || "N/A",
            Category: e.category,
            Amount: e.amount,
            Description: e.description || "-",
          }));
          exportToExcel(exportData, "Expenses");
        }}
        moduleName="Expenses"
      />
    </DashboardLayout>
  );
}
