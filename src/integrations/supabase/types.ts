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
      app_config: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      assumptions: {
        Row: {
          assumption_text: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          reason: string | null
          replaced_by: string | null
          status: string | null
        }
        Insert: {
          assumption_text: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          reason?: string | null
          replaced_by?: string | null
          status?: string | null
        }
        Update: {
          assumption_text?: string
          category?: string | null
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
      availability_overrides: {
        Row: {
          availability_windows: Json | null
          business_id: string
          created_at: string
          created_by: string | null
          id: string
          is_unavailable: boolean
          notes: string | null
          override_date: string
          provider_id: string | null
          updated_at: string
        }
        Insert: {
          availability_windows?: Json | null
          business_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_unavailable?: boolean
          notes?: string | null
          override_date: string
          provider_id?: string | null
          updated_at?: string
        }
        Update: {
          availability_windows?: Json | null
          business_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_unavailable?: boolean
          notes?: string | null
          override_date?: string
          provider_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_overrides_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "availability_overrides_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_windows: {
        Row: {
          bookable_type_id: string | null
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          provider_id: string | null
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
          provider_id?: string | null
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
          provider_id?: string | null
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
          email_sent_customer_at: string | null
          email_sent_staff_at: string | null
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
          source_brand: string | null
          spa_worker_id: string | null
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
          email_sent_customer_at?: string | null
          email_sent_staff_at?: string | null
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
          source_brand?: string | null
          spa_worker_id?: string | null
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
          email_sent_customer_at?: string | null
          email_sent_staff_at?: string | null
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
          source_brand?: string | null
          spa_worker_id?: string | null
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
          {
            foreignKeyName: "bookings_spa_worker_id_fkey"
            columns: ["spa_worker_id"]
            isOneToOne: false
            referencedRelation: "spa_workers"
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
      career_application_activity: {
        Row: {
          action: string
          actor: string | null
          application_id: string
          created_at: string
          id: string
          metadata: Json | null
        }
        Insert: {
          action: string
          actor?: string | null
          application_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor?: string | null
          application_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "career_application_activity_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "career_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      career_applications: {
        Row: {
          applicant: Json
          attachments: Json | null
          availability: Json | null
          consents: Json
          created_at: string
          form_version: string | null
          id: string
          is_read: boolean
          role: string
          role_specific: Json | null
          source_url: string | null
          status: Database["public"]["Enums"]["career_application_status"]
          tags: string[]
          team: Database["public"]["Enums"]["career_team"]
          updated_at: string
        }
        Insert: {
          applicant?: Json
          attachments?: Json | null
          availability?: Json | null
          consents?: Json
          created_at?: string
          form_version?: string | null
          id?: string
          is_read?: boolean
          role: string
          role_specific?: Json | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["career_application_status"]
          tags?: string[]
          team: Database["public"]["Enums"]["career_team"]
          updated_at?: string
        }
        Update: {
          applicant?: Json
          attachments?: Json | null
          availability?: Json | null
          consents?: Json
          created_at?: string
          form_version?: string | null
          id?: string
          is_read?: boolean
          role?: string
          role_specific?: Json | null
          source_url?: string | null
          status?: Database["public"]["Enums"]["career_application_status"]
          tags?: string[]
          team?: Database["public"]["Enums"]["career_team"]
          updated_at?: string
        }
        Relationships: []
      }
      career_openings: {
        Row: {
          apply_route: string | null
          created_at: string
          description: string | null
          employment_type: string | null
          id: string
          is_active: boolean
          location: string | null
          pay_range: string | null
          role: string
          sort_order: number | null
          team: Database["public"]["Enums"]["career_team"]
          updated_at: string
        }
        Insert: {
          apply_route?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          pay_range?: string | null
          role: string
          sort_order?: number | null
          team: Database["public"]["Enums"]["career_team"]
          updated_at?: string
        }
        Update: {
          apply_route?: string | null
          created_at?: string
          description?: string | null
          employment_type?: string | null
          id?: string
          is_active?: boolean
          location?: string | null
          pay_range?: string | null
          role?: string
          sort_order?: number | null
          team?: Database["public"]["Enums"]["career_team"]
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
      claims: {
        Row: {
          admin_notes: string | null
          claim_code: string
          consent_timestamp: string | null
          created_at: string | null
          id: string
          interested_in: string | null
          redemption_deadline: string | null
          spin_id: string
          status: Database["public"]["Enums"]["claim_status"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          claim_code: string
          consent_timestamp?: string | null
          created_at?: string | null
          id?: string
          interested_in?: string | null
          redemption_deadline?: string | null
          spin_id: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          claim_code?: string
          consent_timestamp?: string | null
          created_at?: string | null
          id?: string
          interested_in?: string | null
          redemption_deadline?: string | null
          spin_id?: string
          status?: Database["public"]["Enums"]["claim_status"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claims_spin_id_fkey"
            columns: ["spin_id"]
            isOneToOne: false
            referencedRelation: "spins"
            referencedColumns: ["id"]
          },
        ]
      }
      commission_rules: {
        Row: {
          business_unit: Database["public"]["Enums"]["business_type"] | null
          commission_percent: number
          created_at: string | null
          created_by: string | null
          effective_from: string | null
          effective_until: string | null
          employee_id: string | null
          id: string
          is_active: boolean | null
          max_revenue: number | null
          min_revenue: number | null
          name: string
          parent_rule_id: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          business_unit?: Database["public"]["Enums"]["business_type"] | null
          commission_percent?: number
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          max_revenue?: number | null
          min_revenue?: number | null
          name: string
          parent_rule_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          business_unit?: Database["public"]["Enums"]["business_type"] | null
          commission_percent?: number
          created_at?: string | null
          created_by?: string | null
          effective_from?: string | null
          effective_until?: string | null
          employee_id?: string | null
          id?: string
          is_active?: boolean | null
          max_revenue?: number | null
          min_revenue?: number | null
          name?: string
          parent_rule_id?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "commission_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commission_rules_parent_rule_id_fkey"
            columns: ["parent_rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      coworking_content: {
        Row: {
          content: Json
          id: string
          section_key: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          section_key: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          section_key?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      crm_activity_events: {
        Row: {
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string | null
          event_type: Database["public"]["Enums"]["crm_activity_type"]
          id: string
          ip_address: unknown
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          event_type: Database["public"]["Enums"]["crm_activity_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string | null
          event_type?: Database["public"]["Enums"]["crm_activity_type"]
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activity_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          severity: string | null
          target_roles: string[] | null
          target_user_id: string | null
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          target_roles?: string[] | null
          target_user_id?: string | null
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          severity?: string | null
          target_roles?: string[] | null
          target_user_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_alerts_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_commissions: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string
          id: string
          paid_at: string | null
          payroll_run_id: string | null
          revenue_event_id: string
          rule_id: string | null
          status: Database["public"]["Enums"]["commission_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          paid_at?: string | null
          payroll_run_id?: string | null
          revenue_event_id: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          paid_at?: string | null
          payroll_run_id?: string | null
          revenue_event_id?: string
          rule_id?: string | null
          status?: Database["public"]["Enums"]["commission_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_commissions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_commissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_commissions_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_commissions_revenue_event_id_fkey"
            columns: ["revenue_event_id"]
            isOneToOne: false
            referencedRelation: "crm_revenue_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_commissions_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "commission_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_lead_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          id: string
          is_internal: boolean | null
          lead_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          id?: string
          is_internal?: boolean | null
          lead_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          id?: string
          is_internal?: boolean | null
          lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_lead_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_lead_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          assigned_employee_id: string | null
          business_unit: Database["public"]["Enums"]["business_type"]
          company_name: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          follow_up_due: string | null
          id: string
          lead_name: string
          lost_reason: string | null
          phone: string | null
          revenue_attached: number | null
          source: Database["public"]["Enums"]["crm_lead_source"] | null
          status: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at: string | null
        }
        Insert: {
          assigned_employee_id?: string | null
          business_unit: Database["public"]["Enums"]["business_type"]
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          follow_up_due?: string | null
          id?: string
          lead_name: string
          lost_reason?: string | null
          phone?: string | null
          revenue_attached?: number | null
          source?: Database["public"]["Enums"]["crm_lead_source"] | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
        }
        Update: {
          assigned_employee_id?: string | null
          business_unit?: Database["public"]["Enums"]["business_type"]
          company_name?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          follow_up_due?: string | null
          id?: string
          lead_name?: string
          lost_reason?: string | null
          phone?: string | null
          revenue_attached?: number | null
          source?: Database["public"]["Enums"]["crm_lead_source"] | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_revenue_events: {
        Row: {
          amount: number
          business_unit: Database["public"]["Enums"]["business_type"]
          created_at: string | null
          description: string | null
          employee_attributed_id: string | null
          id: string
          lead_id: string | null
          recorded_by: string
          revenue_date: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          business_unit: Database["public"]["Enums"]["business_type"]
          created_at?: string | null
          description?: string | null
          employee_attributed_id?: string | null
          id?: string
          lead_id?: string | null
          recorded_by: string
          revenue_date?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          business_unit?: Database["public"]["Enums"]["business_type"]
          created_at?: string | null
          description?: string | null
          employee_attributed_id?: string | null
          id?: string
          lead_id?: string | null
          recorded_by?: string
          revenue_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_revenue_events_employee_attributed_id_fkey"
            columns: ["employee_attributed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_revenue_events_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_revenue_events_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      daily_spin_counts: {
        Row: {
          created_at: string | null
          id: string
          spin_count: number | null
          spin_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          spin_count?: number | null
          spin_date?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          spin_count?: number | null
          spin_date?: string
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
      employee_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          employee_id: string
          id: string
          note_type: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          employee_id: string
          id?: string
          note_type?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          employee_id?: string
          id?: string
          note_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      giveaway_draws: {
        Row: {
          created_at: string | null
          draw_date: string | null
          id: string
          month_key: string
          status: string
        }
        Insert: {
          created_at?: string | null
          draw_date?: string | null
          id?: string
          month_key: string
          status?: string
        }
        Update: {
          created_at?: string | null
          draw_date?: string | null
          id?: string
          month_key?: string
          status?: string
        }
        Relationships: []
      }
      giveaway_entries: {
        Row: {
          created_at: string | null
          entry_type: string
          id: string
          month_key: string
          quantity: number
          source: string
          spin_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entry_type: string
          id?: string
          month_key: string
          quantity?: number
          source?: string
          spin_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entry_type?: string
          id?: string
          month_key?: string
          quantity?: number
          source?: string
          spin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_entries_spin_id_fkey"
            columns: ["spin_id"]
            isOneToOne: false
            referencedRelation: "spins"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_entry_types: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          id: string
          label: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          id?: string
          label: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          id?: string
          label?: string
        }
        Relationships: []
      }
      giveaway_tickets: {
        Row: {
          created_at: string | null
          id: string
          multiplier: number | null
          pool: Database["public"]["Enums"]["giveaway_pool"]
          source: Database["public"]["Enums"]["ticket_source"]
          spin_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          multiplier?: number | null
          pool?: Database["public"]["Enums"]["giveaway_pool"]
          source?: Database["public"]["Enums"]["ticket_source"]
          spin_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          multiplier?: number | null
          pool?: Database["public"]["Enums"]["giveaway_pool"]
          source?: Database["public"]["Enums"]["ticket_source"]
          spin_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_tickets_spin_id_fkey"
            columns: ["spin_id"]
            isOneToOne: false
            referencedRelation: "spins"
            referencedColumns: ["id"]
          },
        ]
      }
      giveaway_winners: {
        Row: {
          announced_at: string | null
          created_at: string | null
          draw_id: string | null
          entry_type: string
          id: string
          notes: string | null
          user_id: string
          winner_name_public: string | null
        }
        Insert: {
          announced_at?: string | null
          created_at?: string | null
          draw_id?: string | null
          entry_type: string
          id?: string
          notes?: string | null
          user_id: string
          winner_name_public?: string | null
        }
        Update: {
          announced_at?: string | null
          created_at?: string | null
          draw_id?: string | null
          entry_type?: string
          id?: string
          notes?: string | null
          user_id?: string
          winner_name_public?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "giveaway_winners_draw_id_fkey"
            columns: ["draw_id"]
            isOneToOne: false
            referencedRelation: "giveaway_draws"
            referencedColumns: ["id"]
          },
        ]
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
      hive_private_offices: {
        Row: {
          booked_until: string | null
          code: string
          deposit_amount: number
          floor_label: string
          label: string
          monthly_rate: number
          notes: string | null
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          booked_until?: string | null
          code: string
          deposit_amount: number
          floor_label: string
          label: string
          monthly_rate: number
          notes?: string | null
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          booked_until?: string | null
          code?: string
          deposit_amount?: number
          floor_label?: string
          label?: string
          monthly_rate?: number
          notes?: string | null
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
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
      notification_logs: {
        Row: {
          booking_id: string | null
          channel: string
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          notification_type: string
          provider: string | null
          provider_message_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          recipient_type: string
          sent_at: string | null
          status: string
          subject: string | null
        }
        Insert: {
          booking_id?: string | null
          channel: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_type: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          booking_id?: string | null
          channel?: string
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          provider?: string | null
          provider_message_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_type?: string
          sent_at?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_settings: {
        Row: {
          business_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          setting_key: string
          setting_value: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key: string
          setting_value: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          setting_key?: string
          setting_value?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      office_inquiries: {
        Row: {
          approval_status: string
          approved_at: string | null
          assigned_to: string | null
          company_name: string | null
          created_at: string
          denial_reason: string | null
          denied_at: string | null
          deposit_amount: number | null
          email: string
          first_name: string
          id: string
          inquiry_type: string
          internal_notes: string | null
          last_name: string | null
          lease_term_months: number | null
          message: string | null
          monthly_rate: number | null
          move_in_timeframe: string | null
          needs_business_address: boolean | null
          needs_meeting_rooms: boolean | null
          office_code: string | null
          office_id: string | null
          phone: string | null
          preferred_tour_dates: Json | null
          seats_needed: number | null
          source: string | null
          status: string | null
          term_total: number | null
          tour_type: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          workspace_type: string | null
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string
          denial_reason?: string | null
          denied_at?: string | null
          deposit_amount?: number | null
          email: string
          first_name: string
          id?: string
          inquiry_type?: string
          internal_notes?: string | null
          last_name?: string | null
          lease_term_months?: number | null
          message?: string | null
          monthly_rate?: number | null
          move_in_timeframe?: string | null
          needs_business_address?: boolean | null
          needs_meeting_rooms?: boolean | null
          office_code?: string | null
          office_id?: string | null
          phone?: string | null
          preferred_tour_dates?: Json | null
          seats_needed?: number | null
          source?: string | null
          status?: string | null
          term_total?: number | null
          tour_type?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_type?: string | null
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          assigned_to?: string | null
          company_name?: string | null
          created_at?: string
          denial_reason?: string | null
          denied_at?: string | null
          deposit_amount?: number | null
          email?: string
          first_name?: string
          id?: string
          inquiry_type?: string
          internal_notes?: string | null
          last_name?: string | null
          lease_term_months?: number | null
          message?: string | null
          monthly_rate?: number | null
          move_in_timeframe?: string | null
          needs_business_address?: boolean | null
          needs_meeting_rooms?: boolean | null
          office_code?: string | null
          office_id?: string | null
          phone?: string | null
          preferred_tour_dates?: Json | null
          seats_needed?: number | null
          source?: string | null
          status?: string | null
          term_total?: number | null
          tour_type?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          workspace_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "office_inquiries_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "office_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      office_listings: {
        Row: {
          amenities: Json | null
          capacity: number | null
          created_at: string
          deposit_amount: number | null
          description: string | null
          floor: number
          floor_label: string | null
          id: string
          ideal_use: string | null
          is_active: boolean | null
          is_featured: boolean | null
          meta_description: string | null
          meta_title: string | null
          monthly_rate: number | null
          name: string
          office_type: Database["public"]["Enums"]["office_type"]
          price_range_text: string | null
          pricing_visibility: Database["public"]["Enums"]["pricing_visibility"]
          slug: string
          sort_order: number | null
          square_footage: number | null
          status: Database["public"]["Enums"]["office_status"]
          status_note: string | null
          tagline: string | null
          updated_at: string
        }
        Insert: {
          amenities?: Json | null
          capacity?: number | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          floor?: number
          floor_label?: string | null
          id?: string
          ideal_use?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_rate?: number | null
          name: string
          office_type?: Database["public"]["Enums"]["office_type"]
          price_range_text?: string | null
          pricing_visibility?: Database["public"]["Enums"]["pricing_visibility"]
          slug: string
          sort_order?: number | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["office_status"]
          status_note?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Update: {
          amenities?: Json | null
          capacity?: number | null
          created_at?: string
          deposit_amount?: number | null
          description?: string | null
          floor?: number
          floor_label?: string | null
          id?: string
          ideal_use?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          monthly_rate?: number | null
          name?: string
          office_type?: Database["public"]["Enums"]["office_type"]
          price_range_text?: string | null
          pricing_visibility?: Database["public"]["Enums"]["pricing_visibility"]
          slug?: string
          sort_order?: number | null
          square_footage?: number | null
          status?: Database["public"]["Enums"]["office_status"]
          status_note?: string | null
          tagline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      office_photos: {
        Row: {
          alt_text: string | null
          caption: string | null
          created_at: string
          id: string
          is_primary: boolean | null
          office_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          office_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          is_primary?: boolean | null
          office_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_photos_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "office_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      office_promotions: {
        Row: {
          badge_text: string | null
          created_at: string
          description: string | null
          end_date: string | null
          headline: string
          id: string
          is_active: boolean | null
          is_global: boolean | null
          office_id: string | null
          start_date: string
          updated_at: string
        }
        Insert: {
          badge_text?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          headline: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          office_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Update: {
          badge_text?: string | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          headline?: string
          id?: string
          is_active?: boolean | null
          is_global?: boolean | null
          office_id?: string | null
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "office_promotions_office_id_fkey"
            columns: ["office_id"]
            isOneToOne: false
            referencedRelation: "office_listings"
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
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          commission_count: number | null
          created_at: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          notes: string | null
          paid_at: string | null
          paid_by: string | null
          period_end: string
          period_start: string
          status: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          commission_count?: number | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          period_end: string
          period_start: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          commission_count?: number | null
          created_at?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          notes?: string | null
          paid_at?: string | null
          paid_by?: string | null
          period_end?: string
          period_start?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_booth_inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          event_date: string | null
          event_location: string | null
          event_type: string | null
          full_name: string
          id: string
          internal_notes: string | null
          notes: string | null
          phone: string
          preferred_contact: string | null
          source: string | null
          status: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          full_name: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone: string
          preferred_contact?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          event_date?: string | null
          event_location?: string | null
          event_type?: string | null
          full_name?: string
          id?: string
          internal_notes?: string | null
          notes?: string | null
          phone?: string
          preferred_contact?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
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
      prize_cap_tracking: {
        Row: {
          created_at: string | null
          daily_count: number | null
          id: string
          prize_id: string
          tracking_date: string
          week_start: string | null
          weekly_count: number | null
        }
        Insert: {
          created_at?: string | null
          daily_count?: number | null
          id?: string
          prize_id: string
          tracking_date?: string
          week_start?: string | null
          weekly_count?: number | null
        }
        Update: {
          created_at?: string | null
          daily_count?: number | null
          id?: string
          prize_id?: string
          tracking_date?: string
          week_start?: string | null
          weekly_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prize_cap_tracking_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      prizes: {
        Row: {
          access_level: Database["public"]["Enums"]["prize_access_level"]
          active: boolean | null
          booking_url: string | null
          created_at: string | null
          daily_cap: number | null
          description: string | null
          expiry_days: number | null
          free_weight: number
          id: string
          instructions: string | null
          name: string
          requires_manual_approval: boolean | null
          updated_at: string | null
          vip_weight: number
          weekly_cap: number | null
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["prize_access_level"]
          active?: boolean | null
          booking_url?: string | null
          created_at?: string | null
          daily_cap?: number | null
          description?: string | null
          expiry_days?: number | null
          free_weight?: number
          id?: string
          instructions?: string | null
          name: string
          requires_manual_approval?: boolean | null
          updated_at?: string | null
          vip_weight?: number
          weekly_cap?: number | null
        }
        Update: {
          access_level?: Database["public"]["Enums"]["prize_access_level"]
          active?: boolean | null
          booking_url?: string | null
          created_at?: string | null
          daily_cap?: number | null
          description?: string | null
          expiry_days?: number | null
          free_weight?: number
          id?: string
          instructions?: string | null
          name?: string
          requires_manual_approval?: boolean | null
          updated_at?: string | null
          vip_weight?: number
          weekly_cap?: number | null
        }
        Relationships: []
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
          username: string | null
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
          username?: string | null
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
          username?: string | null
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
      promotion_leads: {
        Row: {
          business_interest: string[] | null
          created_at: string
          email: string
          id: string
          lead_type: string | null
          metadata: Json | null
          name: string
          notes: string | null
          offer_id: string | null
          offer_title_snapshot: string | null
          phone: string | null
          preferred_contact_method: string | null
          source_page: string | null
          status: Database["public"]["Enums"]["promotion_lead_status"]
          updated_at: string
        }
        Insert: {
          business_interest?: string[] | null
          created_at?: string
          email: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          offer_id?: string | null
          offer_title_snapshot?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["promotion_lead_status"]
          updated_at?: string
        }
        Update: {
          business_interest?: string[] | null
          created_at?: string
          email?: string
          id?: string
          lead_type?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          offer_id?: string | null
          offer_title_snapshot?: string | null
          phone?: string | null
          preferred_contact_method?: string | null
          source_page?: string | null
          status?: Database["public"]["Enums"]["promotion_lead_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_leads_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          badge: string | null
          benefits: Json | null
          category: Database["public"]["Enums"]["promotion_category"]
          created_at: string
          eligibility_rules: Json | null
          end_date: string | null
          id: string
          limits_fine_print: string | null
          long_description: string | null
          primary_business_id: string | null
          primary_cta_action: Database["public"]["Enums"]["promotion_cta_action"]
          primary_cta_label: string
          primary_cta_target: string | null
          progress_target: number | null
          progress_window_days: number | null
          short_description: string
          slug: string
          sort_order: number | null
          start_date: string | null
          status: Database["public"]["Enums"]["promotion_status"]
          tags: string[] | null
          title: string
          type: Database["public"]["Enums"]["promotion_type"] | null
          updated_at: string
          visibility: string | null
        }
        Insert: {
          badge?: string | null
          benefits?: Json | null
          category?: Database["public"]["Enums"]["promotion_category"]
          created_at?: string
          eligibility_rules?: Json | null
          end_date?: string | null
          id?: string
          limits_fine_print?: string | null
          long_description?: string | null
          primary_business_id?: string | null
          primary_cta_action?: Database["public"]["Enums"]["promotion_cta_action"]
          primary_cta_label?: string
          primary_cta_target?: string | null
          progress_target?: number | null
          progress_window_days?: number | null
          short_description: string
          slug: string
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          tags?: string[] | null
          title: string
          type?: Database["public"]["Enums"]["promotion_type"] | null
          updated_at?: string
          visibility?: string | null
        }
        Update: {
          badge?: string | null
          benefits?: Json | null
          category?: Database["public"]["Enums"]["promotion_category"]
          created_at?: string
          eligibility_rules?: Json | null
          end_date?: string | null
          id?: string
          limits_fine_print?: string | null
          long_description?: string | null
          primary_business_id?: string | null
          primary_cta_action?: Database["public"]["Enums"]["promotion_cta_action"]
          primary_cta_label?: string
          primary_cta_target?: string | null
          progress_target?: number | null
          progress_window_days?: number | null
          short_description?: string
          slug?: string
          sort_order?: number | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["promotion_status"]
          tags?: string[] | null
          title?: string
          type?: Database["public"]["Enums"]["promotion_type"] | null
          updated_at?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotions_primary_business_id_fkey"
            columns: ["primary_business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
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
      provider_settings: {
        Row: {
          auto_confirm_bookings: boolean
          buffer_after_mins: number
          buffer_before_mins: number
          business_id: string | null
          created_at: string
          id: string
          max_advance_days: number
          min_advance_hours: number
          notification_email: string | null
          notification_sms: string | null
          provider_id: string | null
          slot_increment_mins: number
          updated_at: string
        }
        Insert: {
          auto_confirm_bookings?: boolean
          buffer_after_mins?: number
          buffer_before_mins?: number
          business_id?: string | null
          created_at?: string
          id?: string
          max_advance_days?: number
          min_advance_hours?: number
          notification_email?: string | null
          notification_sms?: string | null
          provider_id?: string | null
          slot_increment_mins?: number
          updated_at?: string
        }
        Update: {
          auto_confirm_bookings?: boolean
          buffer_after_mins?: number
          buffer_before_mins?: number
          business_id?: string | null
          created_at?: string
          id?: string
          max_advance_days?: number
          min_advance_hours?: number
          notification_email?: string | null
          notification_sms?: string | null
          provider_id?: string | null
          slot_increment_mins?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_settings_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
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
      recurring_blocks: {
        Row: {
          business_id: string | null
          created_at: string
          created_by: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          provider_id: string | null
          reason: string | null
          start_time: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          provider_id?: string | null
          reason?: string | null
          start_time: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          created_by?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          provider_id?: string | null
          reason?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_blocks_business_id_fkey"
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
      reschedule_requests: {
        Row: {
          booking_id: string
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          expires_at: string
          id: string
          initiated_by: string | null
          new_end_datetime: string | null
          new_start_datetime: string | null
          original_end_datetime: string
          original_start_datetime: string
          proposed_times: Json
          reason: string | null
          selected_time_index: number | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at: string
          id?: string
          initiated_by?: string | null
          new_end_datetime?: string | null
          new_start_datetime?: string | null
          original_end_datetime: string
          original_start_datetime: string
          proposed_times?: Json
          reason?: string | null
          selected_time_index?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          initiated_by?: string | null
          new_end_datetime?: string | null
          new_start_datetime?: string | null
          original_end_datetime?: string
          original_start_datetime?: string
          proposed_times?: Json
          reason?: string | null
          selected_time_index?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reschedule_requests_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
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
      scheduled_reminders: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          notification_log_id: string | null
          processed_at: string | null
          recipient_type: string
          reminder_type: string
          scheduled_for: string
          status: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          notification_log_id?: string | null
          processed_at?: string | null
          recipient_type?: string
          reminder_type: string
          scheduled_for: string
          status?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          notification_log_id?: string | null
          processed_at?: string | null
          recipient_type?: string
          reminder_type?: string
          scheduled_for?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_reminders_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_reminders_notification_log_id_fkey"
            columns: ["notification_log_id"]
            isOneToOne: false
            referencedRelation: "notification_logs"
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
      spa_worker_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean
          start_time: string
          updated_at: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean
          start_time: string
          updated_at?: string
          worker_id: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean
          start_time?: string
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spa_worker_availability_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "spa_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_worker_blackouts: {
        Row: {
          created_at: string
          created_by: string | null
          end_datetime: string
          id: string
          reason: string | null
          start_datetime: string
          worker_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_datetime: string
          id?: string
          reason?: string | null
          start_datetime: string
          worker_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_datetime?: string
          id?: string
          reason?: string | null
          start_datetime?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spa_worker_blackouts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "spa_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_worker_services: {
        Row: {
          created_at: string | null
          description: string | null
          duration_mins: number
          icon_name: string | null
          id: string
          is_active: boolean | null
          is_free: boolean | null
          name: string
          price: number
          promo_ends_at: string | null
          promo_price: number | null
          sort_order: number | null
          updated_at: string | null
          worker_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration_mins: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name: string
          price: number
          promo_ends_at?: string | null
          promo_price?: number | null
          sort_order?: number | null
          updated_at?: string | null
          worker_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration_mins?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          is_free?: boolean | null
          name?: string
          price?: number
          promo_ends_at?: string | null
          promo_price?: number | null
          sort_order?: number | null
          updated_at?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spa_worker_services_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "spa_workers"
            referencedColumns: ["id"]
          },
        ]
      }
      spa_workers: {
        Row: {
          created_at: string
          created_by: string | null
          deactivated_at: string | null
          deactivated_by: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_name: string
          email: string
          first_name: string
          id: string
          invite_accepted_at: string | null
          invite_expires_at: string | null
          invite_token: string | null
          invited_at: string | null
          is_active: boolean
          last_name: string
          notes: string | null
          onboarding_complete: boolean
          phone: string | null
          slug: string | null
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name: string
          email: string
          first_name: string
          id?: string
          invite_accepted_at?: string | null
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean
          last_name: string
          notes?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          deactivated_at?: string | null
          deactivated_by?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string
          email?: string
          first_name?: string
          id?: string
          invite_accepted_at?: string | null
          invite_expires_at?: string | null
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean
          last_name?: string
          notes?: string | null
          onboarding_complete?: boolean
          phone?: string | null
          slug?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      spa_workers_public: {
        Row: {
          display_name: string
          is_active: boolean
          onboarding_complete: boolean
          slug: string | null
          title: string | null
          updated_at: string
          worker_id: string
        }
        Insert: {
          display_name: string
          is_active?: boolean
          onboarding_complete?: boolean
          slug?: string | null
          title?: string | null
          updated_at?: string
          worker_id: string
        }
        Update: {
          display_name?: string
          is_active?: boolean
          onboarding_complete?: boolean
          slug?: string | null
          title?: string | null
          updated_at?: string
          worker_id?: string
        }
        Relationships: []
      }
      spins: {
        Row: {
          created_at: string | null
          id: string
          ip_address: unknown
          is_vip_locked_hit: boolean | null
          prize_id: string | null
          result_token: string | null
          segment_index: number
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_vip_locked_hit?: boolean | null
          prize_id?: string | null
          result_token?: string | null
          segment_index: number
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          ip_address?: unknown
          is_vip_locked_hit?: boolean | null
          prize_id?: string | null
          result_token?: string | null
          segment_index?: number
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spins_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
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
      user_sessions: {
        Row: {
          ended_at: string | null
          id: string
          ip_address: unknown
          is_active: boolean | null
          started_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          started_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string | null
          current_streak: number | null
          id: string
          last_spin_date: string | null
          longest_streak: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_spin_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_streak?: number | null
          id?: string
          last_spin_date?: string | null
          longest_streak?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      vip_subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_comp: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_comp?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_comp?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      voice_vault_bookings: {
        Row: {
          admin_override: boolean | null
          admin_override_by: string | null
          admin_override_reason: string | null
          booking_date: string
          canceled_at: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          deposit_amount: number | null
          duration_hours: number
          end_time: string
          hourly_rate: number
          id: string
          internal_notes: string | null
          payment_status: Database["public"]["Enums"]["voice_vault_payment_status"]
          remaining_balance: number | null
          start_time: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          admin_override?: boolean | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          booking_date: string
          canceled_at?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          deposit_amount?: number | null
          duration_hours: number
          end_time: string
          hourly_rate?: number
          id?: string
          internal_notes?: string | null
          payment_status?: Database["public"]["Enums"]["voice_vault_payment_status"]
          remaining_balance?: number | null
          start_time: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          admin_override?: boolean | null
          admin_override_by?: string | null
          admin_override_reason?: string | null
          booking_date?: string
          canceled_at?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          deposit_amount?: number | null
          duration_hours?: number
          end_time?: string
          hourly_rate?: number
          id?: string
          internal_notes?: string | null
          payment_status?: Database["public"]["Enums"]["voice_vault_payment_status"]
          remaining_balance?: number | null
          start_time?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      voice_vault_packages: {
        Row: {
          balance_remaining: number
          content_status: Database["public"]["Enums"]["voice_vault_content_status"]
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          internal_notes: string | null
          next_payment_date: string | null
          package_price: number
          paid_amount: number
          payment_plan: Database["public"]["Enums"]["voice_vault_payment_plan"]
          payment_status: Database["public"]["Enums"]["voice_vault_payment_status"]
          product_type: Database["public"]["Enums"]["voice_vault_product_type"]
          rights_released_at: string | null
          rights_released_by: string | null
          stripe_checkout_session_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
        }
        Insert: {
          balance_remaining: number
          content_status?: Database["public"]["Enums"]["voice_vault_content_status"]
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          internal_notes?: string | null
          next_payment_date?: string | null
          package_price: number
          paid_amount?: number
          payment_plan: Database["public"]["Enums"]["voice_vault_payment_plan"]
          payment_status?: Database["public"]["Enums"]["voice_vault_payment_status"]
          product_type: Database["public"]["Enums"]["voice_vault_product_type"]
          rights_released_at?: string | null
          rights_released_by?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          balance_remaining?: number
          content_status?: Database["public"]["Enums"]["voice_vault_content_status"]
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          internal_notes?: string | null
          next_payment_date?: string | null
          package_price?: number
          paid_amount?: number
          payment_plan?: Database["public"]["Enums"]["voice_vault_payment_plan"]
          payment_status?: Database["public"]["Enums"]["voice_vault_payment_status"]
          product_type?: Database["public"]["Enums"]["voice_vault_product_type"]
          rights_released_at?: string | null
          rights_released_by?: string | null
          stripe_checkout_session_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      voice_vault_webhook_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          payload: Json | null
          record_id: string | null
          record_type: string | null
          result: string | null
          result_details: string | null
          stripe_event_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          record_id?: string | null
          record_type?: string | null
          result?: string | null
          result_details?: string | null
          stripe_event_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          record_id?: string | null
          record_type?: string | null
          result?: string | null
          result_details?: string | null
          stripe_event_id?: string | null
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
      wheel_config: {
        Row: {
          created_at: string | null
          entry_quantity: number | null
          entry_type: string | null
          free_weight: number
          icon: string | null
          id: string
          is_active: boolean | null
          label: string
          outcome_type: string
          segment_index: number
          updated_at: string | null
          vip_weight: number
        }
        Insert: {
          created_at?: string | null
          entry_quantity?: number | null
          entry_type?: string | null
          free_weight?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          outcome_type: string
          segment_index: number
          updated_at?: string | null
          vip_weight?: number
        }
        Update: {
          created_at?: string | null
          entry_quantity?: number | null
          entry_type?: string | null
          free_weight?: number
          icon?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          outcome_type?: string
          segment_index?: number
          updated_at?: string | null
          vip_weight?: number
        }
        Relationships: []
      }
      wheel_segments: {
        Row: {
          created_at: string | null
          id: string
          prize_id: string | null
          segment_index: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          prize_id?: string | null
          segment_index: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          prize_id?: string | null
          segment_index?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wheel_segments_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_voice_vault_booking_overlap: {
        Args: {
          p_booking_date: string
          p_end_time: string
          p_exclude_id?: string
          p_start_time: string
        }
        Returns: boolean
      }
      generate_booking_number: { Args: never; Returns: string }
      get_spa_worker_id: { Args: { _user_id: string }; Returns: string }
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
      is_spa_worker: { Args: { _user_id: string }; Returns: boolean }
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
        | "spa_worker"
      booking_mode: "instant" | "request"
      booking_status:
        | "pending"
        | "pending_payment"
        | "pending_documents"
        | "approved"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "denied"
        | "cancelled"
        | "no_show"
        | "reschedule_requested"
        | "rescheduled"
      business_type:
        | "summit"
        | "coworking"
        | "spa"
        | "fitness"
        | "voice_vault"
        | "photo_booth"
      career_application_status:
        | "new"
        | "reviewing"
        | "interview"
        | "offer"
        | "hired"
        | "rejected"
      career_team: "spa" | "contracting" | "fitness"
      claim_status:
        | "pending"
        | "verified"
        | "redeemed"
        | "expired"
        | "disqualified"
      commission_status: "pending" | "approved" | "queued" | "paid"
      crm_activity_type:
        | "login"
        | "logout"
        | "lead_created"
        | "lead_updated"
        | "lead_status_changed"
        | "lead_assigned"
        | "lead_note_added"
        | "revenue_created"
        | "commission_approved"
        | "commission_paid"
        | "admin_override"
        | "setting_changed"
        | "user_disabled"
        | "user_enabled"
        | "impersonation_started"
        | "impersonation_ended"
        | "payroll_created"
        | "payroll_locked"
        | "payroll_approved"
        | "payroll_paid"
      crm_lead_source:
        | "website"
        | "referral"
        | "walk_in"
        | "phone"
        | "social_media"
        | "email"
        | "event"
        | "other"
      crm_lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal_sent"
        | "won"
        | "lost"
      document_type: "contract" | "waiver" | "policy" | "intake_form"
      giveaway_pool: "standard" | "vip"
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
      office_status:
        | "available"
        | "renovating"
        | "waitlist"
        | "reserved"
        | "leased"
      office_type:
        | "private_office"
        | "dedicated_desk"
        | "day_pass"
        | "executive_suite"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "refunded"
        | "partial_refund"
      pricing_modifier_type: "percentage" | "fixed_amount"
      pricing_visibility: "hidden" | "qualitative" | "exact"
      prize_access_level: "public" | "vip"
      promotion_category: "signature" | "monthly" | "vault"
      promotion_cta_action: "open_modal" | "scroll_to_form" | "route_to_page"
      promotion_lead_status: "new" | "contacted" | "closed" | "archived"
      promotion_status: "active" | "paused" | "expired"
      promotion_type:
        | "cross_bundle"
        | "volume_incentive"
        | "seasonal"
        | "role_based"
        | "manual_special"
      resource_type:
        | "room"
        | "office"
        | "suite"
        | "equipment"
        | "provider"
        | "amenity"
      ticket_source: "spin" | "prize" | "bonus"
      voice_vault_content_status:
        | "not_applicable"
        | "recording_in_progress"
        | "editing_in_progress"
        | "payment_active"
        | "paid_in_full"
        | "rights_released"
      voice_vault_payment_plan: "full" | "weekly"
      voice_vault_payment_status:
        | "pending"
        | "active_payment"
        | "paused_payment"
        | "paid_in_full"
        | "defaulted"
        | "canceled"
        | "deposit_paid"
      voice_vault_product_type: "hourly" | "core_series" | "white_glove"
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
        "spa_worker",
      ],
      booking_mode: ["instant", "request"],
      booking_status: [
        "pending",
        "pending_payment",
        "pending_documents",
        "approved",
        "confirmed",
        "in_progress",
        "completed",
        "denied",
        "cancelled",
        "no_show",
        "reschedule_requested",
        "rescheduled",
      ],
      business_type: [
        "summit",
        "coworking",
        "spa",
        "fitness",
        "voice_vault",
        "photo_booth",
      ],
      career_application_status: [
        "new",
        "reviewing",
        "interview",
        "offer",
        "hired",
        "rejected",
      ],
      career_team: ["spa", "contracting", "fitness"],
      claim_status: [
        "pending",
        "verified",
        "redeemed",
        "expired",
        "disqualified",
      ],
      commission_status: ["pending", "approved", "queued", "paid"],
      crm_activity_type: [
        "login",
        "logout",
        "lead_created",
        "lead_updated",
        "lead_status_changed",
        "lead_assigned",
        "lead_note_added",
        "revenue_created",
        "commission_approved",
        "commission_paid",
        "admin_override",
        "setting_changed",
        "user_disabled",
        "user_enabled",
        "impersonation_started",
        "impersonation_ended",
        "payroll_created",
        "payroll_locked",
        "payroll_approved",
        "payroll_paid",
      ],
      crm_lead_source: [
        "website",
        "referral",
        "walk_in",
        "phone",
        "social_media",
        "email",
        "event",
        "other",
      ],
      crm_lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal_sent",
        "won",
        "lost",
      ],
      document_type: ["contract", "waiver", "policy", "intake_form"],
      giveaway_pool: ["standard", "vip"],
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
      office_status: [
        "available",
        "renovating",
        "waitlist",
        "reserved",
        "leased",
      ],
      office_type: [
        "private_office",
        "dedicated_desk",
        "day_pass",
        "executive_suite",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "refunded",
        "partial_refund",
      ],
      pricing_modifier_type: ["percentage", "fixed_amount"],
      pricing_visibility: ["hidden", "qualitative", "exact"],
      prize_access_level: ["public", "vip"],
      promotion_category: ["signature", "monthly", "vault"],
      promotion_cta_action: ["open_modal", "scroll_to_form", "route_to_page"],
      promotion_lead_status: ["new", "contacted", "closed", "archived"],
      promotion_status: ["active", "paused", "expired"],
      promotion_type: [
        "cross_bundle",
        "volume_incentive",
        "seasonal",
        "role_based",
        "manual_special",
      ],
      resource_type: [
        "room",
        "office",
        "suite",
        "equipment",
        "provider",
        "amenity",
      ],
      ticket_source: ["spin", "prize", "bonus"],
      voice_vault_content_status: [
        "not_applicable",
        "recording_in_progress",
        "editing_in_progress",
        "payment_active",
        "paid_in_full",
        "rights_released",
      ],
      voice_vault_payment_plan: ["full", "weekly"],
      voice_vault_payment_status: [
        "pending",
        "active_payment",
        "paused_payment",
        "paid_in_full",
        "defaulted",
        "canceled",
        "deposit_paid",
      ],
      voice_vault_product_type: ["hourly", "core_series", "white_glove"],
    },
  },
} as const
