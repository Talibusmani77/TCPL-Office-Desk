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
import { useCreateSalary, useUpdateSalary } from "@/hooks/useSalaries";
import { useEmployees } from "@/hooks/useEmployees";
import { Salary } from "@/types/database";
import { format } from "date-fns";

const formSchema = z.object({
    employee_id: z.string().min(1, "Employee is required"),
    month: z.string().min(1, "Month is required"),
    total_salary: z.coerce.number().min(0, "Must be 0 or more"),
    advance_given: z.coerce.number().min(0, "Must be 0 or more"),
    amount_paid: z.coerce.number().min(0, "Must be 0 or more"),
    balance: z.coerce.number().min(0),
    status: z.enum(["Pending", "Partial", "Paid"]),
    notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface SalaryFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    salary?: Salary | null;
}

export function SalaryFormDialog({
    open,
    onOpenChange,
    salary,
}: SalaryFormDialogProps) {
    const createSalary = useCreateSalary();
    const updateSalary = useUpdateSalary();
    const { data: employees = [] } = useEmployees();
    const isEditing = !!salary;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: "",
            month: format(new Date(), "yyyy-MM"),
            total_salary: 0,
            advance_given: 0,
            amount_paid: 0,
            balance: 0,
            status: "Pending",
            notes: "",
        },
    });

    // Auto-calculate balance
    const totalSalary = form.watch("total_salary");
    const advanceGiven = form.watch("advance_given");
    const amountPaid = form.watch("amount_paid");

    useEffect(() => {
        const bal = Math.max(0, Number(totalSalary) - Number(advanceGiven) - Number(amountPaid));
        form.setValue("balance", bal);
    }, [totalSalary, advanceGiven, amountPaid, form]);

    useEffect(() => {
        if (salary) {
            form.reset({
                employee_id: salary.employee_id || "",
                month: salary.month,
                total_salary: salary.total_salary,
                advance_given: salary.advance_given,
                amount_paid: salary.amount_paid,
                balance: salary.balance,
                status: salary.status,
                notes: salary.notes || "",
            });
        } else {
            form.reset({
                employee_id: "",
                month: format(new Date(), "yyyy-MM"),
                total_salary: 0,
                advance_given: 0,
                amount_paid: 0,
                balance: 0,
                status: "Pending",
                notes: "",
            });
        }
    }, [salary, form]);

    const onSubmit = (values: FormValues) => {
        const data = {
            employee_id: values.employee_id || null,
            month: values.month,
            total_salary: values.total_salary,
            advance_given: values.advance_given,
            amount_paid: values.amount_paid,
            balance: values.balance,
            status: values.status as Salary["status"],
            notes: values.notes || null,
        };

        if (isEditing) {
            updateSalary.mutate(
                { id: salary.id, ...data },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createSalary.mutate(data, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = createSalary.isPending || updateSalary.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Salary Record" : "Add Salary Record"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="employee_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Employee</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select employee" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {employees.map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id}>
                                                        {emp.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Salary Month</FormLabel>
                                        <FormControl>
                                            <Input type="month" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="total_salary"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Salary (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="advance_given"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Advance Given (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="amount_paid"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Paid (₹)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min={0} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="balance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Balance (₹)</FormLabel>
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
