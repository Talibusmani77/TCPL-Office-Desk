import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        pending: "bg-warning text-warning-foreground",
        "in-progress": "bg-info text-info-foreground",
        completed: "bg-success text-success-foreground",
        present: "bg-success text-success-foreground",
        absent: "bg-destructive text-destructive-foreground",
        "half-day": "bg-warning text-warning-foreground",
        leave: "bg-muted text-muted-foreground",
        low: "bg-success text-success-foreground",
        medium: "bg-warning text-warning-foreground",
        high: "bg-destructive text-destructive-foreground",
        // General-purpose variants
        info: "bg-info text-info-foreground",
        success: "bg-success text-success-foreground",
        destructive: "bg-destructive text-destructive-foreground",
        warning: "bg-warning text-warning-foreground",
        secondary: "bg-secondary text-secondary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ variant, children, className }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ variant }), className)}>
      {children}
    </span>
  );
}

// Utility functions to get variant from status strings
export function getTaskStatusVariant(status: string): StatusBadgeProps["variant"] {
  switch (status) {
    case "Pending":
      return "pending";
    case "In Progress":
      return "in-progress";
    case "Completed":
      return "completed";
    default:
      return "default";
  }
}

export function getPriorityVariant(priority: string): StatusBadgeProps["variant"] {
  switch (priority) {
    case "Low":
      return "low";
    case "Medium":
      return "medium";
    case "High":
      return "high";
    default:
      return "default";
  }
}

export function getAttendanceVariant(status: string): StatusBadgeProps["variant"] {
  switch (status) {
    case "Present":
      return "present";
    case "Absent":
      return "absent";
    case "Half Day":
      return "half-day";
    case "Leave":
      return "leave";
    default:
      return "default";
  }
}
