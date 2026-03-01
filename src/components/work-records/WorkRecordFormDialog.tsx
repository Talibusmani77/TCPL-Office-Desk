import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { WorkRecord, WorkRecordType } from "@/types/database";
import { useCreateWorkRecord, useUpdateWorkRecord } from "@/hooks/useWorkRecords";
import { useEmployees } from "@/hooks/useEmployees";

const formSchema = z.object({
    record_type: z.enum(["Challan", "Stock Usage", "General Reminder"] as const),
    title: z.string().min(1, "Title/Number is required"),
    challan_given: z.boolean().default(false),
    challan_handover_employee_id: z.string().optional(),
    challan_handover_custom_name: z.string().optional(),
    receiving_received: z.boolean().default(false),
    receiving_handover_employee_id: z.string().optional(),
    receiving_handover_custom_name: z.string().optional(),
    stock_used: z.string().optional(),
    stock_purpose: z.string().optional(),
    reminder_date: z.string().optional(),
    notes: z.string().optional(),
    is_completed: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkRecordFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    record?: WorkRecord | null;
}

export function WorkRecordFormDialog({ open, onOpenChange, record }: WorkRecordFormDialogProps) {
    const createRecord = useCreateWorkRecord();
    const updateRecord = useUpdateWorkRecord();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            record_type: "Challan",
            title: "",
            challan_given: false,
            challan_handover_employee_id: "",
            challan_handover_custom_name: "",
            receiving_received: false,
            receiving_handover_employee_id: "",
            receiving_handover_custom_name: "",
            stock_used: "",
            stock_purpose: "",
            reminder_date: "",
            notes: "",
            is_completed: false,
        },
    });

    const watchRecordType = form.watch("record_type");

    const { data: employees = [] } = useEmployees();

    useEffect(() => {
        if (record) {
            form.reset({
                record_type: record.record_type,
                title: record.title,
                challan_given: record.challan_given,
                challan_handover_employee_id: record.challan_handover_employee_id || "none",
                challan_handover_custom_name: record.challan_handover_custom_name || "",
                receiving_received: record.receiving_received,
                receiving_handover_employee_id: record.receiving_handover_employee_id || "none",
                receiving_handover_custom_name: record.receiving_handover_custom_name || "",
                stock_used: record.stock_used || "",
                stock_purpose: record.stock_purpose || "",
                reminder_date: record.reminder_date || "",
                notes: record.notes || "",
                is_completed: record.status === "Completed",
            });
        } else {
            form.reset({
                record_type: "Challan",
                title: "",
                challan_given: false,
                challan_handover_employee_id: "none",
                challan_handover_custom_name: "",
                receiving_received: false,
                receiving_handover_employee_id: "none",
                receiving_handover_custom_name: "",
                stock_used: "",
                stock_purpose: "",
                reminder_date: "",
                notes: "",
                is_completed: false,
            });
        }
    }, [record, form, open]);

    const onSubmit = (data: FormValues) => {
        const submitData = {
            title: data.title,
            record_type: data.record_type as "Challan" | "Stock Usage" | "General Reminder",
            challan_given: Boolean(data.challan_given),
            challan_handover_employee_id: data.challan_handover_employee_id !== "none" ? (data.challan_handover_employee_id || null) : null,
            challan_handover_custom_name: data.challan_handover_custom_name || null,
            receiving_received: Boolean(data.receiving_received),
            receiving_handover_employee_id: data.receiving_handover_employee_id !== "none" ? (data.receiving_handover_employee_id || null) : null,
            receiving_handover_custom_name: data.receiving_handover_custom_name || null,
            stock_used: data.stock_used || null,
            stock_purpose: data.stock_purpose || null,
            reminder_date: data.reminder_date || null,
            notes: data.notes || null,
            status: data.is_completed ? ("Completed" as const) : ("Pending" as const),
        };

        if (record) {
            updateRecord.mutate(
                { ...submitData, id: record.id },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createRecord.mutate(submitData, { onSuccess: () => onOpenChange(false) });
        }
    };

    const isPending = createRecord.isPending || updateRecord.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{record ? "Edit Work Record" : "Add Work Record"}</DialogTitle>
                    <DialogDescription>
                        {record ? "Update the details of the work record." : "Fill in the details for the new work record or reminder."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="record_type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Record Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Challan">Challan</SelectItem>
                                            <SelectItem value="Stock Usage">Stock Usage</SelectItem>
                                            <SelectItem value="General Reminder">General Reminder</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title / Challan Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter title or reference number..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {watchRecordType === "Challan" && (
                            <div className="flex flex-col gap-6 p-4 border rounded-md bg-muted/20">
                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="challan_given"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-medium cursor-pointer">Challan Given</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch("challan_given") && (
                                        <div className="grid grid-cols-2 gap-4 pl-7">
                                            <FormField control={form.control} name="challan_handover_employee_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Handed over to (Employee)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="challan_handover_custom_name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Or Custom Name</FormLabel>
                                                    <FormControl><Input className="h-8 text-xs" placeholder="Type name..." {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="receiving_received"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                <FormControl>
                                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                                </FormControl>
                                                <FormLabel className="font-medium cursor-pointer">Receiving Received</FormLabel>
                                            </FormItem>
                                        )}
                                    />
                                    {form.watch("receiving_received") && (
                                        <div className="grid grid-cols-2 gap-4 pl-7">
                                            <FormField control={form.control} name="receiving_handover_employee_id" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Receiving given to (Employee)</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">None</SelectItem>
                                                            {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )} />
                                            <FormField control={form.control} name="receiving_handover_custom_name" render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-xs">Or Custom Name</FormLabel>
                                                    <FormControl><Input className="h-8 text-xs" placeholder="Type name..." {...field} /></FormControl>
                                                </FormItem>
                                            )} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {watchRecordType === "Stock Usage" && (
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="stock_used"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Stock Used</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Item name and quantity..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="stock_purpose"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Purpose of Stock Usage</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Why was the stock used?" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}

                        {(watchRecordType === "General Reminder" || watchRecordType === "Challan") && (
                            <FormField
                                control={form.control}
                                name="reminder_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{watchRecordType === "Challan" ? "Follow-up Date (Optional)" : "Reminder Date"}</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="is_completed"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base text-foreground">Mark as Completed</FormLabel>
                                        <DialogDescription className="text-xs">
                                            Toggle on to mark this work record/reminder as complete.
                                        </DialogDescription>
                                    </div>
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-6 w-6 rounded-md"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes / Details</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any extra details..." className="resize-none" rows={3} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Saving..." : record ? "Update Record" : "Save Record"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
