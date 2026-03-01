import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Measurement } from "@/types/database";
import { useCreateMeasurement, useUpdateMeasurement } from "@/hooks/useMeasurements";
import { useEmployees } from "@/hooks/useEmployees";

const formSchema = z.object({
    employee_id: z.string().min(1, "Employee is required"),
    site_location: z.string().min(1, "Site location is required"),
    site_address: z.string().optional(),
    length_feet: z.coerce.number().min(0).default(0),
    length_inches: z.coerce.number().min(0).default(0),
    length_mm: z.coerce.number().min(0).default(0),
    length_cm: z.coerce.number().min(0).default(0),
    length_m: z.coerce.number().min(0).default(0),
    breadth_feet: z.coerce.number().min(0).default(0),
    breadth_inches: z.coerce.number().min(0).default(0),
    breadth_mm: z.coerce.number().min(0).default(0),
    breadth_cm: z.coerce.number().min(0).default(0),
    breadth_m: z.coerce.number().min(0).default(0),
    measurement_date: z.string().min(1, "Date is required"),
    notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface MeasurementFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    measurement?: Measurement | null;
}

export function MeasurementFormDialog({ open, onOpenChange, measurement }: MeasurementFormDialogProps) {
    const { data: employees = [] } = useEmployees();
    const createMeasurement = useCreateMeasurement();
    const updateMeasurement = useUpdateMeasurement();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            employee_id: "",
            site_location: "",
            site_address: "",
            length_feet: 0,
            length_inches: 0,
            length_mm: 0,
            length_cm: 0,
            length_m: 0,
            breadth_feet: 0,
            breadth_inches: 0,
            breadth_mm: 0,
            breadth_cm: 0,
            breadth_m: 0,
            measurement_date: new Date().toISOString().split('T')[0],
            notes: "",
        },
    });

    useEffect(() => {
        if (measurement) {
            form.reset({
                employee_id: measurement.employee_id || "",
                site_location: measurement.site_location,
                site_address: measurement.site_address || "",
                length_feet: measurement.length_feet,
                length_inches: measurement.length_inches,
                length_mm: measurement.length_mm,
                length_cm: measurement.length_cm,
                length_m: measurement.length_m,
                breadth_feet: measurement.breadth_feet,
                breadth_inches: measurement.breadth_inches,
                breadth_mm: measurement.breadth_mm,
                breadth_cm: measurement.breadth_cm,
                breadth_m: measurement.breadth_m,
                measurement_date: measurement.measurement_date,
                notes: measurement.notes || "",
            });
        } else {
            form.reset();
        }
    }, [measurement, form]);

    const onSubmit = (data: FormValues) => {
        if (measurement) {
            updateMeasurement.mutate(
                { ...data, id: measurement.id },
                { onSuccess: () => onOpenChange(false) }
            );
        } else {
            createMeasurement.mutate(
                {
                    employee_id: data.employee_id || null,
                    site_location: data.site_location,
                    site_address: data.site_address || null,
                    length_feet: data.length_feet || 0,
                    length_inches: data.length_inches || 0,
                    length_mm: data.length_mm || 0,
                    length_cm: data.length_cm || 0,
                    length_m: data.length_m || 0,
                    breadth_feet: data.breadth_feet || 0,
                    breadth_inches: data.breadth_inches || 0,
                    breadth_mm: data.breadth_mm || 0,
                    breadth_cm: data.breadth_cm || 0,
                    breadth_m: data.breadth_m || 0,
                    measurement_date: data.measurement_date,
                    notes: data.notes || null,
                },
                { onSuccess: () => onOpenChange(false) }
            );
        }
    };

    const isPending = createMeasurement.isPending || updateMeasurement.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent aria-describedby={undefined} className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{measurement ? "Edit Measurement" : "Add Measurement Record"}</DialogTitle>
                    <DialogDescription>
                        {measurement ? "Update the details of the measurement." : "Fill in the details for the new site measurement."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                        <FormField
                            control={form.control}
                            name="employee_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Employee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an employee" />
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
                            name="site_location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Location</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g., Client Office, Mall Site..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="site_address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Site Address (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Full address" className="resize-none" rows={2} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4 rounded-md border p-4 bg-muted/50 mt-4 text-sm">
                            <h3 className="font-semibold text-base mb-2">Length</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="length_feet" render={({ field }) => (
                                    <FormItem><FormLabel>Feet (ft)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="length_inches" render={({ field }) => (
                                    <FormItem><FormLabel>Inches (in)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="length_mm" render={({ field }) => (
                                    <FormItem><FormLabel>mm</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="length_cm" render={({ field }) => (
                                    <FormItem><FormLabel>cm</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="length_m" render={({ field }) => (
                                    <FormItem><FormLabel>m</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        <div className="space-y-4 rounded-md border p-4 bg-muted/50 mt-4 text-sm">
                            <h3 className="font-semibold text-base mb-2">Breadth</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="breadth_feet" render={({ field }) => (
                                    <FormItem><FormLabel>Feet (ft)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="breadth_inches" render={({ field }) => (
                                    <FormItem><FormLabel>Inches (in)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <FormField control={form.control} name="breadth_mm" render={({ field }) => (
                                    <FormItem><FormLabel>mm</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="breadth_cm" render={({ field }) => (
                                    <FormItem><FormLabel>cm</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="breadth_m" render={({ field }) => (
                                    <FormItem><FormLabel>m</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
                                )} />
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="measurement_date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Measurement Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
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
                                    <FormLabel>Additional Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Any specific requirements or notes..." className="resize-none" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Saving..." : measurement ? "Update Record" : "Save Record"}
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
