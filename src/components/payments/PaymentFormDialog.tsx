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
import { useCreatePayment, useUpdatePayment } from "@/hooks/usePayments";
import { Payment } from "@/types/database";
import { format } from "date-fns";

const formSchema = z.object({
    client_name: z.string().min(1, "Client name is required").max(200),
    description: z.string().min(1, "Description is required").max(300),
    total_amount: z.coerce.number().min(0, "Must be 0 or more"),
    advance_payment: z.coerce.number().min(0, "Must be 0 or more"),
    final_payment: z.coerce.number().min(0, "Must be 0 or more"),
    status: z.enum(["Pending", "Partial", "Completed"]),
    payment_date: z.string().min(1, "Payment date is required"),
    notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface PaymentFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment?: Payment | null;
}

export function PaymentFormDialog({
    open,
    onOpenChange,
    payment,
}: PaymentFormDialogProps) {
    const createPayment = useCreatePayment();
    const updatePayment = useUpdatePayment();
    const isEditing = !!payment;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            client_name: "",
            description: "",
            total_amount: 0,
            advance_payment: 0,
            final_payment: 0,
            status: "Pending",
            payment_date: format(new Date(), "yyyy-MM-dd"),
            notes: "",
        },
    });

    // Auto-calculate final payment
    const totalAmount = form.watch("total_amount");
    const advancePayment = form.watch("advance_payment");

    useEffect(() => {
        const remaining = Math.max(0, Number(totalAmount) - Number(advancePayment));
        form.setValue("final_payment", remaining);
    }, [totalAmount, advancePayment, form]);

    useEffect(() => {
        if (payment) {
            form.reset({
                client_name: payment.client_name,
                description: payment.description,
                total_amount: payment.total_amount,
                advance_payment: payment.advance_payment,
                final_payment: payment.final_payment,
                status: payment.status,
                payment_date: payment.payment_date,
                notes: payment.notes || "",
            });
        } else {
            form.reset({
                client_name: "",
                description: "",
                total_amount: 0,
                advance_payment: 0,
                final_payment: 0,
                status: "Pending",
                payment_date: format(new Date(), "yyyy-MM-dd"),
                notes: "",
            });
        }
    }, [payment, form]);

    const onSubmit = (values: FormValues) => {
        const data = {
            client_name: values.client_name,
            description: values.description,
            total_amount: values.total_amount,
            advance_payment: values.advance_payment,
            final_payment: values.final_payment,
            status: values.status as Payment["status"],
            payment_date: values.payment_date,
            notes: values.notes || null,
        };

        if (isEditing) {
            updatePayment.mutate(
                { id: payment.id, ...data },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createPayment.mutate(data, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = createPayment.isPending || updatePayment.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Payment" : "Record Payment"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="client_name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="payment_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Payment Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Work Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Website Development" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="total_amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Amount (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="advance_payment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Advance (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="final_payment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Final Payment (₹)</FormLabel>
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
                                            <SelectItem value="Completed">Completed</SelectItem>
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
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Record"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
