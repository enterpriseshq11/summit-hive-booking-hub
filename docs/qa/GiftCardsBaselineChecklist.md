# Gift Cards Baseline Checklist

**Page**: `/gift-cards`  
**Status**: LOCKED & BASELINED  
**Last Verified**: 2025-01-15

---

## 1. Brand Lock

| Requirement | Status | Notes |
|-------------|--------|-------|
| Black & Gold palette only | ✅ PASS | No off-brand colors |
| Primary background sections use `bg-primary` | ✅ PASS | Hero uses primary |
| Accent color is gold (`accent` token) | ✅ PASS | All CTAs and highlights |
| No teal/cyan/other accent colors | ✅ PASS | Verified |

---

## 2. CTA Lock

| Section | CTA Label | Count | Status |
|---------|-----------|-------|--------|
| Hero | "Select Your Gift Card" | 1 | ✅ PASS |
| Gift Card Selection | "Purchase $X Gift Card" | 1 | ✅ PASS |
| Final CTA | "Select Your Gift Card" | 1 | ✅ PASS |

**Rule**: Single CTA per section. Cards are selectable (click to select) but have no individual CTAs.

---

## 3. Pricing Lock

**Exception**: Gift Cards are transactional products. Pricing ($50, $100, $200, $500) is ALLOWED and displayed.

| Requirement | Status | Notes |
|-------------|--------|-------|
| Pricing visible for product selection | ✅ ALLOWED | Transactional page |
| No discount language | ✅ PASS | No "% off", "promo", etc. |
| No urgency language | ✅ PASS | No "limited time", "hurry", etc. |
| No "Most Popular" pricing tier badge | ✅ PASS | Removed |
| Trust copy present | ✅ PASS | "You'll review before payment" |

---

## 4. Functional Lock

| Action | Behavior | Status |
|--------|----------|--------|
| Hero CTA click | Scrolls to gift card selection section | ✅ PASS |
| Card click | Selects amount (visual indicator) | ✅ PASS |
| Section CTA click | Proceeds to checkout (with selected amount) | ✅ PASS |
| Final CTA click | Scrolls back to selection | ✅ PASS |
| CTA disabled state | Disabled until amount selected | ✅ PASS |

---

## 5. Data Lock

| Requirement | Status | Notes |
|-------------|--------|-------|
| No leads created on public page | ✅ PASS | Direct checkout only |
| No waitlist entries | ✅ PASS | N/A for gift cards |
| Stripe checkout unchanged | ✅ PASS | No logic modifications |

---

## 6. Backend Lock

| Requirement | Status |
|-------------|--------|
| No schema changes | ✅ PASS |
| No RLS changes | ✅ PASS |
| No edge function changes | ✅ PASS |
| No new tables | ✅ PASS |

---

## 7. Mobile Lock

| Requirement | Status |
|-------------|--------|
| Cards stack single-column on mobile | ✅ PASS |
| Hero CTA visible without scroll | ✅ PASS |
| Process steps stack vertically | ✅ PASS |
| No horizontal overflow | ✅ PASS |
| Trust section stacks on small screens | ✅ PASS |

---

## 8. Scan Patterns (Regression Guard)

Run these scans before any future Gift Cards changes:

### Disallowed Patterns (must return 0 matches in public UI):
- `/discount/i` - No discount language
- `/promo/i` - No promotional language
- `/limited\s*time/i` - No urgency
- `/hurry/i` - No urgency
- `/save\s*\d/i` - No savings claims
- `/%\s*off/i` - No percentage discounts

### Allowed Patterns:
- `/\$\d+/` - Price amounts (ALLOWED for gift cards)

---

## 9. Section Structure

1. **Hero**: Black & gold, single CTA, trust messaging
2. **Gift Card Selection**: 4 selectable cards, single bottom CTA
3. **Redeem Anywhere**: 4 location cards (no CTAs)
4. **How It Works**: 3-step process with icons
5. **Trust Section**: 3 trust indicators
6. **Final CTA**: Single CTA + supportive copy
7. **Terms**: Legal footnote

---

## 10. Regression Checklist

Before any future changes, verify:

- [ ] Single CTA per section
- [ ] No discount/promo language added
- [ ] No urgency language added
- [ ] Black & gold palette maintained
- [ ] Mobile layout stacks correctly
- [ ] Card selection state works
- [ ] Stripe checkout logic unchanged
