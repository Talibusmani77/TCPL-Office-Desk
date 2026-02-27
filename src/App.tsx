import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import Expenses from "./pages/Expenses";
import Attendance from "./pages/Attendance";
import AttendanceReportPage from "./pages/AttendanceReportPage";
import AuditReports from "./pages/AuditReports";
import Employees from "./pages/Employees";
import Stock from "./pages/Stock";
import Toolkit from "./pages/Toolkit";
import Messages from "./pages/Messages";
import Payments from "./pages/Payments";
import Salaries from "./pages/Salaries";
import Rents from "./pages/Rents";
import NotFound from "./pages/NotFound";
import { InstallPWA } from "./components/pwa/InstallPWA";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <InstallPWA />
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>

          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />

          {/* Core Modules */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/expenses" element={<Expenses />} />

          {/* Attendance */}
          <Route path="/attendance" element={<Attendance />} />
          <Route
            path="/attendance/report"
            element={<AttendanceReportPage />}
          />

          {/* New Modules */}
          <Route path="/stock" element={<Stock />} />
          <Route path="/toolkit" element={<Toolkit />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/salaries" element={<Salaries />} />
          <Route path="/rents" element={<Rents />} />

          {/* Others */}
          <Route path="/audit-reports" element={<AuditReports />} />
          <Route path="/employees" element={<Employees />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
