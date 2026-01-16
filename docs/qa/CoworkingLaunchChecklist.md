# Coworking Launch Readiness Checklist

> **Last Updated:** January 16, 2026  
> **Status:** PRE-LAUNCH  
> **Owner:** Dylan (approval), Dev (implementation)

---

## ✅ Core Functionality

### Email Notification System
- [x] Edge function `send-inquiry-notification` deployed
- [x] User confirmation email sends on inquiry submission
- [x] Staff notification email sends to `info@az-enterprises.com`
- [x] Email templates follow brand guidelines (Black & Gold)
- [x] Phone number `(567) 379-6340` in user confirmation
- [x] Admin dashboard link in staff notification
- [x] Fire-and-forget pattern (no UI blocking)
- [x] Error logging for failed emails

### Inquiry Management (Admin)
- [x] Status workflow: new → contacted → scheduled → completed → closed
- [x] Internal notes field with save functionality
- [x] Filtering by status and inquiry type
- [x] Stats dashboard (Total, New, Contacted, Scheduled, Completed)
- [x] Inquiry detail modal with all fields
- [x] Contact links (mailto, tel) functional

### Analytics Tracking
- [x] `coworking_inquiry_submitted` event fires on form submission
- [x] `coworking_inquiry_emails_sent` event fires on successful email dispatch
- [x] `coworking_inquiry_email_failed` event fires on email failure
- [x] `hive_request_workspace_click` CTA tracking
- [x] `hive_schedule_tour_click` CTA tracking
- [x] Custom event listener for programmatic analytics

---

## ✅ Public Pages

### /coworking Landing Page
- [x] Hero with "Request Workspace" primary CTA
- [x] "Schedule a Tour" secondary CTA
- [x] Trust chips (No obligation, 24hr response, No payment until confirmed)
- [x] Workspace options (Private Office, Dedicated Desk, Day Pass)
- [x] Why The Hive benefits section
- [x] Amenities accordion
- [x] Process timeline (3 steps)
- [x] Testimonials with verified badges
- [x] FAQ section (5 questions)
- [x] CoworkingAnchorChips for section navigation
- [x] Mobile sticky CTA
- [x] ScrollToTopButton

### /coworking/offices Hub
- [x] Office listing grid with status badges
- [x] Filter by floor/type
- [x] Featured offices highlighted
- [x] Pricing display respects visibility settings

### /coworking/offices/:slug Detail Pages
- [x] Photo gallery with lightbox
- [x] Office specs (floor, sq ft, capacity)
- [x] Amenities list
- [x] Status-aware CTAs
- [x] Promotion banner (if active)
- [x] OfficeInquiryModal integration
- [x] Trust signals in sidebar

---

## ⚠️ SEO & Accessibility

### Meta Tags
- [x] Coworking page has descriptive H1
- [ ] Add `<title>` and `<meta description>` via Helmet
- [ ] Add Open Graph tags for social sharing
- [ ] Add JSON-LD structured data (LocalBusiness)

### Accessibility
- [x] Keyboard navigation on workspace cards
- [x] Focus rings on interactive elements
- [x] aria-hidden on decorative icons
- [ ] Screen reader testing pass
- [ ] Color contrast verification (WCAG AA)

---

## ⚠️ Performance

### Mobile
- [ ] Lighthouse mobile score ≥ 90
- [ ] Load time under 3 seconds on 4G
- [x] Responsive layout verified
- [x] Touch targets ≥ 44px

### Images
- [ ] Office photos optimized (WebP with fallback)
- [x] Lazy loading on gallery thumbnails
- [x] Alt text on all images

---

## 🔲 Post-Launch Monitoring (First 72 Hours)

### Success Criteria
- [ ] Zero failed inquiry submissions
- [ ] All emails deliver successfully (check Resend dashboard)
- [ ] Admin dashboard shows all new inquiries
- [ ] No console errors on public pages
- [ ] Analytics events firing correctly

### Monitoring Actions
- [ ] Check Supabase Edge Function logs every 4 hours
- [ ] Review Resend delivery reports daily
- [ ] Verify inquiry → email → admin pipeline end-to-end
- [ ] Monitor for any 500 errors in network logs

### Escalation
- If email delivery fails: Check RESEND_API_KEY secret
- If inquiries not appearing: Check RLS policies on office_inquiries
- If analytics not firing: Verify initDataEventTracking called in main.tsx

---

## Sign-Off

| Stakeholder | Status | Date |
|-------------|--------|------|
| Dev Complete | ✅ | Jan 16, 2026 |
| Dylan Review | 🔲 Pending | — |
| QA Pass | 🔲 Pending | — |
| Go Live | 🔲 Pending | — |

---

## Notes

- Email sender domain is `onboarding@resend.dev` (Resend sandbox). Production should use verified domain.
- Analytics events currently log to console in dev mode. Ready for Posthog/GA4 integration.
- All pricing follows "qualitative" mode unless Dylan enables exact pricing per office.
