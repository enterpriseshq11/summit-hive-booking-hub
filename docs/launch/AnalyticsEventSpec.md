# Analytics Event Specification

> Last updated: 2024-12-29  
> Status: SPECIFICATION ONLY — No implementation

This document defines the analytics events to be instrumented once an analytics platform is approved.

---

## Event Naming Convention

```
[category]_[action]_[optional_detail]
```

Examples:
- `cta_click_hero_book_now`
- `booking_step_completed`
- `checkout_initiated`

---

## CTA Click Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `cta_click_hero_book_now` | User clicks "Book Now" in homepage hero | Homepage | Primary conversion entry |
| `cta_click_business_card` | User clicks any business card CTA | Homepage, Booking Hub | Business selection |
| `cta_click_request_event` | User clicks "Request Your Event" | Summit | Event lead intent |
| `cta_click_request_workspace` | User clicks "Request Workspace" | Coworking | Lease lead intent |
| `cta_click_book_service` | User clicks "Book Service" | Spa | Spa booking intent |
| `cta_click_join_now` | User clicks "Join Now" | Fitness | Membership intent |
| `cta_click_gift_card_select` | User selects a gift card denomination | Gift Cards | Purchase intent |
| `cta_click_gift_card_purchase` | User clicks "Purchase $X Gift Card" | Gift Cards | Checkout intent |

---

## Booking Funnel Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `booking_step_1_viewed` | User lands on Booking Hub | Booking Hub | Funnel entry |
| `booking_step_2_business_selected` | User clicks "View Times" on business | Booking Hub | Business choice |
| `booking_step_3_service_selected` | User selects package/service | Business pages | Service commitment |
| `booking_step_4_time_selected` | User selects available time slot | Business pages | Time commitment |
| `booking_review_viewed` | User sees booking summary/review | Checkout | Pre-payment |
| `booking_completed` | Booking successfully created | Confirmation | Revenue event |
| `booking_failed` | Booking creation failed | Any | Error tracking |

---

## Checkout Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `checkout_initiated` | User begins Stripe checkout | Any with payment | Payment intent |
| `checkout_completed` | Stripe payment successful | Return from Stripe | Revenue confirmed |
| `checkout_cancelled` | User returns without completing | Return from Stripe | Abandonment |
| `checkout_failed` | Payment processing error | Return from Stripe | Revenue loss |

---

## Lead & Waitlist Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `event_request_submitted` | EventRequestForm submitted | Summit | High-value lead |
| `lease_request_submitted` | LeaseSignupForm submitted | Coworking | Recurring revenue lead |
| `waitlist_joined` | WaitlistCTA form submitted | Any with waitlist | Future booking intent |
| `waitlist_modal_opened` | User opens waitlist modal | Any with waitlist | Interest signal |

---

## Membership Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `membership_form_viewed` | User scrolls to membership form | Fitness | Interest signal |
| `membership_tier_selected` | User selects membership tier | Fitness | Tier preference |
| `membership_checkout_initiated` | User begins membership checkout | Fitness | Subscription intent |
| `membership_activated` | Membership created successfully | Fitness | MRR event |

---

## Error & Recovery Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `availability_load_failed` | API error loading availability | Booking Hub, business pages | UX degradation |
| `availability_retry_clicked` | User clicks retry button | Booking Hub, business pages | Recovery attempt |
| `form_validation_failed` | Form submission blocked by validation | Any form | UX friction |

---

## Page View Events

| Event Name | Trigger Condition | Page(s) | Business Impact |
|------------|-------------------|---------|-----------------|
| `page_view_homepage` | User lands on homepage | Homepage | Traffic baseline |
| `page_view_booking_hub` | User lands on Booking Hub | Booking Hub | Intent signal |
| `page_view_summit` | User lands on Summit | Summit | Event interest |
| `page_view_coworking` | User lands on Coworking | Coworking | Workspace interest |
| `page_view_spa` | User lands on Spa | Spa | Wellness interest |
| `page_view_fitness` | User lands on Fitness | Fitness | Membership interest |
| `page_view_gift_cards` | User lands on Gift Cards | Gift Cards | Gift intent |
| `page_view_account` | User lands on Account | Account | Retention signal |

---

## Priority Tiers for Implementation

### Tier 1 — Launch Critical (Week 1)
- `checkout_completed`
- `checkout_cancelled`
- `event_request_submitted`
- `membership_activated`
- `booking_completed`

### Tier 2 — Conversion Optimization (Week 2-4)
- All CTA click events
- Booking step progression events
- Waitlist events

### Tier 3 — UX & Error Monitoring (Month 2+)
- Error and recovery events
- Form validation events
- Page view events

---

## Recommended Platforms (No Implementation Yet)

| Platform | Strengths | Considerations |
|----------|-----------|----------------|
| Plausible | Privacy-first, lightweight | Limited event customization |
| PostHog | Full-featured, self-hostable | Complexity |
| Mixpanel | Strong funnels, retention | Cost at scale |
| Google Analytics 4 | Free, industry standard | Privacy concerns, learning curve |
