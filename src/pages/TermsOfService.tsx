import { SEOHead } from "@/components/seo/SEOHead";
import { SITE_CONFIG } from "@/config/siteConfig";

export default function TermsOfService() {
  return (
    <>
      <SEOHead
        title="Terms of Service | A-Z Enterprises"
        description="Terms of Service for A-Z Enterprises services and website usage."
      />
      <div className="container max-w-3xl py-16 prose prose-sm dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <h2>Agreement to Terms</h2>
        <p>
          By accessing or using the A-Z Enterprises website and services, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.
        </p>

        <h2>Services</h2>
        <p>
          A-Z Enterprises provides event venue rentals (The Summit), coworking spaces (Hive Coworking), wellness services (Restoration Lounge), fitness facilities (A-Z Total Fitness), and related services.
        </p>

        <h2>Bookings and Payments</h2>
        <ul>
          <li>All bookings are subject to availability and confirmation by our team.</li>
          <li>Deposits may be required to secure a booking and are applied toward the total service cost.</li>
          <li>Cancellation and refund policies vary by service. Please review the specific terms provided at booking.</li>
        </ul>

        <h2>SMS Communications</h2>
        <p>
          By opting in to SMS communications, you consent to receive transactional text messages from A-Z Enterprises related to your inquiry, appointment, or service request. Message frequency may vary. Message and data rates may apply. Reply STOP to opt out or HELP for help at any time.
        </p>
        <p>
          Mobile carriers are not liable for delayed or undelivered messages.
        </p>

        <h2>Age Requirement</h2>
        <p>
          You must be at least 18 years old to use this website and to opt in to receive SMS communications.
        </p>

        <h2>User Conduct</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use our services for any unlawful purpose</li>
          <li>Submit false or misleading information</li>
          <li>Interfere with the operation of our website or services</li>
        </ul>

        <h2>Limitation of Liability</h2>
        <p>
          A-Z Enterprises is not liable for any indirect, incidental, or consequential damages arising from your use of our services. Our total liability is limited to the amount you paid for the specific service in question.
        </p>

        <h2>Changes to Terms</h2>
        <p>
          We may update these Terms at any time. Continued use of our services constitutes acceptance of the revised terms.
        </p>

        <h2>Contact Us</h2>
        <p>
          Questions about these Terms? Contact us at:<br />
          {SITE_CONFIG.business.name}<br />
          {SITE_CONFIG.location.full}<br />
          <a href={SITE_CONFIG.contact.emailLink}>{SITE_CONFIG.contact.email}</a><br />
          <a href={SITE_CONFIG.contact.phoneLink}>{SITE_CONFIG.contact.phone}</a>
        </p>
      </div>
    </>
  );
}
