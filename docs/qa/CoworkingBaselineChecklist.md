# Coworking Page — Baseline Checklist

**Baseline Date:** 2025-12-29  
**Status:** LOCKED & IMMUTABLE

## Core Requirements

- [x] **Brand lock** — Black background + gold accents only
- [x] **CTA lock** — One CTA per section ("Request Workspace")
- [x] **Pricing lock** — No pricing numbers or price ranges anywhere in UI
- [x] **Functional lock** — Hero CTA + cards scroll to LeaseSignupForm
- [x] **Data lock** — LeaseSignupForm behavior unchanged
- [x] **Backend lock** — No schema/RLS/edge function changes
- [x] **Mobile lock** — 375px no horizontal overflow, cards stack single-column

## Regression Scan Patterns

The following patterns must NOT appear in Coworking UI:
- `$` followed by digits
- `/mo`, `/hr`, `/day`, `/week`, `/year`
- `hourly`, `per hour`, `per month`, `per day`, `per week`
- `monthly`, `annual`, `yearly`, `weekly`
- `price`, `prices`, `pricing` (except locked FAQ)
- `cost`, `costs`, `fee`, `fees`, `rate`, `rates`
- `USD`, `dollars`
- `%`, `discount`
- `from` adjacent to digits

## Section Verification

### Hero Section
- [x] Single "Request Workspace" CTA
- [x] Trust badge: "No obligation. Response within 24 hours."
- [x] Amenities strip with Lucide icons (no emojis)
- [x] NextAvailableWidget with skeleton loading state

### Workspace Options
- [x] 3 workspace cards (Private Office, Dedicated Desk, Day Pass)
- [x] No pricing numbers on any card
- [x] Outcome-focused taglines and benefits
- [x] Cards clickable → scroll to form
- [x] Single "Request Workspace" CTA at bottom

### Why The Hive
- [x] 4 benefit cards (Flexibility, Community, Productivity, Convenience)
- [x] Lucide icons with gold accents
- [x] No numeric claims

### Process Timeline
- [x] 3 steps vertical layout
- [x] "No obligation to proceed" messaging
- [x] "You'll review everything before payment" messaging
- [x] Informational only (no interaction)

### Testimonials
- [x] 2 testimonials
- [x] Workspace-type badges only
- [x] Generic names (Jordan M., Member)
- [x] No verifiable claims

### FAQ
- [x] 4 questions
- [x] Accordion with gold icons
- [x] Pricing FAQ uses EXACT locked copy:
  > "Pricing varies based on workspace type and selected services. You'll receive a personalized proposal after consultation—no commitment required."

### Final CTA
- [x] Single "Request Workspace" CTA
- [x] Trust reinforcement copy
- [x] No secondary actions

## Accessibility
- [x] Keyboard navigation works
- [x] Gold focus rings visible
- [x] Decorative elements are aria-hidden

## Edge Cases
- [x] Availability widget error → neutral fallback + Retry
- [x] Form submission failure → preserve input + error toast
- [x] Mobile layout verified at 375px width

## User-Level Interaction Tests

| Test | Status |
|------|--------|
| Hero CTA scrolls to form | PASS |
| Workspace cards scroll to form | PASS |
| Form validation shows inline errors | PASS |
| Submit success shows toast | PASS |
| Submit failure preserves input | PASS |

---

**Any changes to this page require explicit written authorization.**
