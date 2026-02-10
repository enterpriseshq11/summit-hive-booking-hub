

## Specials Claim System -- Making Specials Actually Work

### The Problem
Right now, when a visitor clicks a special's CTA button, it either navigates to a page or does nothing (if `cta_link` is null). There is no claim mechanism, no promo code auto-application, and no lead capture.

### The Solution
Add two claim paths depending on the special type, plus fix broken CTAs.

---

### 1. Add New Fields to the `specials` Table

| Field | Type | Purpose |
|-------|------|---------|
| `action_type` | text | Either `route` (navigate somewhere), `promo_code` (auto-apply a code), or `request_form` (open a lead capture form) |
| `promo_code` | text (nullable) | The code to auto-apply (e.g., `BOGOMASSAGE`) |

This lets admins define what happens when someone "claims" a special.

---

### 2. Three Claim Behaviors

**A) `route` -- Navigate to a page**
Same as today. CTA clicks navigate to the `cta_link`. Used for specials like "Learn More" that point to `/promotions`.

**B) `promo_code` -- Auto-apply a promo code**
When the user clicks "Claim," the system:
- Stores the promo code in sessionStorage
- Navigates to the booking page (`cta_link`)
- The booking/checkout form reads sessionStorage and pre-fills the promo code field
- Shows a toast: "Promo code BOGOMASSAGE applied!"

**C) `request_form` -- Open a lead capture form**
For specials with no direct booking path (like Summit event specials or Voice Vault packages):
- Clicking the CTA opens an inline "Claim This Special" form right in the modal
- Fields: Name, Phone, Email, optional Message
- Submits to a `special_claims` table
- Shows confirmation: "We received your request. We will contact you within 1 business day."

---

### 3. New `special_claims` Table

Tracks every claim for lead follow-up:
- `id`, `special_id`, `name`, `email`, `phone`, `message`, `created_at`
- RLS: public insert (anonymous visitors can submit), admin read

---

### 4. Admin Specials Editor Updates

Add to the special creation/edit form:
- **Action Type** dropdown: Route / Promo Code / Request Form
- **Promo Code** field (shown only when action type is "promo_code")
- The existing `cta_link` field stays for route-based specials

---

### 5. Fix Null CTA Links

Update all specials currently in the database with `cta_link: null` to use the `request_form` action type, so clicking the CTA actually does something useful.

---

### 6. Checkout Integration (for promo code specials)

Update the booking/checkout flows to check sessionStorage for a pre-applied promo code on page load and auto-fill it.

---

### Technical Summary

**Files to create:**
- `src/components/specials/SpecialClaimForm.tsx` -- inline lead capture form

**Files to modify:**
- `src/hooks/useSpecials.ts` -- add `action_type` and `promo_code` to the Special type
- `src/components/specials/SpecialsModal.tsx` -- handle three action types, show claim form inline
- `src/pages/admin/Specials.tsx` -- add action_type/promo_code fields to editor
- Booking pages (Lindsey, experience checkout) -- read promo code from sessionStorage

**Database changes:**
- Add `action_type` and `promo_code` columns to `specials` table
- Create `special_claims` table with public insert + admin read RLS

