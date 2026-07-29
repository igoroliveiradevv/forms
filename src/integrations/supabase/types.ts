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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      forms: {
        Row: {
          background_color: string | null
          background_gradient_direction: string | null
          background_gradient_end: string | null
          background_gradient_start: string | null
          background_type: string | null
          button_color: string | null
          created_at: string
          description: string | null
          font_family: string | null
          form_type: string
          id: string
          is_active: boolean
          is_draft: boolean
          logo_url: string | null
          persona_avatar_url: string | null
          persona_bubble_color: string | null
          persona_description: string | null
          persona_name: string | null
          slug: string
          text_color: string | null
          thank_you_message: string | null
          theme: string | null
          title: string
          updated_at: string
          user_bubble_color: string | null
          user_id: string
        }
        Insert: {
          background_color?: string | null
          background_gradient_direction?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_type?: string | null
          button_color?: string | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          form_type?: string
          id?: string
          is_active?: boolean
          is_draft?: boolean
          logo_url?: string | null
          persona_avatar_url?: string | null
          persona_bubble_color?: string | null
          persona_description?: string | null
          persona_name?: string | null
          slug?: string
          text_color?: string | null
          thank_you_message?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
          user_bubble_color?: string | null
          user_id: string
        }
        Update: {
          background_color?: string | null
          background_gradient_direction?: string | null
          background_gradient_end?: string | null
          background_gradient_start?: string | null
          background_type?: string | null
          button_color?: string | null
          created_at?: string
          description?: string | null
          font_family?: string | null
          form_type?: string
          id?: string
          is_active?: boolean
          is_draft?: boolean
          logo_url?: string | null
          persona_avatar_url?: string | null
          persona_bubble_color?: string | null
          persona_description?: string | null
          persona_name?: string | null
          slug?: string
          text_color?: string | null
          thank_you_message?: string | null
          theme?: string | null
          title?: string
          updated_at?: string
          user_bubble_color?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          label: string
          order_index: number
          question_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label: string
          order_index?: number
          question_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          order_index?: number
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          description: string | null
          form_id: string
          id: string
          is_required: boolean
          order_index: number
          settings: Json | null
          title: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at: string
          variable_name: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          form_id: string
          id?: string
          is_required?: boolean
          order_index?: number
          settings?: Json | null
          title: string
          type: Database["public"]["Enums"]["question_type"]
          updated_at?: string
          variable_name?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          form_id?: string
          id?: string
          is_required?: boolean
          order_index?: number
          settings?: Json | null
          title?: string
          type?: Database["public"]["Enums"]["question_type"]
          updated_at?: string
          variable_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      response_answers: {
        Row: {
          answer_date: string | null
          answer_number: number | null
          answer_options: string[] | null
          answer_rating: number | null
          answer_text: string | null
          created_at: string
          id: string
          question_id: string
          response_id: string
        }
        Insert: {
          answer_date?: string | null
          answer_number?: number | null
          answer_options?: string[] | null
          answer_rating?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id: string
          response_id: string
        }
        Update: {
          answer_date?: string | null
          answer_number?: number | null
          answer_options?: string[] | null
          answer_rating?: number | null
          answer_text?: string | null
          created_at?: string
          id?: string
          question_id?: string
          response_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "response_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "response_answers_response_id_fkey"
            columns: ["response_id"]
            isOneToOne: false
            referencedRelation: "responses"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          form_id: string
          id: string
          respondent_ip: string | null
          respondent_user_agent: string | null
          session_id: string | null
          submitted_at: string
        }
        Insert: {
          form_id: string
          id?: string
          respondent_ip?: string | null
          respondent_user_agent?: string | null
          session_id?: string | null
          submitted_at?: string
        }
        Update: {
          form_id?: string
          id?: string
          respondent_ip?: string | null
          respondent_user_agent?: string | null
          session_id?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
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
      question_type:
        | "short_text"
        | "long_text"
        | "number"
        | "email"
        | "single_choice"
        | "multiple_choice"
        | "dropdown"
        | "date"
        | "rating"
        | "text_only"
        | "delay"
        | "end_form"
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
    Enums: {
      question_type: [
        "short_text",
        "long_text",
        "number",
        "email",
        "single_choice",
        "multiple_choice",
        "dropdown",
        "date",
        "rating",
        "text_only",
        "delay",
        "end_form",
      ],
    },
  },
} as const
