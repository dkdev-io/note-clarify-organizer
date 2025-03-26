export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      all_logs: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_message: string | null
          id: string
          original_id: string | null
          path: string | null
          project_id: string | null
          severity: string | null
          source: string
          status: string | null
          timestamp: number | null
          title: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_message?: string | null
          id?: string
          original_id?: string | null
          path?: string | null
          project_id?: string | null
          severity?: string | null
          source: string
          status?: string | null
          timestamp?: number | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_message?: string | null
          id?: string
          original_id?: string | null
          path?: string | null
          project_id?: string | null
          severity?: string | null
          source?: string
          status?: string | null
          timestamp?: number | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      API: {
        Row: {
          created_at: string
          id: number
          Key: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          Key?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          Key?: string | null
        }
        Relationships: []
      }
      extracted_tasks: {
        Row: {
          assignee: string | null
          auto_scheduled: boolean | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          duration: string | null
          folder: string | null
          frequency: string | null
          hard_deadline: boolean | null
          id: string
          is_pending: boolean | null
          is_recurring: boolean | null
          labels: string[] | null
          priority: string | null
          project: string | null
          project_id: string | null
          schedule: string | null
          start_date: string | null
          status: string | null
          time_estimate: number | null
          title: string
          updated_at: string
          workspace_id: string | null
        }
        Insert: {
          assignee?: string | null
          auto_scheduled?: boolean | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          duration?: string | null
          folder?: string | null
          frequency?: string | null
          hard_deadline?: boolean | null
          id?: string
          is_pending?: boolean | null
          is_recurring?: boolean | null
          labels?: string[] | null
          priority?: string | null
          project?: string | null
          project_id?: string | null
          schedule?: string | null
          start_date?: string | null
          status?: string | null
          time_estimate?: number | null
          title: string
          updated_at?: string
          workspace_id?: string | null
        }
        Update: {
          assignee?: string | null
          auto_scheduled?: boolean | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          duration?: string | null
          folder?: string | null
          frequency?: string | null
          hard_deadline?: boolean | null
          id?: string
          is_pending?: boolean | null
          is_recurring?: boolean | null
          labels?: string[] | null
          priority?: string | null
          project?: string | null
          project_id?: string | null
          schedule?: string | null
          start_date?: string | null
          status?: string | null
          time_estimate?: number | null
          title?: string
          updated_at?: string
          workspace_id?: string | null
        }
        Relationships: []
      }
      issue_logs: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string
          id: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          challenge: string | null
          created_at: string
          email: string
          first_name: string | null
          has_completed_profile: boolean | null
          id: string
          industry: string | null
          last_name: string | null
          linkedin: string | null
          role: string | null
        }
        Insert: {
          challenge?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          has_completed_profile?: boolean | null
          id?: string
          industry?: string | null
          last_name?: string | null
          linkedin?: string | null
          role?: string | null
        }
        Update: {
          challenge?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          has_completed_profile?: boolean | null
          id?: string
          industry?: string | null
          last_name?: string | null
          linkedin?: string | null
          role?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      task_suggestions: {
        Row: {
          created_at: string | null
          id: string
          is_applied: boolean | null
          suggested_assignee: string | null
          suggested_description: string | null
          suggested_due_date: string | null
          suggested_priority: string | null
          suggested_status: string | null
          suggested_title: string | null
          suggestion_reasoning: string | null
          task_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          suggested_assignee?: string | null
          suggested_description?: string | null
          suggested_due_date?: string | null
          suggested_priority?: string | null
          suggested_status?: string | null
          suggested_title?: string | null
          suggestion_reasoning?: string | null
          task_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          suggested_assignee?: string | null
          suggested_description?: string | null
          suggested_due_date?: string | null
          suggested_priority?: string | null
          suggested_status?: string | null
          suggested_title?: string | null
          suggestion_reasoning?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_suggestions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "extracted_tasks"
            referencedColumns: ["id"]
          },
        ]
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
