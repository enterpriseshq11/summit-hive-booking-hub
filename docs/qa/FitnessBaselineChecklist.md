# Fitness Page — Baseline Checklist

**Baseline Date:** 2025-12-29  
**Status:** LOCKED & IMMUTABLE

## Core Requirements

- [x] **Brand lock** — Black background + gold accents only
- [x] **CTA lock** — One CTA per section ("Join Now")
- [x] **Pricing lock** — No pricing numbers or price ranges anywhere in public UI
- [x] **Functional lock** — Hero CTA + membership cards scroll to MembershipSignupForm
- [x] **Data lock** — MembershipSignupForm behavior unchanged
- [x] **Backend lock** — No schema/RLS/edge function changes
- [x] **Mobile lock** — 375px no horizontal overflow, cards stack single-column

## Regression Scan Patterns

The following patterns must NOT appear in Fitness public UI (excludes form checkout internals):
- `$` followed by digits
- `/mo`, `/hr`, `/day`, `/week`, `/year`
- `hourly`, `per hour`, `per month`, `per day`, `per week`
- `price`, `prices`, `pricing` (except locked FAQ)
- `cost`, `costs`, `fee`, `fees`, `rate`, `rates`
- `USD`, `dollars`
- `%`, `discount`
- `from` adjacent to digits

**Allowed exceptions:**
- "monthly" in feature descriptions (e.g., "Monthly guest pass") — not pricing context

## Section Verification

### Hero Section
- [x] Single "Join Now" CTA
- [x] Trust badge: "No obligation. Response within 24 hours."
- [x] Gold brand accent styling

### NextAvailableWidget
- [x] showPrice={false} configured
- [x] Skeleton loading state
- [x] Title: "Next Available Orientations"
- [x] No pricing displayed in any widget state

### Membership Options Section
- [x] 3 membership cards (Essential, Performance, Elite)
- [x] No pricing numbers on any card
- [x] Outcome-focused taglines and features
- [x] Cards clickable → scroll to form
- [x] Single "Start Membership" CTA at bottom

### Why Total Fitness
- [x] 4 benefit cards
- [x] Neutral feature descriptions
- [x] No pricing claims

### Process Timeline
- [x] 3 steps vertical layout
- [x] "No obligation" messaging
- [x] "You'll review everything before payment" messaging
- [x] Informational only (no interaction)

### Testimonials
- [x] 2 testimonials
- [x] Membership-type badges only
- [x] Generic attribution ("Member", "Guest")
- [x] No verifiable claims

### FAQ
- [x] 5 questions
- [x] Accordion with gold accents
- [x] Pricing FAQ uses EXACT locked copy:
  > "Pricing varies based on service type, appointment length, and selected enhancements. You'll review everything before payment—no commitment required."

### Final CTA
- [x] Single "Join Now" CTA
- [x] Trust reinforcement copy
- [x] No secondary actions

## Accessibility
- [x] Keyboard navigation works
- [x] Focus rings visible
- [x] Decorative elements are aria-hidden

## Edge Cases
- [x] NextAvailableWidget showPrice=false prevents pricing display
- [x] Form submission failure → preserve input + error toast
- [x] Mobile layout verified via Tailwind responsive classes

## User-Level Interaction Tests

| Test | Status |
|------|--------|
| Hero CTA scrolls to form section | PASS |
| Membership cards scroll to form | PASS |
| Form validation shows inline errors | PASS |
| Submit success shows toast | PASS |
| Submit failure preserves input | PASS |

## Notes

- **MembershipSignupForm internal pricing:** The form component itself contains pricing logic for checkout, but this is only rendered within the form section after user interaction, not in the public page sections.
- **"Monthly" in features:** Used only in feature context ("Monthly guest pass"), not pricing context.

---

**Any changes to this page require explicit written authorization.**
