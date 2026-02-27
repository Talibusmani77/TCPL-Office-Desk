import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SalaryFormDialog } from "@/components/salary/SalaryFormDialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSalaries, useDeleteSalary } from "@/hooks/useSalaries";
import { Salary } from "@/types/database";
import { Plus, Pencil, Trash2, IndianRupee, Search } from "lucide-react";

const getSalaryStatusVariant = (status: string) => {
    switch (status) {
        case "Pending": return "warning" as const;
        case "Partial": return "info" as const;
        case "Paid": return "success" as const;
        default: return "secondary" as const;
    }
};

export default function Salaries() {
    const { data: salaries = [], isLoading } = useSalaries();
    const deleteSalary = useDeleteSalary();

    const [formOpen, setFormOpen] = useState(false);
    const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredSalaries = useMemo(() => {
        if (!searchQuery.trim()) return salaries;
        const q = searchQuery.toLowerCase();
        return salaries.filter(
            (s) =>
                s.employees?.name?.toLowerCase().includes(q) ||
                s.month.includes(q)
        );
    }, [salaries, searchQuery]);

    const totalSalary = useMemo(
        () => salaries.reduce((sum, s) => sum + Number(s.total_salary), 0),
        [salaries]
    );
    const totalAdvance = useMemo(
        () => salaries.reduce((sum, s) => sum + Number(s.advance_given), 0),
        [salaries]
    );
    const totalBalance = useMemo(
        () => salaries.reduce((sum, s) => sum + Number(s.balance), 0),
        [salaries]
    );

    const columns = [
        {
            key: "employee",
            header: "Employee",
            render: (s: Salary) => s.employees?.name || "N/A",
        },
        { key: "month", header: "Month" },
        {
            key: "total_salary",
            header: "Total (₹)",
            render: (s: Salary) => `₹${Number(s.total_salary).toLocaleString()}`,
        },
        {
            key: "advance_given",
            header: "Advance (₹)",
            render: (s: Salary) => `₹${Number(s.advance_given).toLocaleString()}`,
        },
        {
            key: "amount_paid",
            header: "Paid (₹)",
            render: (s: Salary) => `₹${Number(s.amount_paid).toLocaleString()}`,
        },
        {
            key: "balance",
            header: "Balance (₹)",
            render: (s: Salary) => (
                <span className={Number(s.balance) > 0 ? "text-destructive font-semibold" : "text-success"}>
                    ₹{Number(s.balance).toLocaleString()}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (s: Salary) => (
                <StatusBadge variant={getSalaryStatusVariant(s.status)}>
                    {s.status}
                </StatusBadge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-24",
            render: (s: Salary) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={(ev) => { ev.stopPropagation(); setEditingSalary(s); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(ev) => { ev.stopPropagation(); setDeleteId(s.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Employee Salary" subtitle="Track salaries, advances, and payments">
            <div className="space-y-4">
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <IndianRupee className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Salary</p>
                                <p className="text-xl font-bold">₹{totalSalary.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                                <IndianRupee className="h-5 w-5 text-info" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Advance Given</p>
                                <p className="text-xl font-bold">₹{totalAdvance.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                <IndianRupee className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Balance Due</p>
                                <p className="text-xl font-bold text-destructive">₹{totalBalance.toLocaleString()}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by employee or month..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Salary Record
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredSalaries}
                    isLoading={isLoading}
                    emptyMessage="No salary records found. Add your first record!"
                />
            </div>

            <SalaryFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingSalary(null); }}
                salary={editingSalary}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Salary Record"
                description="Are you sure you want to delete this salary record? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteSalary.isPending}
                onConfirm={() => { if (deleteId) { deleteSalary.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); } }}
            />
        </DashboardLayout>
    );
}
