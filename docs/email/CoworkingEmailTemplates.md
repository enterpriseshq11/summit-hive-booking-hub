# Coworking Email Templates – Locked Specification

> **Last Updated:** January 16, 2026  
> **Status:** PRODUCTION LOCKED  
> **Owner:** Dylan (approval), Dev (implementation)

---

## Overview

All coworking inquiry notifications are sent via the `send-inquiry-notification` Edge Function using Resend. Two email types exist:

1. **User Confirmation** – Sent to the person who submitted the inquiry
2. **Staff Notification** – Sent to `info@az-enterprises.com`

---

## User Confirmation Email

**Subject:** `We Received Your Workspace Inquiry – The Hive by A-Z`

**From:** `The Hive by A-Z <onboarding@resend.dev>` (production: use verified domain)

### Template Content

```
Thank you, [First Name]!

We've received your workspace inquiry and a member of our team will be in touch within 24 hours.

**What happens next:**
1. Our team reviews your requirements
2. We'll reach out to schedule a consultation or tour
3. You'll receive a personalized proposal – no obligation

**Your Request Summary:**
- 🏢 Workspace Type: [workspace_type]
- 📅 Timeline: [move_in_timeframe]
- 👥 Seats Needed: [seats_needed]
- 🏛️ Company: [company_name]

Questions in the meantime? Reply to this email or call us at (567) 379-6340.

We look forward to helping you find your perfect workspace!

Best regards,
The Hive Team
A-Z Enterprises
```

**Footer:**
```
The Hive by A-Z | Wapakoneta, Ohio
Open 7 days a week, 6:00 AM – 10:00 PM
```

---

## Staff Notification Email

**Subject:** `[New Lead] [Inquiry Type Emoji + Label] from [First Name] [Last Name]`

Example subjects:
- `[New Lead] 📋 Workspace Request from Jordan Mitchell`
- `[New Lead] 🏢 Tour Request from Sarah Chen`
- `[New Lead] ⏳ Waitlist Signup from Mike Brown`
- `[New Lead] ❓ General Question from Lisa Park`

**From:** `The Hive by A-Z <onboarding@resend.dev>`

**To:** `info@az-enterprises.com`

### Template Content

```
[Priority Badge: Inquiry Type]
New Lead Alert – The Hive

Response expected within 24 hours

| Field            | Value                |
|------------------|----------------------|
| Name             | [First Name] [Last Name] |
| Email            | [email with mailto link] |
| Phone            | [phone with tel link]    |
| Company          | [company_name]           |
| Workspace Type   | [workspace_type]         |
| Timeline         | [move_in_timeframe]      |
| Seats Needed     | [seats_needed]           |
| Meeting Rooms    | ✅ Yes / ❌ No           |
| Business Address | ✅ Yes / ❌ No           |

**Message:** (if provided)
[message content in highlighted box]

View and manage this lead in the Admin Dashboard:
https://summit-hive-booking-hub.lovable.app/#/admin/office-inquiries
```

---

## Inquiry Type Labels

| Type      | Emoji | Label              |
|-----------|-------|--------------------|
| request   | 📋    | Workspace Request  |
| tour      | 🏢    | Tour Request       |
| waitlist  | ⏳    | Waitlist Signup    |
| question  | ❓    | General Question   |

---

## Brand Guidelines

### Colors (HTML Hex Values)
- **Primary Black:** `#0a0a0a`
- **Accent Gold:** `#d4af37`
- **Text:** `#1a1a1a`
- **Muted:** `#666666`
- **Highlight Box Background:** `#f8f6f0`

### Typography
- Font Family: Arial, sans-serif
- Line Height: 1.6
- Max Width: 600px

### Trust Language (Required)
- "within 24 hours" – Response promise
- "no obligation" – No pressure messaging
- "You'll review everything before payment" – Transparency

---

## Validation Rules

- All emails must send within 5 seconds of inquiry submission
- Both emails fire in parallel (fire-and-forget)
- Email failures are logged but do not block UI success message
- User always sees success toast regardless of email delivery status

---

## Future Enhancements (Post-Launch)

1. Move from `onboarding@resend.dev` to verified `@thehive-az.com` domain
2. Add unsubscribe link for marketing compliance
3. Consider HTML email builder for admin-editable templates
