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
import { useCreateToolkitAssignment, useUpdateToolkitAssignment } from "@/hooks/useToolkit";
import { useEmployees } from "@/hooks/useEmployees";
import { ToolkitAssignment } from "@/types/database";
import { format } from "date-fns";

const formSchema = z.object({
    tool_name: z.string().min(1, "Tool name is required").max(200),
    serial_number: z.string().max(100).optional().or(z.literal("")),
    employee_id: z.string().optional().or(z.literal("")),
    assigned_date: z.string().min(1, "Assigned date is required"),
    return_date: z.string().optional().or(z.literal("")),
    status: z.enum(["Assigned", "Returned", "Lost", "Damaged"]),
    notes: z.string().max(500).optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface ToolkitFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    assignment?: ToolkitAssignment | null;
}

export function ToolkitFormDialog({
    open,
    onOpenChange,
    assignment,
}: ToolkitFormDialogProps) {
    const createAssignment = useCreateToolkitAssignment();
    const updateAssignment = useUpdateToolkitAssignment();
    const { data: employees = [] } = useEmployees();
    const isEditing = !!assignment;

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tool_name: "",
            serial_number: "",
            employee_id: "",
            assigned_date: format(new Date(), "yyyy-MM-dd"),
            return_date: "",
            status: "Assigned",
            notes: "",
        },
    });

    useEffect(() => {
        if (assignment) {
            form.reset({
                tool_name: assignment.tool_name,
                serial_number: assignment.serial_number || "",
                employee_id: assignment.employee_id || "",
                assigned_date: assignment.assigned_date,
                return_date: assignment.return_date || "",
                status: assignment.status,
                notes: assignment.notes || "",
            });
        } else {
            form.reset({
                tool_name: "",
                serial_number: "",
                employee_id: "",
                assigned_date: format(new Date(), "yyyy-MM-dd"),
                return_date: "",
                status: "Assigned",
                notes: "",
            });
        }
    }, [assignment, form]);

    const onSubmit = (values: FormValues) => {
        const data = {
            tool_name: values.tool_name,
            serial_number: values.serial_number || null,
            employee_id: values.employee_id || null,
            assigned_date: values.assigned_date,
            return_date: values.return_date || null,
            status: values.status as ToolkitAssignment["status"],
            notes: values.notes || null,
        };

        if (isEditing) {
            updateAssignment.mutate(
                { id: assignment.id, ...data },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createAssignment.mutate(data, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isLoading = createAssignment.isPending || updateAssignment.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Assignment" : "Assign Toolkit"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="tool_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tool Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Laptop, Drill Machine" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="serial_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Serial Number (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. SN-12345" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="employee_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned To</FormLabel>
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
                                name="assigned_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assigned Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="return_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Return Date (Optional)</FormLabel>
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
                                            <SelectItem value="Assigned">Assigned</SelectItem>
                                            <SelectItem value="Returned">Returned</SelectItem>
                                            <SelectItem value="Lost">Lost</SelectItem>
                                            <SelectItem value="Damaged">Damaged</SelectItem>
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
                                {isLoading ? "Saving..." : isEditing ? "Update" : "Assign"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
