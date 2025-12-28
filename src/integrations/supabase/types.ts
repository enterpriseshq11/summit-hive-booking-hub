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
      addons: {
        Row: {
          adds_duration_mins: number | null
          base_price: number
          bookable_type_id: string | null
          business_id: string
          constraints: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          max_quantity: number | null
          member_price: number | null
          name: string
          pricing_mode: Database["public"]["Enums"]["addon_pricing_mode"] | null
          requires_resource: boolean | null
          resource_type: Database["public"]["Enums"]["resource_type"] | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          adds_duration_mins?: number | null
          base_price: number
          bookable_type_id?: string | null
          business_id: string
          constraints?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          member_price?: number | null
          name: string
          pricing_mode?:
            | Database["public"]["Enums"]["addon_pricing_mode"]
            | null
          requires_resource?: boolean | null
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          adds_duration_mins?: number | null
          base_price?: number
          bookable_type_id?: string | null
          business_id?: string
          constraints?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_quantity?: number | null
          member_price?: number | null
          name?: string
          pricing_mode?:
            | Database["public"]["Enums"]["addon_pricing_mode"]
            | null
          requires_resource?: boolean | null
          resource_type?: Database["public"]["Enums"]["resource_type"] | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addons_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "addons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      assumptions: {
        Row: {
          assumption_text: string
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          replaced_by: string | null
          status: string | null
        }
        Insert: {
          assumption_text: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          replaced_by?: string | null
          status?: string | null
        }
        Update: {
          assumption_text?: string
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          replaced_by?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assumptions_replaced_by_fkey"
            columns: ["replaced_by"]
            isOneToOne: false
            referencedRelation: "assumptions"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action_type: string
          actor_user_id: string | null
          after_json: Json | null
          before_json: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          user_agent: string | null
        }
        Insert: {
          action_type: string
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          actor_user_id?: string | null
          after_json?: Json | null
          before_json?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          user_agent?: string | null
        }
        Relationships: []
      }
      availability_windows: {
        Row: {
          bookable_type_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          resource_id: string | null
          start_time: string
        }
        Insert: {
          bookable_type_id?: string | null
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          resource_id?: string | null
          start_time: string
        }
        Update: {
          bookable_type_id?: string | null
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          resource_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_windows_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_windows_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      blackout_dates: {
        Row: {
          business_id: string | null
          created_at: string
          created_by: string | null
          end_datetime: string
          id: string
          is_request_only: boolean | null
          provider_id: string | null
          reason: string | null
          resource_id: string | null
          start_datetime: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          created_by?: string | null
          end_datetime: string
          id?: string
          is_request_only?: boolean | null
          provider_id?: string | null
          reason?: string | null
          resource_id?: string | null
          start_datetime: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          created_by?: string | null
          end_datetime?: string
          id?: string
          is_request_only?: boolean | null
          provider_id?: string | null
          reason?: string | null
          resource_id?: string | null
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "blackout_dates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blackout_dates_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blackout_dates_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookable_types: {
        Row: {
          allow_guest_checkout: boolean | null
          balance_due_days_before: number | null
          booking_mode: Database["public"]["Enums"]["booking_mode"] | null
          buffer_after_mins: number | null
          buffer_before_mins: number | null
          business_id: string
          created_at: string
          deposit_fixed_amount: number | null
          deposit_percentage: number | null
          description: string | null
          hold_duration_mins: number | null
          id: string
          is_active: boolean | null
          max_advance_days: number | null
          max_duration_mins: number | null
          max_guests: number | null
          min_advance_hours: number | null
          min_duration_mins: number | null
          min_guests: number | null
          name: string
          requires_contract: boolean | null
          requires_deposit: boolean | null
          requires_intake: boolean | null
          requires_waiver: boolean | null
          settings: Json | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          allow_guest_checkout?: boolean | null
          balance_due_days_before?: number | null
          booking_mode?: Database["public"]["Enums"]["booking_mode"] | null
          buffer_after_mins?: number | null
          buffer_before_mins?: number | null
          business_id: string
          created_at?: string
          deposit_fixed_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          hold_duration_mins?: number | null
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          max_duration_mins?: number | null
          max_guests?: number | null
          min_advance_hours?: number | null
          min_duration_mins?: number | null
          min_guests?: number | null
          name: string
          requires_contract?: boolean | null
          requires_deposit?: boolean | null
          requires_intake?: boolean | null
          requires_waiver?: boolean | null
          settings?: Json | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          allow_guest_checkout?: boolean | null
          balance_due_days_before?: number | null
          booking_mode?: Database["public"]["Enums"]["booking_mode"] | null
          buffer_after_mins?: number | null
          buffer_before_mins?: number | null
          business_id?: string
          created_at?: string
          deposit_fixed_amount?: number | null
          deposit_percentage?: number | null
          description?: string | null
          hold_duration_mins?: number | null
          id?: string
          is_active?: boolean | null
          max_advance_days?: number | null
          max_duration_mins?: number | null
          max_guests?: number | null
          min_advance_hours?: number | null
          min_duration_mins?: number | null
          min_guests?: number | null
          name?: string
          requires_contract?: boolean | null
          requires_deposit?: boolean | null
          requires_intake?: boolean | null
          requires_waiver?: boolean | null
          settings?: Json | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookable_types_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_addons: {
        Row: {
          addon_id: string
          booking_id: string
          created_at: string
          id: string
          quantity: number | null
          total_price: number
          unit_price: number
        }
        Insert: {
          addon_id: string
          booking_id: string
          created_at?: string
          id?: string
          quantity?: number | null
          total_price: number
          unit_price: number
        }
        Update: {
          addon_id?: string
          booking_id?: string
          created_at?: string
          id?: string
          quantity?: number | null
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "booking_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_addons_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_resources: {
        Row: {
          booking_id: string
          created_at: string
          end_datetime: string
          id: string
          resource_id: string
          start_datetime: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          end_datetime: string
          id?: string
          resource_id: string
          start_datetime: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          end_datetime?: string
          id?: string
          resource_id?: string
          start_datetime?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_resources_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          assigned_coordinator_id: string | null
          assigned_provider_id: string | null
          balance_due: number | null
          balance_due_date: string | null
          bookable_type_id: string
          booking_number: string
          business_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          created_at: string
          customer_id: string | null
          deposit_amount: number | null
          discount_amount: number | null
          end_datetime: string
          gift_card_id: string | null
          guest_count: number | null
          guest_email: string | null
          guest_name: string | null
          guest_phone: string | null
          id: string
          internal_notes: string | null
          notes: string | null
          package_id: string | null
          promo_code_id: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["booking_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          assigned_coordinator_id?: string | null
          assigned_provider_id?: string | null
          balance_due?: number | null
          balance_due_date?: string | null
          bookable_type_id: string
          booking_number: string
          business_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          end_datetime: string
          gift_card_id?: string | null
          guest_count?: number | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          package_id?: string | null
          promo_code_id?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          assigned_coordinator_id?: string | null
          assigned_provider_id?: string | null
          balance_due?: number | null
          balance_due_date?: string | null
          bookable_type_id?: string
          booking_number?: string
          business_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          created_at?: string
          customer_id?: string | null
          deposit_amount?: number | null
          discount_amount?: number | null
          end_datetime?: string
          gift_card_id?: string | null
          guest_count?: number | null
          guest_email?: string | null
          guest_name?: string | null
          guest_phone?: string | null
          id?: string
          internal_notes?: string | null
          notes?: string | null
          package_id?: string | null
          promo_code_id?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_coordinator_id_fkey"
            columns: ["assigned_coordinator_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          created_at: string
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          settings: Json | null
          slug: string
          tagline: string | null
          timezone: string | null
          type: Database["public"]["Enums"]["business_type"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          settings?: Json | null
          slug: string
          tagline?: string | null
          timezone?: string | null
          type: Database["public"]["Enums"]["business_type"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          settings?: Json | null
          slug?: string
          tagline?: string | null
          timezone?: string | null
          type?: Database["public"]["Enums"]["business_type"]
          updated_at?: string
        }
        Relationships: []
      }
      checklist_templates: {
        Row: {
          bookable_type_id: string | null
          business_id: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          items: Json
          name: string
          trigger_offset_hours: number | null
          trigger_type: string | null
          updated_at: string
        }
        Insert: {
          bookable_type_id?: string | null
          business_id: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name: string
          trigger_offset_hours?: number | null
          trigger_type?: string | null
          updated_at?: string
        }
        Update: {
          bookable_type_id?: string | null
          business_id?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          items?: Json
          name?: string
          trigger_offset_hours?: number | null
          trigger_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_templates_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      checklists: {
        Row: {
          assigned_to: string | null
          booking_id: string
          completed_at: string | null
          completed_items: Json | null
          created_at: string
          due_datetime: string | null
          id: string
          items: Json
          name: string
          template_id: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          booking_id: string
          completed_at?: string | null
          completed_items?: Json | null
          created_at?: string
          due_datetime?: string | null
          id?: string
          items?: Json
          name: string
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string
          completed_at?: string | null
          completed_items?: Json | null
          created_at?: string
          due_datetime?: string | null
          id?: string
          items?: Json
          name?: string
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklists_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_wallets: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      document_templates: {
        Row: {
          bookable_type_id: string | null
          business_id: string
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          requires_signature: boolean | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          version: number | null
        }
        Insert: {
          bookable_type_id?: string | null
          business_id: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          requires_signature?: boolean | null
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number | null
        }
        Update: {
          bookable_type_id?: string | null
          business_id?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          requires_signature?: boolean | null
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          code: string
          created_at: string
          current_balance: number
          expires_at: string | null
          id: string
          initial_amount: number
          is_active: boolean | null
          message: string | null
          purchased_by: string | null
          recipient_email: string | null
          recipient_name: string | null
          redeemed_by: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_balance: number
          expires_at?: string | null
          id?: string
          initial_amount: number
          is_active?: boolean | null
          message?: string | null
          purchased_by?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_by?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_balance?: number
          expires_at?: string | null
          id?: string
          initial_amount?: number
          is_active?: boolean | null
          message?: string | null
          purchased_by?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          redeemed_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      guest_passes: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          id: string
          membership_id: string
          pass_code: string
          used_at: string | null
          valid_date: string
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          membership_id: string
          pass_code: string
          used_at?: string | null
          valid_date: string
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          id?: string
          membership_id?: string
          pass_code?: string
          used_at?: string | null
          valid_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_passes_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          assigned_to: string | null
          bookable_type_id: string | null
          budget_range: string | null
          business_id: string
          company_name: string | null
          converted_booking_id: string | null
          created_at: string
          email: string
          event_type: string | null
          first_name: string
          guest_count: number | null
          id: string
          last_name: string | null
          notes: string | null
          phone: string | null
          preferred_dates: Json | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          bookable_type_id?: string | null
          budget_range?: string | null
          business_id: string
          company_name?: string | null
          converted_booking_id?: string | null
          created_at?: string
          email: string
          event_type?: string | null
          first_name: string
          guest_count?: number | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_dates?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          bookable_type_id?: string | null
          budget_range?: string | null
          business_id?: string
          company_name?: string | null
          converted_booking_id?: string | null
          created_at?: string
          email?: string
          event_type?: string | null
          first_name?: string
          guest_count?: number | null
          id?: string
          last_name?: string | null
          notes?: string | null
          phone?: string | null
          preferred_dates?: Json | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_converted_booking_id_fkey"
            columns: ["converted_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_benefits: {
        Row: {
          applicable_bookable_type_id: string | null
          applicable_business_id: string | null
          benefit_type: string
          created_at: string
          description: string | null
          discount_type:
            | Database["public"]["Enums"]["pricing_modifier_type"]
            | null
          discount_value: number | null
          free_units_per_period: number | null
          id: string
          is_active: boolean | null
          priority_booking_hours: number | null
          tier_id: string
        }
        Insert: {
          applicable_bookable_type_id?: string | null
          applicable_business_id?: string | null
          benefit_type: string
          created_at?: string
          description?: string | null
          discount_type?:
            | Database["public"]["Enums"]["pricing_modifier_type"]
            | null
          discount_value?: number | null
          free_units_per_period?: number | null
          id?: string
          is_active?: boolean | null
          priority_booking_hours?: number | null
          tier_id: string
        }
        Update: {
          applicable_bookable_type_id?: string | null
          applicable_business_id?: string | null
          benefit_type?: string
          created_at?: string
          description?: string | null
          discount_type?:
            | Database["public"]["Enums"]["pricing_modifier_type"]
            | null
          discount_value?: number | null
          free_units_per_period?: number | null
          id?: string
          is_active?: boolean | null
          priority_booking_hours?: number | null
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_benefits_applicable_bookable_type_id_fkey"
            columns: ["applicable_bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_benefits_applicable_business_id_fkey"
            columns: ["applicable_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "membership_benefits_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_tiers: {
        Row: {
          annual_price: number | null
          business_id: string
          created_at: string
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          max_pause_days: number | null
          max_pauses_per_year: number | null
          monthly_price: number
          name: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          annual_price?: number | null
          business_id: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_pause_days?: number | null
          max_pauses_per_year?: number | null
          monthly_price: number
          name: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          annual_price?: number | null
          business_id?: string
          created_at?: string
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_pause_days?: number | null
          max_pauses_per_year?: number | null
          monthly_price?: number
          name?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "membership_tiers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          billing_cycle: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          pause_resume_date: string | null
          paused_at: string | null
          pauses_used_this_year: number | null
          status: Database["public"]["Enums"]["membership_status"] | null
          stripe_subscription_id: string | null
          tier_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          pause_resume_date?: string | null
          paused_at?: string | null
          pauses_used_this_year?: number | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          stripe_subscription_id?: string | null
          tier_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          pause_resume_date?: string | null
          paused_at?: string | null
          pauses_used_this_year?: number | null
          status?: Database["public"]["Enums"]["membership_status"] | null
          stripe_subscription_id?: string | null
          tier_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "memberships_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "membership_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          booking_id: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          recipient_email: string | null
          recipient_phone: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          template_type: string
          user_id: string | null
        }
        Insert: {
          body: string
          booking_id?: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_type: string
          user_id?: string | null
        }
        Update: {
          body?: string
          booking_id?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          recipient_email?: string | null
          recipient_phone?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          template_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          base_price: number
          bookable_type_id: string
          created_at: string
          description: string | null
          duration_mins: number
          id: string
          included_items: Json | null
          is_active: boolean | null
          member_price: number | null
          name: string
          settings: Json | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          base_price: number
          bookable_type_id: string
          created_at?: string
          description?: string | null
          duration_mins: number
          id?: string
          included_items?: Json | null
          is_active?: boolean | null
          member_price?: number | null
          name: string
          settings?: Json | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          base_price?: number
          bookable_type_id?: string
          created_at?: string
          description?: string | null
          duration_mins?: number
          id?: string
          included_items?: Json | null
          is_active?: boolean | null
          member_price?: number | null
          name?: string
          settings?: Json | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packages_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_schedules: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          description: string | null
          due_date: string
          id: string
          payment_id: string | null
          reminder_sent_at: string | null
          status: string | null
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          description?: string | null
          due_date: string
          id?: string
          payment_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          description?: string | null
          due_date?: string
          id?: string
          payment_id?: string | null
          reminder_sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_schedules_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_schedules_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          membership_id: string | null
          metadata: Json | null
          paid_at: string | null
          payment_method_last4: string | null
          payment_method_type: string | null
          payment_type: string
          refund_amount: number | null
          refund_reason: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          membership_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method_last4?: string | null
          payment_method_type?: string | null
          payment_type: string
          refund_amount?: number | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          membership_id?: string | null
          metadata?: Json | null
          paid_at?: string | null
          payment_method_last4?: string | null
          payment_method_type?: string | null
          payment_type?: string
          refund_amount?: number | null
          refund_reason?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_rules: {
        Row: {
          bookable_type_id: string | null
          business_id: string
          conditions: Json
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          modifier_type: Database["public"]["Enums"]["pricing_modifier_type"]
          modifier_value: number
          name: string
          package_id: string | null
          priority: number | null
          rule_type: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          bookable_type_id?: string | null
          business_id: string
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          modifier_type: Database["public"]["Enums"]["pricing_modifier_type"]
          modifier_value: number
          name: string
          package_id?: string | null
          priority?: number | null
          rule_type: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          bookable_type_id?: string | null
          business_id?: string
          conditions?: Json
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          modifier_type?: Database["public"]["Enums"]["pricing_modifier_type"]
          modifier_value?: number
          name?: string
          package_id?: string | null
          priority?: number | null
          rule_type?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pricing_rules_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          id: string
          last_name: string | null
          marketing_opt_in: boolean | null
          phone: string | null
          sms_opt_in: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          sms_opt_in?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          marketing_opt_in?: boolean | null
          phone?: string | null
          sms_opt_in?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          applicable_bookable_types: string[] | null
          applicable_businesses: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["pricing_modifier_type"]
          discount_value: number
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          min_purchase_amount: number | null
          per_user_limit: number | null
          requires_membership: boolean | null
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applicable_bookable_types?: string[] | null
          applicable_businesses?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["pricing_modifier_type"]
          discount_value: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          per_user_limit?: number | null
          requires_membership?: boolean | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applicable_bookable_types?: string[] | null
          applicable_businesses?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["pricing_modifier_type"]
          discount_value?: number
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          per_user_limit?: number | null
          requires_membership?: boolean | null
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      provider_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          provider_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          provider_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          provider_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_schedules_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          accepts_bookings: boolean | null
          avatar_url: string | null
          bio: string | null
          business_id: string
          certifications: Json | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          sort_order: number | null
          specialties: Json | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepts_bookings?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          business_id: string
          certifications?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          sort_order?: number | null
          specialties?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepts_bookings?: boolean | null
          avatar_url?: string | null
          bio?: string | null
          business_id?: string
          certifications?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          sort_order?: number | null
          specialties?: Json | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          membership_id: string | null
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_amount: number | null
          reward_credited_at: string | null
          status: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          membership_id?: string | null
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          reward_credited_at?: string | null
          status?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          membership_id?: string | null
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          reward_credited_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_bookable_types: {
        Row: {
          bookable_type_id: string
          created_at: string
          id: string
          is_primary: boolean | null
          resource_id: string
        }
        Insert: {
          bookable_type_id: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          resource_id: string
        }
        Update: {
          bookable_type_id?: string
          created_at?: string
          id?: string
          is_primary?: boolean | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_bookable_types_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_bookable_types_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          amenities: Json | null
          business_id: string
          capacity: number | null
          created_at: string
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          name: string
          settings: Json | null
          slug: string
          sort_order: number | null
          square_footage: number | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          business_id: string
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name: string
          settings?: Json | null
          slug: string
          sort_order?: number | null
          square_footage?: number | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          business_id?: string
          capacity?: number | null
          created_at?: string
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          slug?: string
          sort_order?: number | null
          square_footage?: number | null
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          admin_response: string | null
          booking_id: string
          content: string | null
          created_at: string
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          rating: number
          responded_at: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_response?: string | null
          booking_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          rating: number
          responded_at?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_response?: string | null
          booking_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          rating?: number
          responded_at?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      signed_documents: {
        Row: {
          booking_id: string | null
          content_hash: string | null
          created_at: string
          id: string
          ip_address: unknown
          membership_id: string | null
          signature_data: string | null
          signed_at: string
          template_id: string
          template_version: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          content_hash?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          membership_id?: string | null
          signature_data?: string | null
          signed_at?: string
          template_id: string
          template_version: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          content_hash?: string | null
          created_at?: string
          id?: string
          ip_address?: unknown
          membership_id?: string | null
          signature_data?: string | null
          signed_at?: string
          template_id?: string
          template_version?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "signed_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signed_documents_membership_id_fkey"
            columns: ["membership_id"]
            isOneToOne: false
            referencedRelation: "memberships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signed_documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      slot_holds: {
        Row: {
          bookable_type_id: string
          created_at: string
          end_datetime: string
          expires_at: string
          id: string
          provider_id: string | null
          resource_id: string | null
          session_id: string | null
          start_datetime: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          bookable_type_id: string
          created_at?: string
          end_datetime: string
          expires_at: string
          id?: string
          provider_id?: string | null
          resource_id?: string | null
          session_id?: string | null
          start_datetime: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bookable_type_id?: string
          created_at?: string
          end_datetime?: string
          expires_at?: string
          id?: string
          provider_id?: string | null
          resource_id?: string | null
          session_id?: string | null
          start_datetime?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "slot_holds_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_holds_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "slot_holds_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          created_by: string | null
          department: Database["public"]["Enums"]["business_type"] | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: Database["public"]["Enums"]["business_type"] | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: Database["public"]["Enums"]["business_type"] | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waitlist_entries: {
        Row: {
          bookable_type_id: string | null
          business_id: string
          claim_expires_at: string | null
          claim_token: string | null
          claimed_at: string | null
          created_at: string
          flexibility_days: number | null
          guest_email: string | null
          guest_phone: string | null
          id: string
          is_vip: boolean | null
          notified_at: string | null
          position: number | null
          preferred_date: string | null
          preferred_time_end: string | null
          preferred_time_start: string | null
          resource_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          bookable_type_id?: string | null
          business_id: string
          claim_expires_at?: string | null
          claim_token?: string | null
          claimed_at?: string | null
          created_at?: string
          flexibility_days?: number | null
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          is_vip?: boolean | null
          notified_at?: string | null
          position?: number | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          resource_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          bookable_type_id?: string | null
          business_id?: string
          claim_expires_at?: string | null
          claim_token?: string | null
          claimed_at?: string | null
          created_at?: string
          flexibility_days?: number | null
          guest_email?: string | null
          guest_phone?: string | null
          id?: string
          is_vip?: boolean | null
          notified_at?: string | null
          position?: number | null
          preferred_date?: string | null
          preferred_time_end?: string | null
          preferred_time_start?: string | null
          resource_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_entries_bookable_type_id_fkey"
            columns: ["bookable_type_id"]
            isOneToOne: false
            referencedRelation: "bookable_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waitlist_entries_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      wallet_transactions: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string
          description: string | null
          gift_card_id: string | null
          id: string
          payment_id: string | null
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          gift_card_id?: string | null
          id?: string
          payment_id?: string | null
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string
          description?: string | null
          gift_card_id?: string | null
          id?: string
          payment_id?: string | null
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "customer_wallets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_booking_number: { Args: never; Returns: string }
      has_department_access: {
        Args: {
          _business_type: Database["public"]["Enums"]["business_type"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      addon_pricing_mode: "flat" | "per_hour" | "per_guest" | "time_based"
      app_role:
        | "owner"
        | "manager"
        | "event_coordinator"
        | "spa_lead"
        | "coworking_manager"
        | "fitness_lead"
        | "front_desk"
        | "read_only"
      booking_mode: "instant" | "request"
      booking_status:
        | "pending"
        | "pending_payment"
        | "pending_documents"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      business_type: "summit" | "coworking" | "spa" | "fitness"
      document_type: "contract" | "waiver" | "policy" | "intake_form"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "negotiating"
        | "won"
        | "lost"
      membership_status:
        | "active"
        | "paused"
        | "cancelled"
        | "expired"
        | "pending"
      notification_channel: "email" | "sms" | "push"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "partial_refund"
      pricing_modifier_type: "percentage" | "fixed_amount"
      resource_type:
        | "room"
        | "office"
        | "suite"
        | "equipment"
        | "provider"
        | "amenity"
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
      addon_pricing_mode: ["flat", "per_hour", "per_guest", "time_based"],
      app_role: [
        "owner",
        "manager",
        "event_coordinator",
        "spa_lead",
        "coworking_manager",
        "fitness_lead",
        "front_desk",
        "read_only",
      ],
      booking_mode: ["instant", "request"],
      booking_status: [
        "pending",
        "pending_payment",
        "pending_documents",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      business_type: ["summit", "coworking", "spa", "fitness"],
      document_type: ["contract", "waiver", "policy", "intake_form"],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "negotiating",
        "won",
        "lost",
      ],
      membership_status: [
        "active",
        "paused",
        "cancelled",
        "expired",
        "pending",
      ],
      notification_channel: ["email", "sms", "push"],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partial_refund",
      ],
      pricing_modifier_type: ["percentage", "fixed_amount"],
      resource_type: [
        "room",
        "office",
        "suite",
        "equipment",
        "provider",
        "amenity",
      ],
    },
  },
} as const
