export interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  assigned_to?: string | null;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  due_date?: string | null;
  created_at: string;
  employees?: Employee | null;
}

export interface Expense {
  id: string;
  employee_id?: string | null;
  category: string;
  amount: number;
  description?: string | null;
  expense_date: string;
  created_at: string;
  employees?: Employee | null;
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  status: 'Present' | 'Absent' | 'Half Day' | 'Leave';
  created_at: string;
  employees?: Employee | null;
}

export interface AuditReport {
  id: string;
  title: string;
  report_type: string;
  period_from: string;
  period_to: string;
  remarks?: string | null;
  created_at: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  min_stock_level: number;
  location?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface ToolkitAssignment {
  id: string;
  employee_id?: string | null;
  tool_name: string;
  serial_number?: string | null;
  assigned_date: string;
  return_date?: string | null;
  status: 'Assigned' | 'Returned' | 'Lost' | 'Damaged';
  notes?: string | null;
  created_at: string;
  employees?: Employee | null;
}

export interface Message {
  id: string;
  author_name: string;
  message: string;
  created_at: string;
}

export interface Payment {
  id: string;
  client_name: string;
  description: string;
  total_amount: number;
  advance_payment: number;
  final_payment: number;
  status: 'Pending' | 'Partial' | 'Completed';
  payment_date: string;
  notes?: string | null;
  created_at: string;
}

export interface Salary {
  id: string;
  employee_id?: string | null;
  month: string;
  total_salary: number;
  advance_given: number;
  amount_paid: number;
  balance: number;
  status: 'Pending' | 'Partial' | 'Paid';
  notes?: string | null;
  created_at: string;
  employees?: Employee | null;
}

export interface Rent {
  id: string;
  tenant_name: string;
  space_description: string;
  rent_amount: number;
  amount_received: number;
  balance_due: number;
  rent_month: string;
  status: 'Pending' | 'Partial' | 'Paid';
  notes?: string | null;
  created_at: string;
}

export interface GlobalSetting {
  id: string;
  password?: string | null;
  pin?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Measurement {
  id: string;
  employee_id?: string | null;
  site_location: string;
  site_address?: string | null;
  length_feet: number;
  length_inches: number;
  length_mm: number;
  length_cm: number;
  length_m: number;
  breadth_feet: number;
  breadth_inches: number;
  breadth_mm: number;
  breadth_cm: number;
  breadth_m: number;
  measurement_date: string;
  notes?: string | null;
  created_at: string;
  employees?: Employee | null;
}

export interface WorkRecord {
  id: string;
  record_type: 'Challan' | 'Stock Usage' | 'General Reminder';
  title: string;
  challan_given: boolean;
  challan_handover_employee_id?: string | null;
  challan_handover_custom_name?: string | null;
  receiving_received: boolean;
  receiving_handover_employee_id?: string | null;
  receiving_handover_custom_name?: string | null;
  stock_used?: string | null;
  stock_purpose?: string | null;
  reminder_date?: string | null;
  notes?: string | null;
  status: 'Pending' | 'Completed';
  created_at: string;
}

export type TaskStatus = Task['status'];
export type TaskPriority = Task['priority'];
export type AttendanceStatus = Attendance['status'];
export type ToolkitStatus = ToolkitAssignment['status'];
export type SalaryStatus = Salary['status'];
export type RentStatus = Rent['status'];
export type WorkRecordStatus = WorkRecord['status'];
export type WorkRecordType = WorkRecord['record_type'];
