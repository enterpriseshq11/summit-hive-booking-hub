import type { Database } from "@/integrations/supabase/types";

// Core type aliases from database
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];
export type Business = Database["public"]["Tables"]["businesses"]["Row"];
export type BookableType = Database["public"]["Tables"]["bookable_types"]["Row"];
export type Resource = Database["public"]["Tables"]["resources"]["Row"];
export type Provider = Database["public"]["Tables"]["providers"]["Row"];
export type Package = Database["public"]["Tables"]["packages"]["Row"];
export type Addon = Database["public"]["Tables"]["addons"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingResource = Database["public"]["Tables"]["booking_resources"]["Row"];
export type BookingAddon = Database["public"]["Tables"]["booking_addons"]["Row"];
export type SlotHold = Database["public"]["Tables"]["slot_holds"]["Row"];
export type Payment = Database["public"]["Tables"]["payments"]["Row"];
export type PaymentSchedule = Database["public"]["Tables"]["payment_schedules"]["Row"];
export type MembershipTier = Database["public"]["Tables"]["membership_tiers"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
export type MembershipBenefit = Database["public"]["Tables"]["membership_benefits"]["Row"];
export type DocumentTemplate = Database["public"]["Tables"]["document_templates"]["Row"];
export type SignedDocument = Database["public"]["Tables"]["signed_documents"]["Row"];
export type GiftCard = Database["public"]["Tables"]["gift_cards"]["Row"];
export type CustomerWallet = Database["public"]["Tables"]["customer_wallets"]["Row"];
export type WalletTransaction = Database["public"]["Tables"]["wallet_transactions"]["Row"];
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"];
export type Review = Database["public"]["Tables"]["reviews"]["Row"];
export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type WaitlistEntry = Database["public"]["Tables"]["waitlist_entries"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type Checklist = Database["public"]["Tables"]["checklists"]["Row"];
export type ChecklistTemplate = Database["public"]["Tables"]["checklist_templates"]["Row"];
export type AuditLog = Database["public"]["Tables"]["audit_log"]["Row"];
export type Assumption = Database["public"]["Tables"]["assumptions"]["Row"];
export type AvailabilityWindow = Database["public"]["Tables"]["availability_windows"]["Row"];
export type BlackoutDate = Database["public"]["Tables"]["blackout_dates"]["Row"];
export type PricingRule = Database["public"]["Tables"]["pricing_rules"]["Row"];
export type ProviderSchedule = Database["public"]["Tables"]["provider_schedules"]["Row"];
export type GuestPass = Database["public"]["Tables"]["guest_passes"]["Row"];
export type Referral = Database["public"]["Tables"]["referrals"]["Row"];
export type ResourceBookableType = Database["public"]["Tables"]["resource_bookable_types"]["Row"];

// Enums
export type AppRole = Database["public"]["Enums"]["app_role"];
export type BusinessType = Database["public"]["Enums"]["business_type"];
export type BookingMode = Database["public"]["Enums"]["booking_mode"];
export type BookingStatus = Database["public"]["Enums"]["booking_status"];
export type ResourceType = Database["public"]["Enums"]["resource_type"];
export type DocumentType = Database["public"]["Enums"]["document_type"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type MembershipStatus = Database["public"]["Enums"]["membership_status"];
export type LeadStatus = Database["public"]["Enums"]["lead_status"];
export type NotificationChannel = Database["public"]["Enums"]["notification_channel"];
export type PricingModifierType = Database["public"]["Enums"]["pricing_modifier_type"];
export type AddonPricingMode = Database["public"]["Enums"]["addon_pricing_mode"];

// UI-specific types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
}

export interface BusinessCard {
  id: string;
  name: string;
  slug: string;
  type: BusinessType;
  tagline: string | null;
  nextAvailable?: string;
  startingPrice?: number;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  available: boolean;
  resourceId: string;
  providerId?: string;
  price?: number;
  label?: string;
}

export interface PriceBreakdown {
  basePrice: number;
  addons: { name: string; price: number; quantity: number }[];
  discounts: { name: string; amount: number }[];
  subtotal: number;
  tax: number;
  total: number;
  depositRequired?: number;
  balanceDue?: number;
  balanceDueDate?: string;
}

export interface BookingFormData {
  bookableTypeId: string;
  packageId?: string;
  resourceId?: string;
  providerId?: string;
  startDatetime: string;
  endDatetime: string;
  guestCount?: number;
  addons: { addonId: string; quantity: number }[];
  notes?: string;
  promoCode?: string;
  giftCardCode?: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  profile?: Profile;
  roles?: AppRole[];
  isStaff: boolean;
  isAdmin: boolean;
}
