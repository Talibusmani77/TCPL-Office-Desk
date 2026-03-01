import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PaymentFormDialog } from "@/components/payments/PaymentFormDialog";
import { PasswordGate } from "@/components/auth/PasswordGate";
import { StatusBadge } from "@/components/ui/status-badge";
import { usePayments, useDeletePayment } from "@/hooks/usePayments";
import { Payment } from "@/types/database";
import { Plus, Pencil, Trash2, IndianRupee, Search, Download } from "lucide-react";
import { format } from "date-fns";
import { exportToExcel } from "@/utils/exportToExcel";
import { ExportPasswordDialog } from "@/components/shared/ExportPasswordDialog";

const getPaymentStatusVariant = (status: string) => {
    switch (status) {
        case "Pending": return "warning" as const;
        case "Partial": return "info" as const;
        case "Completed": return "success" as const;
        default: return "secondary" as const;
    }
};

export default function Payments() {
    return (
        <DashboardLayout title="Payments" subtitle="Track advance, total & final payments for clients">
            <PasswordGate pageLabel="Payments">
                <PaymentContent />
            </PasswordGate>
        </DashboardLayout>
    );
}

function PaymentContent() {
    const { data: payments = [], isLoading } = usePayments();
    const deletePayment = useDeletePayment();

    const [formOpen, setFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [exportDialogOpen, setExportDialogOpen] = useState(false);

    const filteredPayments = useMemo(() => {
        if (!searchQuery.trim()) return payments;
        const q = searchQuery.toLowerCase();
        return payments.filter(
            (p) =>
                p.client_name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q)
        );
    }, [payments, searchQuery]);

    const totalAmount = useMemo(
        () => payments.reduce((sum, p) => sum + Number(p.total_amount), 0),
        [payments]
    );
    const totalAdvance = useMemo(
        () => payments.reduce((sum, p) => sum + Number(p.advance_payment), 0),
        [payments]
    );
    const totalPending = useMemo(
        () => payments.reduce((sum, p) => sum + Number(p.final_payment), 0),
        [payments]
    );

    const columns = [
        {
            key: "payment_date",
            header: "Date",
            render: (p: Payment) => format(new Date(p.payment_date), "MMM d, yyyy"),
        },
        { key: "client_name", header: "Client Name" },
        { key: "description", header: "Description", className: "max-w-[200px]" },
        {
            key: "total_amount",
            header: "Total (₹)",
            render: (p: Payment) => `₹${Number(p.total_amount).toLocaleString()}`,
        },
        {
            key: "advance_payment",
            header: "Advance (₹)",
            render: (p: Payment) => `₹${Number(p.advance_payment).toLocaleString()}`,
        },
        {
            key: "final_payment",
            header: "Final (₹)",
            render: (p: Payment) => (
                <span className={Number(p.final_payment) > 0 ? "text-destructive font-semibold" : "text-success"}>
                    ₹{Number(p.final_payment).toLocaleString()}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (p: Payment) => (
                <StatusBadge variant={getPaymentStatusVariant(p.status)}>
                    {p.status}
                </StatusBadge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-24",
            render: (p: Payment) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(ev) => {
                            ev.stopPropagation();
                            setEditingPayment(p);
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
                            setDeleteId(p.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <IndianRupee className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-xl font-bold">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10">
                            <IndianRupee className="h-5 w-5 text-info" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Advance Paid</p>
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
                            <p className="text-sm text-muted-foreground">Pending Payment</p>
                            <p className="text-xl font-bold text-destructive">₹{totalPending.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Search + Add */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by client or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setExportDialogOpen(true)} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export
                    </Button>
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Record Payment
                    </Button>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredPayments}
                isLoading={isLoading}
                emptyMessage="No payments found. Record your first payment!"
            />

            <PaymentFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingPayment(null);
                }}
                payment={editingPayment}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Payment"
                description="Are you sure you want to delete this payment record? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deletePayment.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deletePayment.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                        });
                    }
                }}
            />

            <ExportPasswordDialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
                onSuccess={() => {
                    const exportData = filteredPayments.map(p => ({
                        Date: format(new Date(p.payment_date), "MMM d, yyyy"),
                        Client_Name: p.client_name,
                        Description: p.description,
                        Total_Amount: p.total_amount,
                        Advance_Payment: p.advance_payment,
                        Final_Payment: p.final_payment,
                        Status: p.status,
                    }));
                    exportToExcel(exportData, "Payments");
                }}
                moduleName="Payments"
            />
        </div>
    );
}
