import { MainLayout } from "@/components/layout";
import { Card } from "@/components/ui/card";

const GIVEAWAY_DATE = "March 31, 2026";

export default function DopamineDropTerms() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold mb-2">Dopamine Drop Terms & Conditions</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

          <Card className="p-8 space-y-8">
            {/* Eligibility */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Eligibility</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Participants must be 18 years of age or older.</li>
                <li>A valid account with verified email is required to participate.</li>
                <li>Employees and immediate family members of the company are not eligible.</li>
                <li>Participation is void where prohibited by law.</li>
              </ul>
            </section>

            {/* Login Required */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">2. Login Required</h2>
              <p className="text-muted-foreground">
                All participants must create a free account and be logged in to spin the wheel. 
                This requirement ensures fair play and prevents abuse of the system. 
                Anonymous spins are not permitted.
              </p>
            </section>

            {/* Spin Limits */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">3. Spin Limits</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Free Members:</strong> 1 spin per day</li>
                <li><strong>VIP Members ($2.99/month):</strong> 2 spins per day</li>
                <li>Spins reset at midnight Eastern Time (America/New_York)</li>
                <li>Unused spins do not carry over to the next day</li>
              </ul>
            </section>

            {/* Prizes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Prizes & Caps</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Prizes are subject to daily and weekly caps to ensure availability.</li>
                <li>When a prize reaches its cap, it becomes temporarily unavailable until reset.</li>
                <li>We reserve the right to substitute prizes of equal or greater value.</li>
                <li>Prizes have no cash value and are non-transferable unless otherwise stated.</li>
                <li>Prize values are approximate retail values.</li>
              </ul>
            </section>

            {/* VIP-Only Prizes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">5. VIP-Only Prize Eligibility</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Three (3) prize segments are designated as "VIP-Only".</li>
                <li>Free users may land on VIP segments but cannot claim the prize.</li>
                <li>VIP membership must be active at the time of winning to claim VIP prizes.</li>
                <li>Upgrading to VIP after landing on a VIP segment does not retroactively award the prize.</li>
                <li>VIP membership can be cancelled at any time via the Account page.</li>
              </ul>
            </section>

            {/* Grand Giveaway */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Grand Giveaway</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>Drawing Date:</strong> {GIVEAWAY_DATE}</li>
                <li>Standard Giveaway Entry prize awards 1 ticket to the standard pool.</li>
                <li>VIP Mega Giveaway Entry prize awards 10 tickets to the VIP pool.</li>
                <li>Winners will be selected randomly from each pool.</li>
                <li>Winners will be announced on our website and social media channels.</li>
                <li>Winners must respond within 7 days to claim their prize.</li>
                <li>No purchase is necessary to enter the standard giveaway pool.</li>
              </ul>
            </section>

            {/* Fraud & Disqualification */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Fraud & Disqualification</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>One account per person. Multiple accounts will result in disqualification.</li>
                <li>Automated or scripted entries are prohibited.</li>
                <li>Any attempt to manipulate or exploit the system will result in immediate disqualification.</li>
                <li>We reserve the right to disqualify participants at our sole discretion.</li>
                <li>Disqualified entries will have all associated giveaway tickets voided.</li>
              </ul>
            </section>

            {/* Claiming Prizes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Claiming Prizes</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Prizes must be claimed within 30 days of winning unless otherwise specified.</li>
                <li>A unique claim code will be provided upon successful claim.</li>
                <li>Claim codes are single-use and non-transferable.</li>
                <li>Some prizes may require manual verification before redemption.</li>
                <li>Booking-based prizes must be scheduled through our standard booking system.</li>
              </ul>
            </section>

            {/* Privacy & Consent */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Privacy & Consent</h2>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>By participating, you consent to receive prize-related communications.</li>
                <li>Marketing communications require separate opt-in consent.</li>
                <li>Your data is handled in accordance with our <a href="/privacy" className="text-primary underline">Privacy Policy</a>.</li>
                <li>You may opt out of marketing communications at any time.</li>
              </ul>
            </section>

            {/* Liability */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">10. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                We are not responsible for any technical malfunctions, errors, or issues that may prevent 
                participation or prize fulfillment. By participating, you agree to release and hold harmless 
                the company, its affiliates, employees, and agents from any claims, damages, or liability 
                arising from participation in the Dopamine Drop promotion.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms at any time. Continued participation after 
                changes are posted constitutes acceptance of the modified terms. Material changes will 
                be communicated via email to registered participants.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
              <p className="text-muted-foreground">
                For questions about Dopamine Drop, please contact us at{" "}
                <a href="mailto:support@example.com" className="text-primary underline">
                  support@example.com
                </a>
                .
              </p>
            </section>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}