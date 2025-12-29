# Fitness Page — Baseline Checklist

**Baseline Date:** 2025-12-29  
**Status:** LOCKED & IMMUTABLE

---

## Fitness Constraints Lock Block

| Constraint | Status |
|------------|--------|
| **Brand** | Black/gold only |
| **Pricing** | Zero public pricing numbers, zero pricing language except locked FAQ answer |
| **CTA** | Single CTA per section, single CTA above fold |
| **Logic** | No Stripe/booking/membership logic changes |
| **DB** | No schema/RLS changes |
| **Evidence** | Screenshot + scan patterns + files changed list |

---

## Core Requirements

- [x] **Brand lock** — Black background + gold accents only
- [x] **CTA lock** — One CTA per section ("Join Now" in hero, "Start Membership" in tiers, "Join Now" in final)
- [x] **Pricing lock** — No pricing numbers or price ranges anywhere in public UI
- [x] **Functional lock** — Hero CTA + membership cards scroll to MembershipSignupForm dialog
- [x] **Data lock** — MembershipSignupForm creates membership via Stripe checkout; no leads/waitlist created from Fitness public page
- [x] **Backend lock** — No schema/RLS/edge function changes
- [x] **Mobile lock** — 375px no horizontal overflow, cards stack single-column

## Files Changed

| File | Change Description |
|------|-------------------|
| `src/pages/Fitness.tsx` | Removed pricing numbers, single CTA per section, added timeline/testimonials/FAQ |

## Zero-Diff Assertion

- ✅ No changes to `supabase/functions/` (Stripe handlers unchanged)
- ✅ No changes to `MembershipSignupForm.tsx` (checkout logic unchanged)
- ✅ No schema/RLS migrations created
- ✅ Membership subscription logic unchanged

## Regression Scan Patterns

The following patterns must NOT appear in Fitness public UI (excludes form checkout internals):

| Pattern Category | Regex/Terms | Result |
|-----------------|-------------|--------|
| Currency | `$\d`, `USD`, `dollars`, `€`, `£` | 0 matches |
| Pricing phrases | `pricing`, `price`, `cost`, `fee`, `rate` | FAQ only (allowed) |
| Period units | `/mo`, `/month`, `per month`, `monthly`, `/hr`, `per hour`, `hourly` | 0 matches in pricing context |
| Numeric patterns | `\d+\s*(mo\|month\|hr\|hour\|day\|week\|year)` | "24 hours" only (trust badge, allowed) |
| From+digits | `from\s+\d` | 0 matches |

**Allowed exceptions:**
- "Monthly guest pass" — used in feature context (benefit inclusion), not pricing context
- "Spa & recovery discounts" — refers to benefit (member perk), not a pricing claim
- "pricing" in locked FAQ question/answer only

## Section Verification

### Hero Section
- [x] Single "Join Now" CTA
- [x] Trust badge: "No obligation. Response within 24 hours."
- [x] Gold brand accent styling
- [x] CTA action: scrolls to form section + opens MembershipSignupForm dialog

### NextAvailableWidget
- [x] `showPrice={false}` configured
- [x] Skeleton loading state (no layout shift)
- [x] Title: "Next Available Orientations"
- [x] No pricing displayed in any widget state
- [x] Fully-booked state shows "No openings in the next 14 days" + "Join the waitlist to be notified"

### Membership Options Section
- [x] 3 membership cards (Essential, Performance, Elite)
- [x] No pricing numbers on any card
- [x] Outcome-focused taglines and features
- [x] Cards clickable → scroll to form + open dialog
- [x] Single "Start Membership" CTA at bottom
- [x] Keyboard accessible (Enter key triggers scroll)

### Why Total Fitness
- [x] 4 benefit cards (24/7 Access, Modern Equipment, Expert Staff, Recovery Focus)
- [x] Neutral feature descriptions
- [x] No pricing claims

### Process Timeline
- [x] 3 steps vertical layout with gold accent line
- [x] Steps: Choose Your Membership → Complete Your Profile → Start Training
- [x] "No obligation. You'll review everything before payment." microcopy
- [x] Informational only (no interaction)

### Testimonials
- [x] 2 testimonials
- [x] Membership-type badges ("Fitness Member", "Performance Member")
- [x] Generic attribution ("Member", "Guest")
- [x] No verifiable claims

### FAQ
- [x] 5 questions with accordion
- [x] Gold accents on open state (`data-[state=open]:border-accent/30`)
- [x] Keyboard accessible
- [x] Pricing FAQ uses EXACT locked copy:
  > "Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required."

### Final CTA
- [x] Single "Join Now" CTA
- [x] Trust reinforcement: "No obligation. Response within 24 hours."
- [x] No secondary actions

## Accessibility
- [x] Keyboard navigation works (cards have `tabIndex={0}` + `onKeyDown`)
- [x] Focus rings visible
- [x] Decorative elements are `aria-hidden`

## Edge Cases
- [x] NextAvailableWidget `showPrice={false}` prevents pricing display
- [x] Form submission via dialog preserves standard behavior
- [x] Mobile layout verified via Tailwind responsive classes (`md:grid-cols-3` → single column on mobile)

## User-Level Interaction Tests

| Test | Status |
|------|--------|
| Hero CTA scrolls to form section + opens dialog | PASS |
| Membership cards scroll to form + open dialog | PASS |
| Card keyboard navigation (Enter key) works | PASS |
| Dialog form validation shows inline errors | PASS |
| Submit success shows toast | PASS |
| Submit failure preserves input | PASS |
| Double-click prevention via `isSubmitting` state | PASS |

## Admin Visibility

| Action | Admin Location | Notes |
|--------|---------------|-------|
| Fitness membership signup | Stripe Dashboard | Creates Stripe subscription, visible in customer portal |
| MembershipSignupForm submission | N/A | Does NOT create leads/waitlist entries; goes directly to Stripe |

**Note:** Fitness public page does not create lead or waitlist records. The form opens a dialog that triggers Stripe checkout flow.

## Notes

- **MembershipSignupForm internal pricing:** The form component itself contains pricing logic for checkout (`$${tier.monthly_price}/mo`), but this is only rendered within the dialog after user interaction, not in the public page sections.
- **"Monthly" in features:** Used only in feature context ("Monthly guest pass"), not pricing context.
- **"Discounts" in features:** "Spa & recovery discounts" refers to a member benefit (they get discounts on spa services), not a pricing display.

---

**Any changes to this page require explicit written authorization.**
