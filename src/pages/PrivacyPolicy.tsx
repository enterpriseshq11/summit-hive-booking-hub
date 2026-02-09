import { SEOHead } from "@/components/seo/SEOHead";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function PrivacyPolicy() {
  return (
    <>
      <SEOHead
        title="Privacy Policy | A-Z Enterprises"
        description="Privacy Policy for A-Z Enterprises. Learn how we collect, use, and protect your personal information."
      />
      <div className="container max-w-3xl py-16 prose prose-sm dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <h2>Who We Are</h2>
        <p>
          A-Z Enterprises ("we," "us," or "our") operates The Summit, Hive Coworking, Restoration Lounge, A-Z Total Fitness, and related services in {SITE_CONFIG.location.city}, {SITE_CONFIG.location.state}.
        </p>

        <h2>Information We Collect</h2>
        <p>We may collect the following information when you use our website or submit forms:</p>
        <ul>
          <li>Name, email address, and phone number</li>
          <li>Service preferences and booking details</li>
          <li>Payment information (processed securely via third-party payment processors)</li>
          <li>Usage data and cookies for website analytics</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To respond to inquiries and service requests</li>
          <li>To process bookings and appointments</li>
          <li>To send transactional SMS messages (only with your explicit consent)</li>
          <li>To improve our services and website experience</li>
        </ul>

        <h2>SMS/Text Messaging</h2>
        <p>
          If you opt in to receive SMS messages from A-Z Enterprises, we may send transactional messages related to your inquiry, appointment, or service request. Message frequency may vary. Message and data rates may apply. You can opt out at any time by replying STOP, or reply HELP for assistance.
        </p>
        <p className="font-semibold">
          Your SMS consent is not shared with any third parties or affiliates for marketing or promotional purposes. We do not sell, rent, or share your consent to receive text messages with any outside organization.
        </p>

        <h2>Data Sharing</h2>
        <p>
          We do not sell your personal information. We may share limited information with service providers who help us operate our business (e.g., payment processors, scheduling platforms), but only as necessary to fulfill your requests.
        </p>

        <h2>Data Security</h2>
        <p>
          We use industry-standard security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2>Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by contacting us at{" "}
          <a href={SITE_CONFIG.contact.emailLink}>{SITE_CONFIG.contact.email}</a> or{" "}
          <a href={SITE_CONFIG.contact.phoneLink}>{SITE_CONFIG.contact.phone}</a>.
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, contact us at:<br />
          {SITE_CONFIG.business.name}<br />
          {SITE_CONFIG.location.full}<br />
          <a href={SITE_CONFIG.contact.emailLink}>{SITE_CONFIG.contact.email}</a><br />
          <a href={SITE_CONFIG.contact.phoneLink}>{SITE_CONFIG.contact.phone}</a>
        </p>
      </div>
    </>
  );
}
