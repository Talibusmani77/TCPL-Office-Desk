import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { TaskFormDialog } from "@/components/tasks/TaskFormDialog";
import { StatusBadge, getTaskStatusVariant, getPriorityVariant } from "@/components/ui/status-badge";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { Task } from "@/types/database";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Tasks() {
  const { data: tasks = [], isLoading } = useTasks();
  const deleteTask = useDeleteTask();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = tasks.filter((task) => {
    if (statusFilter !== "all" && task.status !== statusFilter) return false;
    if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
    if (searchQuery.trim() && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const columns = [
    { key: "title", header: "Title", className: "max-w-[200px]" },
    {
      key: "assigned_to",
      header: "Assigned To",
      render: (t: Task) => t.employees?.name || "Unassigned",
    },
    {
      key: "status",
      header: "Status",
      render: (t: Task) => (
        <StatusBadge variant={getTaskStatusVariant(t.status)}>
          {t.status}
        </StatusBadge>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (t: Task) => (
        <StatusBadge variant={getPriorityVariant(t.priority)}>
          {t.priority}
        </StatusBadge>
      ),
    },
    {
      key: "due_date",
      header: "Due Date",
      render: (t: Task) =>
        t.due_date ? format(new Date(t.due_date), "MMM d, yyyy") : "-",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (t: Task) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setEditingTask(t);
              setFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(ev) => {
              ev.stopPropagation();
              setDeleteId(t.id);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout title="Tasks" subtitle="Manage and track tasks">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-56">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by task name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="High">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={filteredTasks}
          isLoading={isLoading}
          emptyMessage="No tasks found. Create your first task!"
        />
      </div>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
      />

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        isLoading={deleteTask.isPending}
        onConfirm={() => {
          if (deleteId) {
            deleteTask.mutate(deleteId, {
              onSuccess: () => setDeleteId(null),
            });
          }
        }}
      />
    </DashboardLayout>
  );
}
