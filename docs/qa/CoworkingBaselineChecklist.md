# Coworking Page — Baseline Checklist

**Baseline Date:** 2025-12-29  
**Status:** LOCKED & IMMUTABLE

## Core Requirements

- [ ] **No pricing numbers** — No $, currency symbols, /mo, /hr, or numeric pricing anywhere in UI
- [ ] **Single CTA per section** — "Request Workspace" only, no competing actions
- [ ] **Black & Gold only** — No teal, blue, purple, cyan accents
- [ ] **No schema/Stripe changes** — Database and payment logic unchanged
- [ ] **Scroll-to-form behavior intact** — All CTAs and cards scroll to LeaseSignupForm section
- [ ] **Mobile no overflow at 375px** — No horizontal scroll, cards stack single-column

## Section Verification

### Hero Section
- [ ] Single "Request Workspace" CTA
- [ ] Trust badge: "No obligation. Response within 24 hours."
- [ ] Amenities strip with Lucide icons (no emojis)
- [ ] NextAvailableWidget with skeleton loading state

### Workspace Options
- [ ] 3 workspace cards (Private Office, Dedicated Desk, Day Pass)
- [ ] No pricing numbers on any card
- [ ] Outcome-focused taglines and benefits
- [ ] Cards clickable → scroll to form
- [ ] Single "Request Workspace" CTA at bottom

### Why The Hive
- [ ] 4 benefit cards (Flexibility, Community, Productivity, Convenience)
- [ ] Lucide icons with gold accents
- [ ] No numeric claims

### Process Timeline
- [ ] 3 steps vertical layout
- [ ] "No obligation to proceed" messaging
- [ ] "You'll review everything before payment" messaging
- [ ] Informational only (no interaction)

### Testimonials
- [ ] 2 testimonials
- [ ] Workspace-type badges only
- [ ] Generic names (Jordan M., Member)
- [ ] No verifiable claims

### FAQ
- [ ] 4 questions
- [ ] Accordion with gold icons
- [ ] Pricing FAQ uses EXACT locked copy:
  > "Pricing varies based on workspace type and selected services. You'll receive a personalized proposal after consultation—no commitment required."

### Final CTA
- [ ] Single "Request Workspace" CTA
- [ ] Trust reinforcement copy
- [ ] No secondary actions

## Accessibility
- [ ] Keyboard navigation works
- [ ] Gold focus rings visible
- [ ] Decorative elements are aria-hidden

## Edge Cases
- [ ] Availability widget error → neutral fallback + Retry
- [ ] Form submission failure → preserve input + error toast
- [ ] Mobile layout verified at 375px width

---

**Any changes to this page require explicit written authorization.**
