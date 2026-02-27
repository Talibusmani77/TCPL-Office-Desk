import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/ui/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { useTasks } from "@/hooks/useTasks";
import { useExpenses } from "@/hooks/useExpenses";
import { useAttendance } from "@/hooks/useAttendance";
import { useStock } from "@/hooks/useStock";
import { useToolkit } from "@/hooks/useToolkit";
import { useMessages } from "@/hooks/useMessages";
import {
  Users,
  CheckSquare,
  Receipt,
  CalendarCheck,
  Package,
  Wrench,
  MessageCircle,
  AlertTriangle,
} from "lucide-react";
import { StatusBadge, getTaskStatusVariant, getPriorityVariant } from "@/components/ui/status-badge";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: employees = [] } = useEmployees();
  const { data: tasks = [] } = useTasks();
  const { data: expenses = [] } = useExpenses();
  const today = format(new Date(), "yyyy-MM-dd");
  const { data: attendance = [] } = useAttendance(today);
  const { data: stockItems = [] } = useStock();
  const { data: toolkitAssignments = [] } = useToolkit();
  const { data: messages = [] } = useMessages();

  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const presentToday = attendance.filter((a) => a.status === "Present").length;
  const lowStockCount = stockItems.filter(
    (s) => s.quantity <= s.min_stock_level
  ).length;
  const activeToolkits = toolkitAssignments.filter(
    (t) => t.status === "Assigned"
  ).length;

  const recentTasks = tasks;
  const recentMessages = messages;

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome to TCPl-Desk">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Employees"
            value={employees.length}
            icon={Users}
          />
          <StatCard
            title="Pending Tasks"
            value={pendingTasks}
            icon={CheckSquare}
          />
          <StatCard
            title="Total Expenses"
            value={`₹${totalExpenses.toLocaleString()}`}
            icon={Receipt}
          />
          <StatCard
            title="Present Today"
            value={presentToday}
            icon={CalendarCheck}
          />
        </div>

        {/* New Module Stats */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Stock Items"
            value={stockItems.length}
            icon={Package}
          />
          <StatCard
            title="Low Stock Alerts"
            value={lowStockCount}
            icon={AlertTriangle}
          />
          <StatCard
            title="Active Toolkit"
            value={activeToolkits}
            icon={Wrench}
          />
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <p className="text-muted-foreground text-sm">No tasks yet</p>
              ) : (
                <div className="space-y-3 pr-2 h-[250px] overflow-y-auto custom-scrollbar">
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border p-3 bg-card shrink-0"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.employees?.name || "Unassigned"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <StatusBadge variant={getPriorityVariant(task.priority)}>
                          {task.priority}
                        </StatusBadge>
                        <StatusBadge variant={getTaskStatusVariant(task.status)} className="hidden sm:inline-flex">
                          {task.status}
                        </StatusBadge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Messages */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Recent Messages</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recentMessages.length === 0 ? (
                <p className="text-muted-foreground text-sm">No messages yet</p>
              ) : (
                <div className="space-y-3 pr-2 h-[250px] overflow-y-auto custom-scrollbar">
                  {recentMessages.map((msg) => (
                    <div key={msg.id} className="rounded-lg border p-3 bg-card shrink-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold text-sm">{msg.author_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(msg.created_at), "MMM d, h:mm a")}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {msg.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Task Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending</span>
                  <span className="font-semibold">
                    {tasks.filter((t) => t.status === "Pending").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">In Progress</span>
                  <span className="font-semibold">
                    {tasks.filter((t) => t.status === "In Progress").length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Completed</span>
                  <span className="font-semibold">
                    {tasks.filter((t) => t.status === "Completed").length}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Tasks</span>
                    <span className="font-bold text-primary">{tasks.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Stock Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Total Items</span>
                  <span className="font-semibold">{stockItems.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    Low Stock
                  </span>
                  <span className="font-semibold text-destructive">{lowStockCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Toolkits Assigned</span>
                  <span className="font-semibold">{activeToolkits}</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Messages</span>
                    <span className="font-bold text-primary">{messages.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
