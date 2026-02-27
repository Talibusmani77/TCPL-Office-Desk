import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { RentFormDialog } from "@/components/rent/RentFormDialog";
import { PasswordGate } from "@/components/auth/PasswordGate";
import { StatusBadge } from "@/components/ui/status-badge";
import { useRents, useDeleteRent } from "@/hooks/useRents";
import { Rent } from "@/types/database";
import { Plus, Pencil, Trash2, IndianRupee, Search, Building } from "lucide-react";

const getRentStatusVariant = (status: string) => {
    switch (status) {
        case "Pending": return "warning" as const;
        case "Partial": return "info" as const;
        case "Paid": return "success" as const;
        default: return "secondary" as const;
    }
};

export default function Rents() {
    return (
        <DashboardLayout title="Rent Collection" subtitle="Track rent from rental spaces">
            <PasswordGate pageLabel="Rent Collection">
                <RentContent />
            </PasswordGate>
        </DashboardLayout>
    );
}

function RentContent() {
    const { data: rents = [], isLoading } = useRents();
    const deleteRent = useDeleteRent();

    const [formOpen, setFormOpen] = useState(false);
    const [editingRent, setEditingRent] = useState<Rent | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredRents = useMemo(() => {
        if (!searchQuery.trim()) return rents;
        const q = searchQuery.toLowerCase();
        return rents.filter(
            (r) =>
                r.tenant_name.toLowerCase().includes(q) ||
                r.space_description.toLowerCase().includes(q)
        );
    }, [rents, searchQuery]);

    const totalRent = useMemo(
        () => rents.reduce((sum, r) => sum + Number(r.rent_amount), 0),
        [rents]
    );
    const totalReceived = useMemo(
        () => rents.reduce((sum, r) => sum + Number(r.amount_received), 0),
        [rents]
    );
    const totalDue = useMemo(
        () => rents.reduce((sum, r) => sum + Number(r.balance_due), 0),
        [rents]
    );

    const columns = [
        { key: "tenant_name", header: "Tenant" },
        { key: "space_description", header: "Space", className: "max-w-[200px]" },
        { key: "rent_month", header: "Month" },
        {
            key: "rent_amount",
            header: "Rent (₹)",
            render: (r: Rent) => `₹${Number(r.rent_amount).toLocaleString()}`,
        },
        {
            key: "amount_received",
            header: "Received (₹)",
            render: (r: Rent) => `₹${Number(r.amount_received).toLocaleString()}`,
        },
        {
            key: "balance_due",
            header: "Due (₹)",
            render: (r: Rent) => (
                <span className={Number(r.balance_due) > 0 ? "text-destructive font-semibold" : "text-success"}>
                    ₹{Number(r.balance_due).toLocaleString()}
                </span>
            ),
        },
        {
            key: "status",
            header: "Status",
            render: (r: Rent) => (
                <StatusBadge variant={getRentStatusVariant(r.status)}>
                    {r.status}
                </StatusBadge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-24",
            render: (r: Rent) => (
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={(ev) => { ev.stopPropagation(); setEditingRent(r); setFormOpen(true); }}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={(ev) => { ev.stopPropagation(); setDeleteId(r.id); }}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Building className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Total Rent</p>
                            <p className="text-xl font-bold">₹{totalRent.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                            <IndianRupee className="h-5 w-5 text-success" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Received</p>
                            <p className="text-xl font-bold">₹{totalReceived.toLocaleString()}</p>
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
                            <p className="text-xl font-bold text-destructive">₹{totalDue.toLocaleString()}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search by tenant or space..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => setFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Rent Record
                </Button>
            </div>

            <DataTable
                columns={columns}
                data={filteredRents}
                isLoading={isLoading}
                emptyMessage="No rent records found. Add your first record!"
            />

            <RentFormDialog
                open={formOpen}
                onOpenChange={(open) => { setFormOpen(open); if (!open) setEditingRent(null); }}
                rent={editingRent}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Rent Record"
                description="Are you sure you want to delete this rent record? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteRent.isPending}
                onConfirm={() => { if (deleteId) { deleteRent.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); } }}
            />
        </div>
    );
}
