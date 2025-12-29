# Account Page Baseline Checklist

**Page**: `/account`  
**Status**: LOCKED & BASELINED  
**Last Verified**: 2025-01-15

---

## 1. Brand Lock

| Requirement | Status | Notes |
|-------------|--------|-------|
| Black & Gold palette only | ✅ PASS | Utility-first design |
| Active tabs use gold (`accent`) | ✅ PASS | Consistent tab styling |
| No marketing visuals | ✅ PASS | Calm, organized layout |
| No glow effects or animations | ✅ PASS | Professional utility |

---

## 2. CTA Lock

| Tab | CTA Label | Location | Status |
|-----|-----------|----------|--------|
| Bookings | "New Booking" | Header | ✅ PASS |
| Bookings (empty) | "Events", "Spa", "Fitness" | Guidance links | ✅ PASS |
| Wallet | "Redeem Gift Card" | Card | ✅ PASS |
| Membership (empty) | "Explore Membership" | Card | ✅ PASS |

**Rule**: No competing CTAs. Empty states provide gentle guidance, not pressure.

---

## 3. Pricing Lock

| Requirement | Status | Notes |
|-------------|--------|-------|
| No pricing numbers on page | ✅ PASS | Except wallet balance |
| Wallet balance display | ✅ ALLOWED | User's own balance |
| No tier pricing | ✅ PASS | Links to /fitness |
| No promotional language | ✅ PASS | Utility only |

---

## 4. Empty State Lock

All empty states must follow this pattern:

| Component | Icon | Message | Guidance | Status |
|-----------|------|---------|----------|--------|
| Upcoming Bookings | CalendarDays (accent) | "No upcoming bookings" | Links to business pages | ✅ PASS |
| Past Bookings | Clock (muted) | "No past bookings" | Explanatory text | ✅ PASS |
| Outstanding Balances | Sparkles (green) | "No outstanding balances" | "You're all caught up!" | ✅ PASS |
| Payment History | CreditCard (muted) | "No payment history" | Explanatory text | ✅ PASS |
| Pending Documents | Sparkles (green) | "No pending documents" | "You're all set!" | ✅ PASS |
| Signed Documents | FileText (muted) | "No signed documents" | Explanatory text | ✅ PASS |
| Membership | Users (accent) | "No active membership" | CTA to /fitness | ✅ PASS |

---

## 5. Functional Lock

| Action | Behavior | Status |
|--------|----------|--------|
| Tab navigation | Switches content, preserves URL | ✅ PASS |
| "New Booking" click | Navigates to /book | ✅ PASS |
| Business links (Events/Spa/Fitness) | Navigate to respective pages | ✅ PASS |
| "Redeem Gift Card" click | Navigates to /gift-cards | ✅ PASS |
| "Explore Membership" click | Navigates to /fitness | ✅ PASS |
| "Edit Profile" click | Placeholder (no action) | ✅ PASS |

---

## 6. Data Lock

| Requirement | Status | Notes |
|-------------|--------|-------|
| Reads from authUser context | ✅ PASS | Profile data |
| No data mutations on load | ✅ PASS | Read-only display |
| No new DB queries added | ✅ PASS | Uses existing hooks |

---

## 7. Backend Lock

| Requirement | Status |
|-------------|--------|
| No schema changes | ✅ PASS |
| No RLS changes | ✅ PASS |
| No edge function changes | ✅ PASS |
| No new API calls | ✅ PASS |

---

## 8. Mobile Lock

| Requirement | Status |
|-------------|--------|
| Tab bar scrollable on mobile | ✅ PASS |
| Cards stack single-column | ✅ PASS |
| Profile fields stack on small screens | ✅ PASS |
| No horizontal overflow | ✅ PASS |
| Empty state icons scale appropriately | ✅ PASS |

---

## 9. Accessibility Lock

| Requirement | Status |
|-------------|--------|
| Tab triggers are keyboard accessible | ✅ PASS |
| Active tab has visible state | ✅ PASS |
| Links have clear labels | ✅ PASS |
| Color contrast meets WCAG AA | ✅ PASS |

---

## 10. Scan Patterns (Regression Guard)

Run these scans before any future Account page changes:

### Disallowed Patterns (must return 0 matches):
- `/\$\d+\.\d{2}/` - No pricing (except wallet balance)
- `/discount/i` - No discount language
- `/promo/i` - No promotional language
- `/limited\s*time/i` - No urgency
- `/upgrade\s*now/i` - No aggressive upsells

### Allowed Patterns:
- `/\$0\.00/` - Zero wallet balance display
- `/\$[\d,]+\.\d{2}/` - Actual user wallet balance

---

## 11. Tab Structure

1. **Bookings**: Upcoming + Past bookings with guided empty states
2. **Payments**: Outstanding balances + Payment history
3. **Documents**: Pending signatures + Signed documents
4. **Wallet**: Balance display + Gift card redemption
5. **Membership**: Current membership or CTA to join
6. **Settings**: Profile info + Notification preferences

---

## 12. Regression Checklist

Before any future changes, verify:

- [ ] No pricing exposed (except wallet balance)
- [ ] Empty states provide gentle guidance
- [ ] No competing CTAs in same section
- [ ] Tab navigation works correctly
- [ ] Mobile layout stacks properly
- [ ] Gold accent only on active elements
- [ ] No backend changes
