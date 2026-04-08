/**
 * HAIR BY HANNAH — /beauty-haven/hair
 * Zero GlossGenius references. Zero nail content. Hannah's page entirely.
 */
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Camera, Scissors, Phone, Mail, ExternalLink, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const hannahSpecialties = ["Vivid Color", "Balayage", "Full Highlights", "Creative Color", "All-Over Color"];

const hairServices = [
  {
    category: "Color Services",
    items: [
      { name: "All Over Color", price: "$100" },
      { name: "Root Refresh", price: "$80" },
      { name: "Root Add-On", price: "$50" },
      { name: "Freestyle Natural Color", price: "$200" },
      { name: "Freestyle Vivid Color", price: "$200" },
      { name: "Balayage with Toner", price: "$180" },
      { name: "Balayage with Custom Base + Toner", price: "$250" },
      { name: "Full Highlight", price: "$150" },
      { name: "Partial Highlight", price: "$100" },
      { name: "Mini Highlight and Toner", price: "$80" },
      { name: "Toner", price: "$40" },
      { name: "Matrix Full Color Remover", price: "$100" },
    ],
  },
  {
    category: "Treatments",
    items: [
      { name: "Malibu Detox Treatment", price: "$45" },
      { name: "Malibu Ultimate Conditioning Treatment", price: "$45" },
      { name: "Malibu Color Remover", price: "$45" },
      { name: "Added Bowl (if needed)", price: "$15" },
      { name: "Take Home Colored Conditioner Add-On", price: "$20" },
    ],
  },
  {
    category: "Cuts & Styles",
    items: [
      { name: "Hair Cut", price: "$30" },
      { name: "Hair Cut, Wash & Style Out", price: "$50" },
      { name: "Silk Press", price: "$40" },
      { name: "Style Out", price: "$40" },
      { name: "Spiral Perm", price: "$125" },
    ],
  },
  {
    category: "Lashes",
    items: [
      { name: "Lashes Classic", price: "$70" },
      { name: "Lashes Color Add-On", price: "$15" },
    ],
  },
];

function PinkLabel({ children }: { children: React.ReactNode }) {
  return <span className="hmbh-label">{children}</span>;
}

function SectionHeadline({ children }: { children: React.ReactNode }) {
  return <h2 className="hmbh-headline">{children}</h2>;
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("hmbh-badge", className)}>{children}</span>;
}

function CheckerDivider() {
  return <div className="hmbh-divider-check" aria-hidden="true" />;
}

export default function BeautyHavenHair() {
  return (
    <div className="hmbh-page">
      <SEOHead
        title="Hair by Hannah | Beauty Haven | A-Z Enterprises"
        description="Hair color services by Hannah Collins at High Maintenance Beauty Haven. Vivid color, balayage, highlights, and more. Appointment only."
        canonicalPath="/beauty-haven/hair"
      />

      {/* ═══ BREADCRUMB ═══ */}
      <div className="hmbh-section !pb-0 !pt-6">
        <div className="hmbh-container">
          <Link to="/beauty-haven" className="inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-[#FF0099] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Beauty Haven
          </Link>
        </div>
      </div>

      {/* ═══ PAGE HEADER ═══ */}
      <section className="hmbh-section !pt-6">
        <div className="hmbh-container">
          <div className="grid lg:grid-cols-[1fr_2fr] gap-8 items-start">
            {/* Photo */}
            <div className="hmbh-photo-placeholder border border-dashed border-[#FF0099]/35 rounded-xl">
              <Camera className="w-8 h-8 text-[#FF0099]/40" />
              <span className="text-sm text-white/40">[INSERT PHOTO — Hannah Collins]</span>
            </div>
            {/* Info */}
            <div>
              <PinkLabel>Hair Services</PinkLabel>
              <h1 className="hmbh-hero-title !text-[clamp(2rem,4vw,3.5rem)]">Hannah Collins</h1>
              <p className="hmbh-card-title mb-4">Professional Hair Colorist</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {hannahSpecialties.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
              <p className="hmbh-body text-sm max-w-2xl">
                Hannah is a professional colorist and vivid hair specialist based in St. Marys, Ohio, bringing bold transformations to life inside A-Z Enterprises.
                With a passion for creative color and a signature cheetah print cape in every after shot, she brings personality and precision to every appointment.
                When she's not behind the chair, you'll find her river walking with her five-year-old daughter.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm text-white/75">
                <a href="tel:5678251546" className="flex items-center gap-2 hover:text-[#FF0099] transition-colors"><Phone className="w-3.5 h-3.5 text-[#FF0099]" /> 567-825-1546</a>
                <a href="mailto:hannah@a-zenterpriseshq.com" className="flex items-center gap-2 hover:text-[#FF0099] transition-colors"><Mail className="w-3.5 h-3.5 text-[#FF0099]" /> hannah@a-zenterpriseshq.com</a>
                <span className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-[#FF0099]" /> @highmaintenancebeautyhavenllc</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ HAIR SERVICES MENU ═══ */}
      <section id="hair-services" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Hannah Collins</PinkLabel>
          <SectionHeadline>Hair Services</SectionHeadline>
          <p className="hmbh-body italic text-sm mb-8">Appointments by contact only — call, text, or DM to schedule.</p>

          {hairServices.map((cat) => (
            <div key={cat.category}>
              <div className="hmbh-category-header">{cat.category}</div>
              <table className="hmbh-service-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((s) => (
                    <tr key={s.name}>
                      <td className="text-white">{s.name}</td>
                      <td className="text-right text-white font-bold whitespace-nowrap">{s.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Booking callout */}
          <div className="hmbh-card mt-10 border-l-[3px] border-l-[#FF0099]">
            <div className="p-6">
              <p className="text-white font-bold mb-2">Ready to transform?</p>
              <p className="hmbh-body text-sm">Call or text Hannah at 567-825-1546 or DM @highmaintenancebeautyhavenllc to book.</p>
              <a href="tel:5678251546" className="hmbh-btn-secondary mt-4 inline-block">Contact Hannah</a>
            </div>
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ HAIR PORTFOLIO ═══ */}
      <section id="hair-portfolio" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>The Work</PinkLabel>
          <SectionHeadline>Hair Portfolio</SectionHeadline>
          <p className="hmbh-body italic text-sm text-center mb-8">
            Before and afters posted regularly. Follow @highmaintenancebeautyhavenllc for the latest looks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={`hair-${i}`} className="hmbh-gallery-tile">
                <div className="hmbh-gallery-placeholder border border-dashed border-[#FF0099]/35">
                  <Scissors className="w-6 h-6 text-[#FF0099]/30" />
                  <span className="text-xs text-white/30 text-center px-4">
                    Hannah's hair portfolio coming soon.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ POLICIES ═══ */}
      <section id="hair-policies" className="hmbh-section">
        <div className="hmbh-container hmbh-container--narrow">
          <PinkLabel>Policies & Booking</PinkLabel>
          <SectionHeadline>Before You Book</SectionHeadline>

          <div className="hmbh-card p-6 mt-8">
            <div className="hmbh-category-header">Hair by Hannah</div>
            <p className="hmbh-body text-sm mb-4">Book by phone, text, or DM.</p>
            <div className="space-y-1 text-sm text-white/75 mb-4">
              <p><span className="text-white/45">Phone / Text:</span> 567-825-1546</p>
              <p><span className="text-white/45">Email:</span> hannah@a-zenterpriseshq.com</p>
              <p><span className="text-white/45">Social:</span> @highmaintenancebeautyhavenllc</p>
            </div>
            <p className="text-sm text-white/75 mb-6">
              <span className="text-white/45">Hours:</span> Tues – Sat, 9 AM to 9 PM<br />Appointment only.
            </p>

            <div className="hmbh-policy-header">Deposit Policy</div>
            <p className="hmbh-body text-sm mb-4">
              A deposit is required to hold your appointment. Deposit amount is based on service total. Starting deposit: $50.
              All deposits are non-refundable. Deposits transfer to rescheduled appointments with 5+ days advance notice.
              Rescheduled deposits are valid for 3 months.
            </p>

            <div className="hmbh-policy-header">No-Show Policy</div>
            <p className="hmbh-body text-sm mb-6">
              No-shows forfeit their deposit in full. Repeat no-shows will not be rebooked.
            </p>

            <a href="tel:5678251546" className="hmbh-btn-secondary w-full text-center block">Contact Hannah to Book</a>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE FAB — simplified for Hannah ═══ */}
      <div className="hmbh-fab-container lg:hidden">
        <a
          href="tel:5678251546"
          className="hmbh-fab-main"
          aria-label="Contact Hannah to Book"
        >
          <Phone className="w-5 h-5" />
          <span className="ml-1 text-sm font-bold">Contact Hannah</span>
        </a>
      </div>
    </div>
  );
}
