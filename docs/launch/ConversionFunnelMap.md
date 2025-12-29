# Conversion Funnel Map

> Last updated: 2024-12-29  
> Status: LOCKED for launch

---

## Funnel 1: Spa Booking Flow

**Revenue Type:** Time-based service booking

### Flow
```
Homepage → Booking Hub → Spa Page → Service Selection → Time Selection → Payment
```

| Step | Entry Point | Primary CTA | User Decision | Hesitation Risk | Drop-off Risk |
|------|-------------|-------------|---------------|-----------------|---------------|
| 1 | Homepage Hero | "Book Now" | Commit to exploring | Low | Low |
| 2 | Booking Hub | "View Times" (Spa card) | Choose business type | Medium - choice paralysis | Medium |
| 3 | Spa Page | "Book Service" | Commit to spa | Low | Low |
| 4 | Service Cards | Click service card | Select treatment | Medium - unclear outcomes | Medium |
| 5 | Time Selection | Select slot | Commit to time | High - availability anxiety | High |
| 6 | Checkout | Complete payment | Financial commitment | High - price reveal | Highest |

**Admin Outcome:** Booking appears in Schedule with status `confirmed`. Payment recorded.

---

## Funnel 2: Summit Event Request Flow

**Revenue Type:** High-value event lead → deposit → balance

### Flow
```
Homepage → Summit Page → Event Type → Request Form → Submission → Admin Review
```

| Step | Entry Point | Primary CTA | User Decision | Hesitation Risk | Drop-off Risk |
|------|-------------|-------------|---------------|-----------------|---------------|
| 1 | Homepage | Business card "Plan Your Event" | Interest in events | Low | Low |
| 2 | Summit Hero | "Request Your Event" | Commit to inquiry | Low | Low |
| 3 | Event Types | Click card (scrolls to form) | Define event type | Low | Low |
| 4 | Request Form | "Submit Event Request" | Share details | High - form length | High |
| 5 | Confirmation | N/A | Wait for response | Medium - unclear timeline | N/A |

**Admin Outcome:** Lead created in Leads/Waitlists. Booking created with status `pending`. Visible in Approvals queue.

---

## Funnel 3: Coworking Lease Request Flow

**Revenue Type:** Recurring subscription revenue

### Flow
```
Homepage → Coworking Page → Workspace Selection → Request Form → Submission
```

| Step | Entry Point | Primary CTA | User Decision | Hesitation Risk | Drop-off Risk |
|------|-------------|-------------|---------------|-----------------|---------------|
| 1 | Homepage | Business card "Find Your Space" | Interest in workspace | Low | Low |
| 2 | Coworking Hero | "Request Workspace" | Commit to inquiry | Low | Low |
| 3 | Workspace Cards | Click card (scrolls to form) | Select space type | Medium - unclear capacity | Medium |
| 4 | Lease Form | "Submit Request" | Share business info | High - commitment anxiety | High |

**Admin Outcome:** Lead created in Leads/Waitlists with workspace preferences. No immediate payment.

---

## Funnel 4: Fitness Membership Flow

**Revenue Type:** Recurring membership subscription

### Flow
```
Homepage → Fitness Page → Tier Selection → Membership Form → Stripe Checkout
```

| Step | Entry Point | Primary CTA | User Decision | Hesitation Risk | Drop-off Risk |
|------|-------------|-------------|---------------|-----------------|---------------|
| 1 | Homepage | Business card "Start Membership" | Interest in fitness | Low | Low |
| 2 | Fitness Hero | "Join Now" | Commit to joining | Low | Low |
| 3 | Benefits Section | Scroll to form | Understand value | Medium - unclear pricing | Medium |
| 4 | Membership Form | "Start Membership" | Select tier | High - recurring commitment | High |
| 5 | Stripe Checkout | Complete payment | Financial commitment | High - subscription anxiety | Highest |

**Admin Outcome:** Membership created with status `active`. Stripe subscription ID linked. Waiver signed (if required).

---

## Funnel 5: Gift Cards Purchase Flow

**Revenue Type:** Prepaid value / gift revenue

### Flow
```
Homepage → Gift Cards Page → Denomination Selection → Stripe Checkout
```

| Step | Entry Point | Primary CTA | User Decision | Hesitation Risk | Drop-off Risk |
|------|-------------|-------------|---------------|-----------------|---------------|
| 1 | Homepage | "Give the Gift of Experience" | Gift intent | Low | Low |
| 2 | Gift Cards Page | Select denomination card | Choose amount | Low - clear options | Low |
| 3 | Single CTA | "Purchase $X Gift Card" | Confirm amount | Low | Low |
| 4 | Stripe Checkout | Complete payment | Financial commitment | Medium - standard checkout | Medium |

**Admin Outcome:** Gift card created with code. Payment recorded. No admin approval required.

---

## Cross-Funnel Observations

### Highest Drop-off Risks
1. **Checkout step** (all funnels) - Price visibility + payment commitment
2. **Form submission** (Summit, Coworking) - Form length + unclear next steps
3. **Time selection** (Spa) - Availability anxiety + limited options

### Mitigations Already Implemented
- Trust line: "You'll review everything before payment"
- "Response within 24 hours" badge
- "No obligation" messaging
- Waitlist CTA for fully-booked scenarios
- Clear step indicators in Booking Hub

### Future Optimization Targets
- Form field reduction (analyze which fields are truly required)
- Social proof at checkout (testimonials, trust badges)
- Exit-intent handling (not implemented)
- Abandoned checkout recovery (requires email integration)
