import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStockItem, useUpdateStockItem } from "@/hooks/useStock";
import { StockItem } from "@/types/database";

const formSchema = z.object({
    name: z.string().min(1, "Item name is required").max(200),
    category: z.string().min(1, "Category is required").max(100),
    quantity: z.coerce.number().min(0, "Quantity must be 0 or more"),
    unit: z.string().min(1, "Unit is required").max(50),
    min_stock_level: z.coerce.number().min(0, "Min stock level must be 0 or more"),
    location: z.string().max(200).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface StockFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stockItem?: StockItem | null;
}

export function StockFormDialog({
    open,
    onOpenChange,
    stockItem,
}: StockFormDialogProps) {
    const createItem = useCreateStockItem();
    const updateItem = useUpdateStockItem();
    const isEditing = !!stockItem;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            category: "",
            quantity: 0,
            unit: "pcs",
            min_stock_level: 0,
            location: "",
            notes: "",
        },
    });

    useEffect(() => {
        if (stockItem) {
            form.reset({
                name: stockItem.name,
                category: stockItem.category,
                quantity: stockItem.quantity,
                unit: stockItem.unit,
                min_stock_level: stockItem.min_stock_level,
                location: stockItem.location || "",
                notes: stockItem.notes || "",
            });
        } else {
            form.reset({
                name: "",
                category: "",
                quantity: 0,
                unit: "pcs",
                min_stock_level: 0,
                location: "",
                notes: "",
            });
        }
    }, [stockItem, form]);

    const onSubmit = (values: FormValues) => {
        const data = {
            name: values.name,
            category: values.category,
            quantity: values.quantity,
            unit: values.unit,
            min_stock_level: values.min_stock_level,
            location: values.location || null,
            notes: values.notes || null,
        };

        if (isEditing) {
            updateItem.mutate(
                { id: stockItem.id, ...data },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createItem.mutate(data, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = createItem.isPending || updateItem.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Stock Item" : "Add Stock Item"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="sm:col-span-2">
                                        <FormLabel>Item Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. A4 Paper" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Stationery" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="unit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. pcs, kg, box" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="min_stock_level"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Stock Level</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location (Optional)</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Shelf A3" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Additional notes..." rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
