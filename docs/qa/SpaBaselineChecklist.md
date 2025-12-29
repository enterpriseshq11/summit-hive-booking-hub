# Spa Page — Baseline Checklist

**Baseline Date:** 2025-12-29  
**Status:** LOCKED & IMMUTABLE

## Core Requirements

- [x] **Brand lock** — Black background + gold accents only
- [x] **CTA lock** — One CTA per section ("Book Service")
- [x] **Pricing lock** — No pricing numbers or price ranges anywhere in public UI
- [x] **Functional lock** — Hero CTA + service cards scroll to SpaBookingForm
- [x] **Data lock** — SpaBookingForm behavior unchanged
- [x] **Backend lock** — No schema/RLS/edge function changes
- [x] **Mobile lock** — 375px no horizontal overflow, cards stack single-column

## Regression Scan Patterns

The following patterns must NOT appear in Spa public UI (excludes form checkout internals):
- `$` followed by digits
- `/mo`, `/hr`, `/day`, `/week`, `/year`
- `hourly`, `per hour`, `per month`, `per day`, `per week`
- `monthly`, `annual`, `yearly`, `weekly`
- `price`, `prices`, `pricing` (except locked FAQ)
- `cost`, `costs`, `fee`, `fees`, `rate`, `rates` (except in words like "Accelerate")
- `USD`, `dollars`
- `%`, `discount`
- `from` adjacent to digits

## Section Verification

### Hero Section
- [x] Single "Book Service" CTA
- [x] Trust badge: "No obligation. Response within 24 hours."
- [x] Gold brand accent styling

### NextAvailableWidget
- [x] showPrice={false} configured
- [x] Skeleton loading state
- [x] Title: "Next Available Appointments"
- [x] No pricing displayed in any widget state

### Services Section
- [x] 3 service cards (Massage Therapy, Recovery Services, Premium Experiences)
- [x] No pricing numbers on any card
- [x] Outcome-focused taglines and benefits
- [x] Cards clickable → scroll to form
- [x] Single "Book Service" CTA at bottom

### Provider Highlights
- [x] 3 provider cards
- [x] Generic titles (no unverifiable credentials)
- [x] Style-focused descriptions
- [x] No certifications/awards claims

### Process Timeline
- [x] 3 steps vertical layout
- [x] "No obligation" messaging
- [x] "You'll review everything before payment" messaging
- [x] Informational only (no interaction)

### Testimonials
- [x] 2 testimonials
- [x] Service-type badges only
- [x] Generic attribution ("Guest", "Member")
- [x] No verifiable claims

### FAQ
- [x] 5 questions
- [x] Accordion with gold icons
- [x] Pricing FAQ uses EXACT locked copy:
  > "Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required."

### Final CTA
- [x] Single "Book Service" CTA
- [x] Trust reinforcement copy
- [x] No secondary actions

## Accessibility
- [x] Keyboard navigation works
- [x] Gold focus rings visible
- [x] Decorative elements are aria-hidden

## Edge Cases
- [x] NextAvailableWidget showPrice=false prevents pricing display
- [x] Form submission failure → preserve input + error toast
- [x] Mobile layout verified at 375px width

## User-Level Interaction Tests

| Test | Status |
|------|--------|
| Hero CTA scrolls to form | PASS |
| Service cards scroll to form | PASS |
| Form validation shows inline errors | PASS |
| Submit success shows toast | PASS |
| Submit failure preserves input | PASS |

## Notes

- **SpaBookingForm internal pricing:** The form component itself contains pricing logic for checkout, but this is only rendered within the form section after user interaction, not in the public page sections.
- **NextAvailableWidget:** Uses showPrice={false} to prevent any pricing from rendering in the availability widget.

---

**Any changes to this page require explicit written authorization.**
