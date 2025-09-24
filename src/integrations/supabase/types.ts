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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          id: string
          id_photo_url: string
          ownership_document_url: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          id_photo_url: string
          ownership_document_url: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          id?: string
          id_photo_url?: string
          ownership_document_url?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"] | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          listing_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          listing_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          amenities: string[] | null
          availability: string
          average_rating: number | null
          barangay: string | null
          building_name: string | null
          city_municipality: string | null
          contact_email: string | null
          contact_facebook: string | null
          contact_phone: string | null
          created_at: string
          description: string | null
          gender_preference: string
          house_building_no: string | null
          id: string
          landlord_id: string
          latitude: number | null
          location: string
          longitude: number | null
          lot_no: string | null
          payment_required: boolean
          payment_status: Database["public"]["Enums"]["payment_status"]
          price: number
          province: string | null
          room_type: string
          street: string | null
          title: string
          total_reviews: number | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          amenities?: string[] | null
          availability?: string
          average_rating?: number | null
          barangay?: string | null
          building_name?: string | null
          city_municipality?: string | null
          contact_email?: string | null
          contact_facebook?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          gender_preference: string
          house_building_no?: string | null
          id?: string
          landlord_id: string
          latitude?: number | null
          location: string
          longitude?: number | null
          lot_no?: string | null
          payment_required?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price: number
          province?: string | null
          room_type: string
          street?: string | null
          title: string
          total_reviews?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          amenities?: string[] | null
          availability?: string
          average_rating?: number | null
          barangay?: string | null
          building_name?: string | null
          city_municipality?: string | null
          contact_email?: string | null
          contact_facebook?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string | null
          gender_preference?: string
          house_building_no?: string | null
          id?: string
          landlord_id?: string
          latitude?: number | null
          location?: string
          longitude?: number | null
          lot_no?: string | null
          payment_required?: boolean
          payment_status?: Database["public"]["Enums"]["payment_status"]
          price?: number
          province?: string | null
          room_type?: string
          street?: string | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          failure_reason: string | null
          id: string
          landlord_id: string
          listing_id: string | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type: string | null
          paymongo_payment_intent_id: string | null
          paymongo_source_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          landlord_id: string
          listing_id?: string | null
          paid_at?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_type?: string | null
          paymongo_payment_intent_id?: string | null
          paymongo_source_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          failure_reason?: string | null
          id?: string
          landlord_id?: string
          listing_id?: string | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_type?: string | null
          paymongo_payment_intent_id?: string | null
          paymongo_source_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean
          kyc_required: boolean | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          mobile: string | null
          onboarding_status:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          payment_completed_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_verified?: boolean
          kyc_required?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          mobile?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          payment_completed_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean
          kyc_required?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          mobile?: string | null
          onboarding_status?:
            | Database["public"]["Enums"]["onboarding_status"]
            | null
          payment_completed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_submissions: {
        Row: {
          address: string
          admin_notes: string | null
          boarding_house_name: string
          created_at: string
          email: string
          full_name: string
          government_id_path: string
          id: string
          mobile: string | null
          proof_of_ownership_path: string
          rejected_reason: string | null
          reviewed_at: string | null
          status: Database["public"]["Enums"]["verification_status"]
          user_id: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          boarding_house_name: string
          created_at?: string
          email: string
          full_name: string
          government_id_path: string
          id?: string
          mobile?: string | null
          proof_of_ownership_path: string
          rejected_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          user_id: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          boarding_house_name?: string
          created_at?: string
          email?: string
          full_name?: string
          government_id_path?: string
          id?: string
          mobile?: string | null
          proof_of_ownership_path?: string
          rejected_reason?: string | null
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["verification_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_listing_rating: {
        Args: { listing_uuid: string }
        Returns: {
          average_rating: number
          rating_breakdown: Json
          total_reviews: number
        }[]
      }
      can_create_listings: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      create_admin_notification: {
        Args: { _data?: Json; _message: string; _title: string; _type: string }
        Returns: undefined
      }
      create_onboarding_payment: {
        Args: {
          amount_param: number
          landlord_id_param: string
          payment_method_param?: string
        }
        Returns: {
          message: string
          payment_id: string
          success: boolean
        }[]
      }
      fix_verification_status: {
        Args: Record<PropertyKey, never>
        Returns: {
          email: string
          user_id: string
          was_fixed: boolean
        }[]
      }
      get_landlord_onboarding_progress: {
        Args: { user_id: string }
        Returns: {
          can_proceed: boolean
          current_step: string
          next_action: string
          progress_percentage: number
          total_steps: number
        }[]
      }
      get_onboarding_payment_status: {
        Args: { landlord_id_param: string }
        Returns: {
          has_paid: boolean
          has_pending: boolean
          payment_id: string
          status: string
        }[]
      }
      get_user_review: {
        Args: { listing_uuid: string; user_uuid: string }
        Returns: {
          created_at: string
          id: string
          rating: number
          review_text: string
        }[]
      }
      handle_payment_completion: {
        Args: {
          _failure_reason?: string
          _payment_id: string
          _status: Database["public"]["Enums"]["payment_status"]
          _transaction_reference?: string
        }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      review_kyc_documents: {
        Args: {
          admin_notes_param?: string
          kyc_id_param: string
          new_status: Database["public"]["Enums"]["kyc_status"]
        }
        Returns: boolean
      }
      submit_kyc_documents: {
        Args: {
          id_photo_url_param: string
          ownership_document_url_param: string
        }
        Returns: string
      }
      verify_user_email: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "landlord" | "tenant"
      kyc_status: "pending" | "approved" | "rejected"
      onboarding_status:
        | "email_pending"
        | "email_confirmed"
        | "kyc_pending"
        | "kyc_approved"
        | "payment_pending"
        | "payment_completed"
        | "onboarding_complete"
      payment_method: "card" | "gcash" | "paymaya" | "bank_transfer"
      payment_status:
        | "pending"
        | "paid"
        | "failed"
        | "cancelled"
        | "approved"
        | "rejected"
      verification_status:
        | "pending"
        | "approved"
        | "rejected"
        | "needs_more_info"
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
      app_role: ["admin", "landlord", "tenant"],
      kyc_status: ["pending", "approved", "rejected"],
      onboarding_status: [
        "email_pending",
        "email_confirmed",
        "kyc_pending",
        "kyc_approved",
        "payment_pending",
        "payment_completed",
        "onboarding_complete",
      ],
      payment_method: ["card", "gcash", "paymaya", "bank_transfer"],
      payment_status: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "approved",
        "rejected",
      ],
      verification_status: [
        "pending",
        "approved",
        "rejected",
        "needs_more_info",
      ],
    },
  },
} as const
