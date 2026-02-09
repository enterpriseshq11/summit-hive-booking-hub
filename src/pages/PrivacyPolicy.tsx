import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Privacy Policy | A-Z Enterprises" description="Privacy Policy for A-Z Enterprises." />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-zinc dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> February 1, 2026</p>
        <p><strong>Business Name:</strong> {SITE_CONFIG.business.name}</p>

        <h2>Information We Collect</h2>
        <p>We collect personal information you voluntarily provide, including your name, email address, phone number, and any message or inquiry details submitted through our website forms.</p>

        <h2>How We Use Your Information</h2>
        <ul>
          <li>To respond to inquiries and service requests</li>
          <li>To send transactional SMS messages related to your inquiry, appointment, or service (only if you opt in)</li>
          <li>To improve our services and website experience</li>
          <li>To communicate important updates about your bookings or services</li>
        </ul>

        <h2>SMS Consent and Messaging</h2>
        <p>If you opt in to receive SMS messages from {SITE_CONFIG.business.name}, we may send transactional messages related to your inquiry, appointment, or service request.</p>
        <ul>
          <li>Message frequency may vary</li>
          <li>Message and data rates may apply</li>
          <li>Reply STOP to opt out at any time</li>
          <li>Reply HELP for assistance</li>
        </ul>
        <p><strong>Your SMS consent information will not be shared with or sold to third parties or affiliates for their marketing purposes.</strong></p>

        <h2>Data Sharing</h2>
        <p>We do not sell, rent, or share your personal information with third parties except as required by law or to fulfill your service request (e.g., payment processors).</p>

        <h2>Data Security</h2>
        <p>We implement reasonable security measures to protect your personal information from unauthorized access, alteration, or disclosure.</p>

        <h2>Your Rights</h2>
        <p>You may request access to, correction of, or deletion of your personal information by contacting us at <a href={SITE_CONFIG.contact.emailLink}>{SITE_CONFIG.contact.email}</a> or <a href={SITE_CONFIG.contact.phoneLink}>{SITE_CONFIG.contact.phoneFormatted}</a>.</p>

        <h2>Contact Us</h2>
        <p>{SITE_CONFIG.business.name}<br />{SITE_CONFIG.location.full}<br />{SITE_CONFIG.contact.phoneFormatted}<br />{SITE_CONFIG.contact.email}</p>

        <div className="mt-8 pt-4 border-t">
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
          {" · "}
          <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}
