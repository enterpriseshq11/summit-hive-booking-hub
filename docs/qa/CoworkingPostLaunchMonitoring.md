# Coworking Post-Launch Monitoring Plan

> **Window:** First 72 hours after go-live  
> **Owner:** Dev + Dylan  
> **Escalation:** Slack channel #az-coworking-launch

---

## Hour 0-4: Critical Validation

### Immediate Actions
1. **Submit test inquiry** from public page (incognito browser)
   - Confirm success toast appears
   - Check user confirmation email arrives
   - Check staff notification email arrives at `info@az-enterprises.com`
   - Verify inquiry appears in `/admin/office-inquiries`

2. **Verify Edge Function**
   - Check Supabase Edge Function logs for `send-inquiry-notification`
   - No 500 errors
   - Response times under 5 seconds

3. **Console Hygiene**
   - No red errors on `/coworking`
   - No red errors on `/coworking/offices`
   - No red errors on `/coworking/offices/[any-slug]`

### Success Criteria
- ✅ Test inquiry flows end-to-end
- ✅ Both emails delivered
- ✅ Admin sees inquiry with correct data

---

## Hour 4-24: Steady State Monitoring

### Check Every 4 Hours
- [ ] New inquiries appearing in admin?
- [ ] Any failed email logs in Supabase?
- [ ] Analytics events firing? (check console in dev tools)

### Watch For
- **Email Bounce:** Check Resend dashboard for bounces
- **RLS Block:** If inquiries not saving, check `office_inquiries` policies
- **Slow Loads:** If page slow, check network waterfall for blocking requests

### Metrics to Track
| Metric | Target | Check Method |
|--------|--------|--------------|
| Inquiry submissions | >0 | Admin dashboard |
| Email delivery rate | 100% | Resend dashboard |
| Page load time | <3s | Lighthouse |
| Console errors | 0 | Browser dev tools |

---

## Hour 24-72: Optimization Window

### Review Analytics
- How many `coworking_inquiry_submitted` events?
- Click-through on "Request Workspace" vs "Schedule Tour"?
- Any `coworking_inquiry_email_failed` events?

### Gather Feedback
- Any user complaints about confirmation not arriving?
- Staff feedback on notification format?
- Mobile usability issues?

### Hotfix Protocol
If critical issue found:
1. Document issue with screenshot
2. Check if it's blocking conversions
3. If yes → immediate fix
4. If no → add to post-launch backlog

---

## Escalation Matrix

| Issue | Severity | Action |
|-------|----------|--------|
| Inquiry form broken | Critical | Immediate fix, notify Dylan |
| Emails not sending | Critical | Check RESEND_API_KEY, restart function |
| Admin dashboard 500 | High | Check Supabase logs, RLS policies |
| Styling broken | Medium | Fix within 24 hours |
| Analytics not firing | Low | Fix within 48 hours |

---

## Post-72 Hour Handoff

After stabilization window:
1. Move from "Monitoring" to "Maintenance" mode
2. Weekly email delivery report
3. Monthly analytics review
4. Transfer knowledge to operations playbook

---

## Quick Reference

| Resource | Location |
|----------|----------|
| Edge Function Logs | Lovable Cloud → Backend → Edge Functions |
| Resend Dashboard | https://resend.com/emails |
| Admin Inquiries | /admin/office-inquiries |
| Analytics Console | Browser DevTools → Console (search "[Analytics]") |
| Email Templates Doc | docs/email/CoworkingEmailTemplates.md |
