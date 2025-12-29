# Global Navigation Checklist

**Components**: Header, Footer, MainLayout  
**Status**: VERIFIED & LOCKED  
**Last Verified**: 2025-01-15

---

## 1. Header Navigation

### Desktop Nav Items
| Label | Route | Icon | Status |
|-------|-------|------|--------|
| Book Now | /booking | CalendarDays | ✅ VALID |
| Summit | /summit | Building2 | ✅ VALID |
| Coworking | /coworking | Building2 | ✅ VALID |
| Spa | /spa | Sparkles | ✅ VALID |
| Fitness | /fitness | Dumbbell | ✅ VALID |
| Gift Cards | /gift-cards | Gift | ✅ VALID |

### Auth Section
| State | Element | Route | Status |
|-------|---------|-------|--------|
| Logged Out | Login Button | /login | ✅ VALID |
| Logged In | Account Dropdown | - | ✅ VALID |
| Logged In | My Account | /account | ✅ VALID |
| Staff | Admin Console | /admin | ✅ VALID |

### Mobile Navigation
- Hamburger menu toggles on small screens ✅
- Same nav items as desktop ✅
- Menu closes on link click ✅

---

## 2. Footer Navigation

### Our Businesses
| Label | Route | Status |
|-------|-------|--------|
| The Summit | /summit | ✅ VALID |
| Hive Coworking | /coworking | ✅ VALID |
| Restoration Lounge | /spa | ✅ VALID |
| Total Fitness | /fitness | ✅ VALID |

### Get Started
| Label | Route | Status |
|-------|-------|--------|
| Book Now | /booking | ✅ VALID |
| Gift Cards | /gift-cards | ✅ VALID |
| My Account | /account | ✅ VALID |

### Contact Information
- Location: Wapakoneta, Ohio ✅
- Phone: (419) 555-0100 ✅
- Email: hello@az-enterprises.com ✅

---

## 3. Removed Placeholder Links

The following placeholder links were removed as they pointed to non-existent pages:

- `/memberships` - Removed (membership info on /fitness)
- `/about` - Removed (no page exists)
- `/contact` - Removed (contact info in footer)
- `/careers` - Removed (no page exists)
- `/privacy` - Removed (no page exists)
- `/terms` - Removed (no page exists)
- `/accessibility` - Removed (no page exists)

**Note**: If these pages are needed in the future, they must be created before adding footer links.

---

## 4. MainLayout Verification

| Feature | Status |
|---------|--------|
| Skip to content link | ✅ PASS |
| Header renders | ✅ PASS |
| Footer renders | ✅ PASS |
| Main content has role="main" | ✅ PASS |
| Outlet for nested routes | ✅ PASS |

---

## 5. Brand Compliance

| Requirement | Status |
|-------------|--------|
| Header: Black background (bg-primary) | ✅ PASS |
| Header: Gold accent on active links | ✅ PASS |
| Footer: Black background (bg-primary) | ✅ PASS |
| Footer: Gold accent on section headers | ✅ PASS |
| No off-brand colors | ✅ PASS |

---

## 6. CTA Compliance

| Check | Status |
|-------|--------|
| Single primary CTA in header (Book Now) | ✅ PASS |
| No duplicate CTAs between header/footer | ✅ PASS |
| Login button style distinct from nav | ✅ PASS |

---

## 7. Accessibility

| Requirement | Status |
|-------------|--------|
| Skip link for keyboard users | ✅ PASS |
| Focus states visible | ✅ PASS |
| Active route indication | ✅ PASS |
| Mobile menu keyboard accessible | ✅ PASS |

---

## 8. Mobile/Desktop Parity

| Feature | Desktop | Mobile | Status |
|---------|---------|--------|--------|
| All nav links accessible | ✅ | ✅ | PASS |
| Login/Account visible | ✅ | ✅ | PASS |
| Footer columns stack | 4-col | 1-col | PASS |
| No horizontal overflow | ✅ | ✅ | PASS |

---

## 9. Regression Guard

Before any future navigation changes:

- [ ] All links point to existing routes
- [ ] No placeholder links added
- [ ] Single primary CTA maintained
- [ ] Black & Gold palette enforced
- [ ] Mobile menu tested
