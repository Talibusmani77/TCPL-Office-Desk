import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { StockFormDialog } from "@/components/stock/StockFormDialog";
import { useStock, useDeleteStockItem } from "@/hooks/useStock";
import { StockItem } from "@/types/database";
import { Plus, Pencil, Trash2, AlertTriangle, Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export default function Stock() {
    const { data: stockItems = [], isLoading } = useStock();
    const deleteItem = useDeleteStockItem();

    const [formOpen, setFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StockItem | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const filteredItems = useMemo(() => {
        if (!searchQuery.trim()) return stockItems;
        const q = searchQuery.toLowerCase();
        return stockItems.filter((item) => item.name.toLowerCase().includes(q));
    }, [stockItems, searchQuery]);

    const columns = [
        { key: "name", header: "Item Name" },
        { key: "category", header: "Category" },
        {
            key: "quantity",
            header: "Qty",
            render: (item: StockItem) => (
                <div className="flex items-center gap-2">
                    <span className={item.quantity <= item.min_stock_level ? "text-destructive font-semibold" : ""}>
                        {item.quantity}
                    </span>
                    {item.quantity <= item.min_stock_level && (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                    )}
                </div>
            ),
        },
        { key: "unit", header: "Unit" },
        {
            key: "min_stock_level",
            header: "Min Level",
        },
        {
            key: "location",
            header: "Location",
            render: (item: StockItem) => item.location || "-",
        },
        {
            key: "status_badge",
            header: "Status",
            render: (item: StockItem) => (
                <StatusBadge
                    variant={item.quantity <= item.min_stock_level ? "destructive" : "success"}
                >
                    {item.quantity <= item.min_stock_level ? "Low Stock" : "In Stock"}
                </StatusBadge>
            ),
        },
        {
            key: "actions",
            header: "Actions",
            className: "w-24",
            render: (item: StockItem) => (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(ev) => {
                            ev.stopPropagation();
                            setEditingItem(item);
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
                            setDeleteId(item.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <DashboardLayout title="Stock Management" subtitle="Track and manage inventory items">
            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="relative w-full sm:w-56">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search by stock name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button onClick={() => setFormOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredItems}
                    isLoading={isLoading}
                    emptyMessage="No stock items found. Add your first item!"
                />
            </div>

            <StockFormDialog
                open={formOpen}
                onOpenChange={(open) => {
                    setFormOpen(open);
                    if (!open) setEditingItem(null);
                }}
                stockItem={editingItem}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Stock Item"
                description="Are you sure you want to delete this stock item? This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                isLoading={deleteItem.isPending}
                onConfirm={() => {
                    if (deleteId) {
                        deleteItem.mutate(deleteId, {
                            onSuccess: () => setDeleteId(null),
                        });
                    }
                }}
            />
        </DashboardLayout>
    );
}
