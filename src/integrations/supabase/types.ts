export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attendance: {
        Row: {
          created_at: string
          date: string
          employee_id: string
          id: string
          status: string
        }
        Insert: {
          created_at?: string
          date?: string
          employee_id: string
          id?: string
          status?: string
        }
        Update: {
          created_at?: string
          date?: string
          employee_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_reports: {
        Row: {
          created_at: string
          id: string
          period_from: string
          period_to: string
          remarks: string | null
          report_type: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          period_from: string
          period_to: string
          remarks?: string | null
          report_type: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          period_from?: string
          period_to?: string
          remarks?: string | null
          report_type?: string
          title?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          department: string
          designation: string
          email: string | null
          id: string
          name: string
          phone: string | null
        }
        Insert: {
          created_at?: string
          department: string
          designation: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
        }
        Update: {
          created_at?: string
          department?: string
          designation?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          description: string | null
          employee_id: string | null
          expense_date: string
          id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expense_date?: string
          id?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          description?: string | null
          employee_id?: string | null
          expense_date?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      global_settings: {
        Row: {
          created_at: string
          id: string
          password: string | null
          pin: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          password?: string | null
          pin?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string | null
          pin?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: string
          status: string
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_items: {
        Row: {
          id: string
          name: string
          category: string
          quantity: number
          unit: string
          min_stock_level: number
          location: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          category: string
          quantity: number
          unit: string
          min_stock_level?: number
          location?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          category?: string
          quantity?: number
          unit?: string
          min_stock_level?: number
          location?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      toolkit_assignments: {
        Row: {
          id: string
          employee_id: string | null
          tool_name: string
          serial_number: string | null
          assigned_date: string
          return_date: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          tool_name: string
          serial_number?: string | null
          assigned_date: string
          return_date?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          tool_name?: string
          serial_number?: string | null
          assigned_date?: string
          return_date?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "toolkit_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          id: string
          author_name: string
          message: string
          created_at: string
        }
        Insert: {
          id?: string
          author_name: string
          message: string
          created_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          message?: string
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          client_name: string
          description: string
          total_amount: number
          advance_payment: number
          final_payment: number
          status: string
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          client_name: string
          description: string
          total_amount: number
          advance_payment?: number
          final_payment?: number
          status?: string
          payment_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          client_name?: string
          description?: string
          total_amount?: number
          advance_payment?: number
          final_payment?: number
          status?: string
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      salaries: {
        Row: {
          id: string
          employee_id: string | null
          month: string
          total_salary: number
          advance_given: number
          amount_paid: number
          balance: number
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id?: string | null
          month: string
          total_salary: number
          advance_given?: number
          amount_paid?: number
          balance?: number
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string | null
          month?: string
          total_salary?: number
          advance_given?: number
          amount_paid?: number
          balance?: number
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      rents: {
        Row: {
          id: string
          tenant_name: string
          space_description: string
          rent_amount: number
          amount_received: number
          balance_due: number
          rent_month: string
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_name: string
          space_description: string
          rent_amount: number
          amount_received?: number
          balance_due?: number
          rent_month: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_name?: string
          space_description?: string
          rent_amount?: number
          amount_received?: number
          balance_due?: number
          rent_month?: string
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
