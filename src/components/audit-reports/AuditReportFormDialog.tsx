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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useCreateAuditReport,
  useUpdateAuditReport,
} from "@/hooks/useAuditReports";
import { AuditReport } from "@/types/database";
import { format, subMonths } from "date-fns";

const REPORT_TYPES = [
  "Financial",
  "Compliance",
  "Operational",
  "IT Security",
  "HR",
  "Inventory",
  "Quality",
  "Other",
];

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  report_type: z.string().min(1, "Report type is required"),
  period_from: z.string().min(1, "Start date is required"),
  period_to: z.string().min(1, "End date is required"),
  remarks: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AuditReportFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: AuditReport | null;
}

export function AuditReportFormDialog({
  open,
  onOpenChange,
  report,
}: AuditReportFormDialogProps) {
  const createReport = useCreateAuditReport();
  const updateReport = useUpdateAuditReport();
  const isEditing = !!report;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      report_type: "",
      period_from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
      period_to: format(new Date(), "yyyy-MM-dd"),
      remarks: "",
    },
  });

  useEffect(() => {
    if (report) {
      form.reset({
        title: report.title,
        report_type: report.report_type,
        period_from: report.period_from,
        period_to: report.period_to,
        remarks: report.remarks || "",
      });
    } else {
      form.reset({
        title: "",
        report_type: "",
        period_from: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
        period_to: format(new Date(), "yyyy-MM-dd"),
        remarks: "",
      });
    }
  }, [report, form]);

  const onSubmit = (values: FormValues) => {
    const data = {
      title: values.title,
      report_type: values.report_type,
      period_from: values.period_from,
      period_to: values.period_to,
      remarks: values.remarks || null,
    };

    if (isEditing) {
      updateReport.mutate(
        { id: report.id, ...data },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createReport.mutate(data, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isLoading = createReport.isPending || updateReport.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Audit Report" : "New Audit Report"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q4 Financial Audit" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="report_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REPORT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period_from"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period From</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="period_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Period To</FormLabel>
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
              name="remarks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Remarks (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes or findings..."
                      rows={3}
                      {...field}
                    />
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
                {isLoading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
