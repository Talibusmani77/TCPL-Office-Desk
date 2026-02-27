import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

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

import { useCreateExpense, useUpdateExpense } from "@/hooks/useExpenses";
import { useEmployees } from "@/hooks/useEmployees";
import { Expense } from "@/types/database";

/* -------------------- SCHEMA -------------------- */

const formSchema = z.object({
  employee_id: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().max(500).optional(),
  expense_date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense?: Expense | null;
  categories: string[];
}

/* -------------------- COMPONENT -------------------- */

export function ExpenseFormDialog({
  open,
  onOpenChange,
  expense,
  categories,
}: ExpenseFormDialogProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const { data: employees = [] } = useEmployees();

  const isEditing = Boolean(expense);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employee_id: undefined,
      category: "",
      amount: "",
      description: "",
      expense_date: format(new Date(), "yyyy-MM-dd"),
    },
  });

  /* -------------------- RESET FORM -------------------- */

  useEffect(() => {
    if (expense) {
      form.reset({
        employee_id: expense.employee_id ?? undefined,
        category: expense.category,
        amount: String(expense.amount),
        description: expense.description ?? "",
        expense_date: expense.expense_date,
      });
    } else {
      form.reset({
        employee_id: undefined,
        category: "",
        amount: "",
        description: "",
        expense_date: format(new Date(), "yyyy-MM-dd"),
      });
    }
  }, [expense, form]);

  /* -------------------- SUBMIT -------------------- */

  const onSubmit = (values: FormValues) => {
    const payload = {
      employee_id: values.employee_id ?? null,
      category: values.category,
      amount: Number(values.amount),
      description: values.description || null,
      expense_date: values.expense_date,
    };

    if (isEditing && expense) {
      updateExpense.mutate(
        { id: expense.id, ...payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createExpense.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isLoading =
    createExpense.isPending || updateExpense.isPending;

  /* -------------------- UI -------------------- */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Expense" : "Add Expense"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* -------- EMPLOYEE SELECT -------- */}
            <FormField
              control={form.control}
              name="employee_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employee</FormLabel>
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(value) =>
                      field.onChange(
                        value === "none" ? undefined : value
                      )
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      <SelectItem value="none">N/A</SelectItem>
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

            {/* -------- CATEGORY -------- */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>

                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- AMOUNT -------- */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- DATE -------- */}
            <FormField
              control={form.control}
              name="expense_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- DESCRIPTION -------- */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Expense details..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* -------- ACTIONS -------- */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Saving..."
                  : isEditing
                  ? "Update"
                  : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
