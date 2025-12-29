# Trust Language Lock

> Last updated: 2024-12-29  
> Status: FROZEN — No variations permitted

This document defines the exact trust phrases used site-wide and their approved locations. Any future copy changes must reference this document to prevent drift.

---

## Core Trust Phrases

### 1. "You'll review everything before payment."

**Exact phrasing:** `You'll review everything before payment.`

**Locations:**
| Page | Component | Context |
|------|-----------|---------|
| Booking Hub | Hero section | Below subtext, accent color |
| Homepage | How It Works section | Step 3 description (implied) |

**Variants:** NONE PERMITTED

---

### 2. "Response within 24 hours"

**Exact phrasing:** `Response within 24 hours`

**Locations:**
| Page | Component | Context |
|------|-----------|---------|
| Summit | Hero badge | Next to primary CTA |
| Coworking | Hero badge | Next to primary CTA |
| Spa | Hero badge | Next to primary CTA |

**Variants:** 
- "Our team will review your request and respond within 24-48 hours" (EventRequestForm footer only)

---

### 3. "No obligation"

**Exact phrasing:** `No obligation` or `No obligation to proceed`

**Locations:**
| Page | Component | Context |
|------|-----------|---------|
| Summit | Process timeline section | After step list, before CTA |
| Coworking | Process timeline section | After step list, before CTA |
| Spa | Process timeline section | After step list, before CTA |

**Variants:** NONE PERMITTED

---

### 4. "Secure Checkout"

**Exact phrasing:** `Secure Checkout`

**Locations:**
| Page | Component | Context |
|------|-----------|---------|
| Homepage | Proof chips | Hero section |
| Booking Hub | Process section | Card title |
| Gift Cards | Trust section | Badge/card |

**Variants:** 
- "All transactions are encrypted and securely processed" (expanded form in Booking Hub)

---

### 5. "Live availability" / "Real-Time Availability"

**Exact phrasing:** 
- `Live availability` (LiveAvailabilityIndicator success state)
- `Real-Time Availability` (Homepage proof chips)

**Locations:**
| Page | Component | Context |
|------|-----------|---------|
| Booking Hub | LiveAvailabilityIndicator | Badge in hero |
| Homepage | Proof chips | Hero section |

**Variants:** 
- "Checking live availability…" (loading state only)
- "See Real-Time Availability" (How It Works step)

---

## Pricing Language Lock

### Approved Pricing Phrases

| Phrase | Permitted Locations |
|--------|---------------------|
| "Pricing varies by experience" | Homepage business cards |
| "Pricing varies based on event type, guest count, and selected services. You'll receive a personalized proposal after consultation—no commitment required." | Summit FAQ |
| "Pricing varies based on workspace type, lease term, and included amenities. You'll receive a personalized proposal—no commitment required." | Coworking FAQ |
| "Pricing varies based on services and session length. You'll see your total before confirming—no surprises." | Spa FAQ |
| "Membership pricing varies. Contact us for current rates and available plans." | Fitness FAQ |

### Prohibited Patterns

- Any numeric pricing (`$99`, `$199/mo`, etc.) on public pages
- "Starting at" language
- "From $X" language
- Comparative pricing ("Save $X", "X% off")
- Urgency pricing ("Limited time", "Today only")

**Exception:** Gift Cards page displays static denominations ($25, $50, $100, $150, $200) as this is transactional, not promotional.

---

## CTA Verb Lock

| Intent | Approved Verb | Not Permitted |
|--------|---------------|---------------|
| Lead generation (events, leases) | "Request" | "Book", "Reserve", "Get" |
| Time-based booking | "Book" | "Request", "Schedule" |
| Membership signup | "Join" | "Subscribe", "Start" |
| Gift card purchase | "Purchase" | "Buy", "Get" |
| Waitlist | "Join Waitlist" | "Notify Me", "Add Me" |

---

## Empty State Language Lock

| State | Approved Copy | Tone |
|-------|---------------|------|
| No bookings | "No upcoming bookings" | Neutral |
| No memberships | "You don't have an active membership" | Neutral, with CTA |
| No payments | "No outstanding balances" + "You're all caught up!" | Positive |
| No documents | "No pending documents" + "You're all set!" | Positive |
| Fully booked | "No openings in the next X days" + "Join the waitlist to be notified" | Action-oriented |

---

## Error Message Tone Guidelines

### Approved Patterns
- "Unable to [action]" (calm)
- "Temporarily unavailable" (non-blaming)
- "Please try again" (action-oriented)

### Flagged for Review (Not Changed)
- "Failed to join waitlist" → Consider: "Unable to complete request"
- "Failed to submit request" → Consider: "Unable to submit request"

### Never Use
- "Error occurred"
- "Something went wrong" (without context)
- "Oops!"
- Technical error codes
- Blaming language

---

## Enforcement

1. All copy changes must be reviewed against this document
2. New trust phrases require explicit approval and documentation here
3. Variations of locked phrases are prohibited without authorization
4. This document is the single source of truth for trust language
