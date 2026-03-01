import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CheckSquare,
  Receipt,
  CalendarCheck,
  FileText,
  Users,
  Package,
  Wrench,
  MessageCircle,
  CreditCard,
  Wallet,
  Building,
  Menu,
  X,
  Ruler,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMessages } from "@/hooks/useMessages";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/tasks", icon: CheckSquare, label: "Tasks" },
  { to: "/expenses", icon: Receipt, label: "Expenses" },
  { to: "/attendance", icon: CalendarCheck, label: "Attendance" },
  { to: "/stock", icon: Package, label: "Stock" },
  { to: "/toolkit", icon: Wrench, label: "Toolkit" },
  { to: "/messages", icon: MessageCircle, label: "Messages" },
  { to: "/payments", icon: CreditCard, label: "Payments" },
  { to: "/salaries", icon: Wallet, label: "Salary" },
  { to: "/rents", icon: Building, label: "Rent" },
  { to: "/measurements", icon: Ruler, label: "Measurements" },
  { to: "/work-records", icon: ClipboardList, label: "Work Records" },
  { to: "/audit-reports", icon: FileText, label: "Audit Reports" },
  { to: "/employees", icon: Users, label: "Employees" },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: messages = [] } = useMessages();

  const [lastSeen, setLastSeen] = useState(() => {
    const stored = localStorage.getItem("last_seen_messages");
    return stored ? new Date(stored).getTime() : 0;
  });

  useEffect(() => {
    const handleSeen = () => {
      const stored = localStorage.getItem("last_seen_messages");
      if (stored) setLastSeen(new Date(stored).getTime());
    };
    window.addEventListener('messages_seen', handleSeen);
    return () => window.removeEventListener('messages_seen', handleSeen);
  }, []);

  const newMessageCount = messages.filter((m) => {
    const created = new Date(m.created_at).getTime();
    return created > lastSeen;
  }).length;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-sidebar text-sidebar-foreground shadow-md"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop overlay for mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-screen w-64 bg-sidebar text-sidebar-foreground transition-transform duration-200 ease-in-out",
          "md:translate-x-0 md:z-40",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center bg-white rounded-full p-1 shadow-sm">
                <img src="/logo.png" alt="TCPl-Desk Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-lg font-semibold">TCPl-Desk</span>
            </div>
            {/* Close button on mobile */}
            <button
              className="md:hidden p-1 rounded hover:bg-sidebar-accent/50"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.label}</span>
                {item.to === "/messages" && newMessageCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground animate-pulse">
                    {newMessageCount > 99 ? "99+" : newMessageCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-4">
            <p className="text-xs text-sidebar-foreground/50">
              © 2026 TCPl-Desk
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
