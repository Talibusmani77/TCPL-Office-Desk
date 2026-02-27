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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCreateRent, useUpdateRent } from "@/hooks/useRents";
import { Rent } from "@/types/database";
import { format } from "date-fns";

const formSchema = z.object({
    tenant_name: z.string().min(1, "Tenant name is required").max(200),
    space_description: z.string().min(1, "Space description is required").max(300),
    rent_amount: z.coerce.number().min(0, "Must be 0 or more"),
    amount_received: z.coerce.number().min(0, "Must be 0 or more"),
    balance_due: z.coerce.number().min(0),
    rent_month: z.string().min(1, "Month is required"),
    status: z.enum(["Pending", "Partial", "Paid"]),
    notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface RentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rent?: Rent | null;
}

export function RentFormDialog({
    open,
    onOpenChange,
    rent,
}: RentFormDialogProps) {
    const createRent = useCreateRent();
    const updateRent = useUpdateRent();
    const isEditing = !!rent;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tenant_name: "",
            space_description: "",
            rent_amount: 0,
            amount_received: 0,
            balance_due: 0,
            rent_month: format(new Date(), "yyyy-MM"),
            status: "Pending",
            notes: "",
        },
    });

    // Auto-calculate balance
    const rentAmount = form.watch("rent_amount");
    const amountReceived = form.watch("amount_received");

    useEffect(() => {
        const bal = Math.max(0, Number(rentAmount) - Number(amountReceived));
        form.setValue("balance_due", bal);
    }, [rentAmount, amountReceived, form]);

    useEffect(() => {
        if (rent) {
            form.reset({
                tenant_name: rent.tenant_name,
                space_description: rent.space_description,
                rent_amount: rent.rent_amount,
                amount_received: rent.amount_received,
                balance_due: rent.balance_due,
                rent_month: rent.rent_month,
                status: rent.status,
                notes: rent.notes || "",
            });
        } else {
            form.reset({
                tenant_name: "",
                space_description: "",
                rent_amount: 0,
                amount_received: 0,
                balance_due: 0,
                rent_month: format(new Date(), "yyyy-MM"),
                status: "Pending",
                notes: "",
            });
        }
    }, [rent, form]);

    const onSubmit = (values: FormValues) => {
        const data = {
            tenant_name: values.tenant_name,
            space_description: values.space_description,
            rent_amount: values.rent_amount,
            amount_received: values.amount_received,
            balance_due: values.balance_due,
            rent_month: values.rent_month,
            status: values.status as Rent["status"],
            notes: values.notes || null,
        };

        if (isEditing) {
            updateRent.mutate(
                { id: rent.id, ...data },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createRent.mutate(data, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = createRent.isPending || updateRent.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Rent Record" : "Add Rent Record"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="tenant_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tenant Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. ABC Enterprises" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="rent_month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent Month</FormLabel>
                                        <FormControl>
                                            <Input type="month" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="space_description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Space / Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Shop No. 5, Ground Floor" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="rent_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Rent Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount_received"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Received (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="balance_due"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Balance Due (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} readOnly className="bg-muted" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Pending">Pending</SelectItem>
                                            <SelectItem value="Partial">Partial</SelectItem>
                                            <SelectItem value="Paid">Paid</SelectItem>
                                        </SelectContent>
                                    </Select>
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
