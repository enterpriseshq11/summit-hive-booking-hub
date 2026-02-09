import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import { Link } from "react-router-dom";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      <SEOHead title="Terms of Service | A-Z Enterprises" description="Terms of Service for A-Z Enterprises." />
      <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-zinc dark:prose-invert">
        <h1>Terms of Service</h1>
        <p><strong>Effective Date:</strong> February 1, 2026</p>
        <p><strong>Business Name:</strong> {SITE_CONFIG.business.name}</p>

        <h2>Acceptance of Terms</h2>
        <p>By using this website or submitting any form, you agree to these Terms of Service and our <Link to="/privacy">Privacy Policy</Link>.</p>

        <h2>Services</h2>
        <p>{SITE_CONFIG.business.name} operates multiple service divisions including coworking spaces, fitness facilities, event venue rentals, spa services, and related offerings. Specific terms for each service are provided at the time of booking.</p>

        <h2>User Responsibilities</h2>
        <ul>
          <li>Provide accurate and truthful information when submitting forms or booking services</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Not misuse our services or website</li>
        </ul>

        <h2>SMS Communications</h2>
        <p>By opting in to SMS communications, you agree to receive transactional messages from {SITE_CONFIG.business.name}. You may opt out at any time by replying STOP. Standard message and data rates may apply.</p>

        <h2>Limitation of Liability</h2>
        <p>{SITE_CONFIG.business.name} is not liable for any indirect, incidental, or consequential damages arising from the use of our website or services.</p>

        <h2>Changes to Terms</h2>
        <p>We reserve the right to update these terms at any time. Changes will be posted on this page with an updated effective date.</p>

        <h2>Contact Us</h2>
        <p>{SITE_CONFIG.business.name}<br />{SITE_CONFIG.location.full}<br />{SITE_CONFIG.contact.phoneFormatted}<br />{SITE_CONFIG.contact.email}</p>

        <div className="mt-8 pt-4 border-t">
          <Link to="/" className="text-primary hover:underline">Back to Home</Link>
          {" · "}
          <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
}
