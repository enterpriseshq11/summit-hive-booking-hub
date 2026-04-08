/**
 * HIGH MAINTENANCE BEAUTY HAVEN — /beauty-haven
 *
 * OPEN ITEMS (pending from team):
 * 1. Hannah Collins bio photo — upload to Beauty Haven Google Drive folder and replace placeholder in team card
 * 2. Desiree Brogaard bio photo — same
 * 3. Hannah hair before/after photos — 3 gallery slots built and waiting, upload to Google Drive Beauty Haven folder
 * 4. Nail portfolio images from GlossGenius — 9 slots built, images need to be exported and uploaded
 * 5. Hannah's Square booking URL — once generated, add as additional option alongside phone/email (do NOT replace contact routing)
 * 6. Facebook reviews — Hannah and Desiree to provide 3-5 review texts each; populate reviews section and remove empty state
 * 7. Hannah's deposit exact tiers — confirm whether threshold is services under $125 or flat $50; update policy column
 */
import { useState, useEffect, useRef } from "react";
import { SEOHead } from "@/components/seo";
import { Scissors, Star, X, Plus, Phone, Mail, MapPin, Clock, ExternalLink, Camera } from "lucide-react";
import { cn } from "@/lib/utils";

/* ──────────────────── DATA ──────────────────── */

const GLOSSGENIUS_URL = "https://highmaintenancebh.glossgenius.com/book";
const FACEBOOK_URL = "https://www.facebook.com/highmaintenancebeautyhavenllc";
const MAPS_URL = "https://maps.google.com/?q=10+W+Auglaize+Street+Wapakoneta+OH+45895";

const hannahSpecialties = ["Vivid Color", "Balayage", "Full Highlights", "Creative Color", "All-Over Color"];
const desireeSpecialties = ["Natural Nail Health", "Gel-X", "Acrylic Sets", "Nail Art", "Custom Designs", "Pedicures"];

/* Hair services */
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

/* Nail services */
const nailServices = [
  {
    category: "Gel Manicures",
    items: [
      { name: "Clean Girl Mani", duration: "1 hr 30 min", price: "$50", deposit: "$10" },
      { name: "Art Girl Mani", duration: "1 hr 40 min", price: "$60", deposit: "$12" },
      { name: "Statement Mani", duration: "2 hr", price: "$70", deposit: "$14" },
    ],
  },
  {
    category: "Gel-X Sets",
    items: [
      { name: "Classic Gel-X Set", duration: "2 hr 10 min", price: "$85", deposit: "$17" },
      { name: "Elevated Gel-X Set", duration: "2 hr 40 min", price: "$95", deposit: "$19" },
      { name: "Luxe Gel-X Set", duration: "3 hr 5 min", price: "$115", deposit: "$23" },
    ],
  },
  {
    category: "Acrylic Sets",
    items: [
      { name: "Classic Acrylic Set", duration: "2 hr 35 min", price: "$85", deposit: "$17" },
      { name: "Elevated Acrylic Set", duration: "3 hr", price: "$95", deposit: "$19" },
      { name: "Luxe Acrylic Set", duration: "3 hr 15 min", price: "$115", deposit: "$23" },
    ],
  },
  {
    category: "Acrylic Fills",
    items: [
      { name: "Classic Acrylic Fill", duration: "2 hr 25 min", price: "$70", deposit: "$14" },
      { name: "Elevated Acrylic Fill", duration: "2 hr 35 min", price: "$80", deposit: "$16" },
      { name: "Luxe Acrylic Fill", duration: "3 hr", price: "$100", deposit: "$20" },
    ],
  },
  {
    category: "Pedicures",
    items: [
      { name: "Essential Pedi", duration: "1 hr 15 min", price: "$65", deposit: "$13" },
      { name: "Polished Pedi", duration: "1 hr 35 min", price: "$75", deposit: "$15" },
      { name: "Deluxe Pedi", duration: "1 hr 45 min", price: "$85", deposit: "$17" },
    ],
  },
  {
    category: "Combo Services",
    hot: true,
    items: [
      { name: "Classic Gel Combo", duration: "2 hr 45 min", price: "$90", deposit: "$18" },
      { name: "Elevated Gel Combo", duration: "3 hr 15 min", price: "$105", deposit: "$21" },
      { name: "High Maintenance Gel Combo", duration: "3 hr 30 min", price: "$120", deposit: "$24" },
      { name: "Gel-X Signature Combo", duration: "3 hr 40 min", price: "$120", deposit: "$24" },
      { name: "Gel-X Luxe Combo", duration: "3 hr 40 min", price: "$140", deposit: "$28" },
      { name: "Gel-X HM Combo", duration: "4 hr 15 min", price: "$160", deposit: "$32" },
      { name: "Acrylic Classic Combo", duration: "3 hr 30 min", price: "$120", deposit: "$24" },
      { name: "Acrylic Glam Combo", duration: "3 hr 45 min", price: "$140", deposit: "$28" },
      { name: "Acrylic HM Combo", duration: "4 hr 35 min", price: "$180", deposit: "$36" },
    ],
  },
  {
    category: "Custom Services",
    items: [
      { name: "Freestyle / Custom Set", duration: "4 hr", price: "$100", deposit: "$25" },
      { name: "Custom Press-On Nails", duration: "1 hr", price: "$20", deposit: "—" },
    ],
  },
  {
    category: "Add-Ons & Extras",
    items: [
      { name: "Polish Change", duration: "1 hr", price: "$20", deposit: "—" },
      { name: "Reshape", duration: "15 min", price: "$5", deposit: "—" },
      { name: "Repair", duration: "30 min", price: "$10", deposit: "$5" },
      { name: "Removal", duration: "20 min", price: "$20", deposit: "$5" },
      { name: "Early Riser / After Hours Fee", duration: "—", price: "$20", deposit: "$10" },
      { name: "Length Upgrade (Long to XL)", duration: "—", price: "$10", deposit: "—" },
    ],
  },
];

const nailPortfolio = [
  { file: "hand-painted-lilo-stitch-acrylic.jpg", caption: "Hand Painted Lilo & Stitch Acrylic Set" },
  { file: "3d-bones-french-gel-x.jpg", caption: "3D Bones and French Tips Gel-X" },
  { file: "acrylic-only-full-set.jpg", caption: "Acrylic Full Set" },
  { file: "rose-nail-art-chrome.jpg", caption: "Rose Nail Art with Chrome" },
  { file: "gold-foil-blue-marble.jpg", caption: "Gold Foil and Blue Marble" },
  { file: "3d-poison-themed-gel-x.jpg", caption: "3D Poison Themed Gel-X" },
  { file: "halloween-stiletto.jpg", caption: "Halloween Themed Stiletto Set" },
  { file: "hot-pink-cheetah.jpg", caption: "Hot Pink Cheetah Print Set" },
  { file: "neutral-gems-accents.jpg", caption: "Neutral with Gems and Accents" },
];

const bridalPackages = [
  { title: "Bridal Package", price: "$95", save: "Save $35", desc: "Gel Mani with any design of choice, plus Deluxe Gel Pedicure.", popular: false },
  { title: "Bad & Boujee Bridal Package", price: "$100", save: "Save $50", desc: "Gel-X with design, plus a Deluxe Pedi. Elevated and unapologetic.", popular: false },
  { title: "Premium Bridal Package", price: "$285", save: "Save $75", desc: "Full Gel-X with design for Bachelorette Party, Wedding Day, and Bridal Shower. Everything covered.", popular: true },
];

/* ──────────────────── SUB-COMPONENTS ──────────────────── */

function PinkLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="hmbh-label">{children}</span>
  );
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

function BtnPrimary({ children, href, className, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) {
  return (
    <a href={href} className={cn("hmbh-btn-primary", className)} {...props}>
      {children}
    </a>
  );
}

function BtnSecondary({ children, href, className, onClick, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children: React.ReactNode }) {
  return (
    <a href={href} className={cn("hmbh-btn-secondary", className)} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

/* ──────────────────── MAIN PAGE ──────────────────── */

export default function BeautyHaven() {
  const [fabOpen, setFabOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Close FAB on outside tap
  useEffect(() => {
    if (!fabOpen) return;
    const handler = (e: MouseEvent) => {
      const fab = document.getElementById("hmbh-fab");
      if (fab && !fab.contains(e.target as Node)) setFabOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [fabOpen]);

  return (
    <div className="hmbh-page">
      <SEOHead
        title="Beauty Haven | A-Z Enterprises"
        description="High Maintenance Beauty Haven — luxury hair color and nail art studio located inside A-Z Enterprises in Wapakoneta, Ohio. Book online or by contact."
        canonicalPath="/beauty-haven"
      />

      {/* ═══ HERO ═══ */}
      <section ref={heroRef} id="beauty-haven" className="hmbh-hero">
        <div className="hmbh-hero-inner animate-hmbh-fade-in">
          <PinkLabel>Located inside A-Z Enterprises, Wapakoneta, Ohio</PinkLabel>
          <h1 className="hmbh-hero-title">
            HIGH MAINTENANCE<br />BEAUTY HAVEN
          </h1>
          <p className="hmbh-hero-sub">Hair. Nails. No compromises.</p>
          <div className="hmbh-hero-ctas">
            <BtnSecondary href="#hair-booking">Book Hair — Hannah</BtnSecondary>
            <BtnPrimary href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer">Book Nails — Desiree</BtnPrimary>
          </div>
        </div>
      </section>

      {/* ═══ BRAND INTRO ═══ */}
      <section className="hmbh-section">
        <div className="hmbh-container hmbh-container--narrow">
          <PinkLabel>Who We Are</PinkLabel>
          <SectionHeadline>Not your average beauty studio.</SectionHeadline>
          <p className="hmbh-body">
            High Maintenance Beauty Haven is a luxury hair and nail studio operating on the second floor of A-Z Enterprises in Wapakoneta, Ohio.
            We specialize in vivid color, custom nail art, and the kind of results that make people stop and stare. Appointment-based. Portfolio-driven.
            Unapologetically detail-obsessed.
          </p>
          <p className="hmbh-body mt-4">Book your seat. Bring your vision.</p>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ MEET THE TEAM ═══ */}
      <section id="meet-the-team" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Meet the Artists</PinkLabel>
          <SectionHeadline>The Team</SectionHeadline>

          <div className="hmbh-team-grid">
            {/* Hannah */}
            <div className="hmbh-card">
              <div className="hmbh-photo-placeholder border border-dashed border-[#FF0099]/35">
                <Camera className="w-8 h-8 text-[#FF0099]/40" />
                <span className="text-sm text-white/40">[INSERT PHOTO — Hannah Collins]</span>
              </div>
              <div className="p-6">
                <h3 className="hmbh-card-name">Hannah Collins</h3>
                <p className="hmbh-card-title">Professional Hair Colorist</p>
                <div className="flex flex-wrap gap-2 my-4">
                  {hannahSpecialties.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
                <p className="hmbh-body text-sm">
                  Hannah is a professional colorist and vivid hair specialist based in St. Marys, Ohio, bringing bold transformations to life inside A-Z Enterprises.
                  With a passion for creative color and a signature cheetah print cape in every after shot, she brings personality and precision to every appointment.
                  When she's not behind the chair, you'll find her river walking with her five-year-old daughter.
                </p>
                <div className="hmbh-divider-line my-4" />
                <p className="text-white font-bold text-sm mb-2">Book Hannah</p>
                <div className="space-y-1 text-sm text-white/75">
                  <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#FF0099]" /> 567-825-1546</p>
                  <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#FF0099]" /> hannah@a-zenterpriseshq.com</p>
                  <p className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-[#FF0099]" /> @highmaintenancebeautyhavenllc</p>
                </div>
                <p className="text-xs text-white/45 mt-3 italic">Hair services are appointment-only. Contact Hannah directly to schedule.</p>
                <BtnSecondary href="tel:5678251546" className="w-full mt-4 text-center block">Contact Hannah to Book</BtnSecondary>
              </div>
            </div>

            {/* Desiree */}
            <div className="hmbh-card">
              <div className="hmbh-photo-placeholder border border-dashed border-[#FF0099]/35">
                <Camera className="w-8 h-8 text-[#FF0099]/40" />
                <span className="text-sm text-white/40">[INSERT PHOTO — Desiree Brogaard]</span>
              </div>
              <div className="p-6">
                <h3 className="hmbh-card-name">Desiree Brogaard</h3>
                <p className="hmbh-card-title">Nail Artist | Natural Nail Specialist</p>
                <div className="flex flex-wrap gap-2 my-4">
                  {desireeSpecialties.map((s) => <Badge key={s}>{s}</Badge>)}
                </div>
                <p className="hmbh-body text-sm">
                  Desiree is a maximalist nail artist with five years of experience, rooted in Coldwater, Ohio, and passionate about natural nail health.
                  She specializes in intricate, highly detailed nail art — from structured gel to full Gel-X and acrylic sets — and brings that same energy to every set
                  whether it's clean and classic or elaborately over-the-top. For Desiree, success is measured in sets she's proud of.
                </p>
                <div className="hmbh-divider-line my-4" />
                <p className="text-white font-bold text-sm mb-2">Book Desiree</p>
                <p className="text-sm text-white/75">All nail services are bookable online. Deposits are collected at booking. Deposits apply toward your total.</p>
                <BtnPrimary href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="w-full mt-4 text-center block">Book Desiree Now</BtnPrimary>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ HAIR SERVICES ═══ */}
      <section id="hair-by-hannah" className="hmbh-section">
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
              <BtnSecondary href="tel:5678251546" className="mt-4 inline-block">Contact Hannah</BtnSecondary>
            </div>
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ NAIL SERVICES ═══ */}
      <section id="nails-by-desiree" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Desiree Brogaard</PinkLabel>
          <SectionHeadline>Nail Services</SectionHeadline>
          <p className="hmbh-body italic text-sm mb-8">Book online via GlossGenius. All bookings require a deposit. Deposits are applied toward your service total.</p>

          {nailServices.map((cat) => (
            <div key={cat.category}>
              <div className="hmbh-category-header flex items-center gap-2">
                {cat.category}
                {(cat as any).hot && <Badge className="ml-2">HOT</Badge>}
              </div>

              {/* Desktop table */}
              <table className="hmbh-service-table hidden sm:table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Duration</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Deposit</th>
                  </tr>
                </thead>
                <tbody>
                  {cat.items.map((s) => (
                    <tr key={s.name}>
                      <td className="text-white">{s.name}</td>
                      <td className="text-white/45 text-sm">{s.duration}</td>
                      <td className="text-right text-white font-bold whitespace-nowrap">{s.price}</td>
                      <td className="text-right text-[#FF0099] text-sm">{s.deposit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile table — hide duration/deposit */}
              <table className="hmbh-service-table sm:hidden">
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

          <p className="text-xs text-white/45 mt-4 sm:hidden italic">
            Deposits listed per service.{" "}
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="text-[#FF0099] underline underline-offset-2">
              View full details on the booking page.
            </a>
          </p>

          <div className="mt-10 text-center">
            <BtnPrimary href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer">Book Nails Online</BtnPrimary>
          </div>
        </div>
      </section>

      {/* ═══ BRIDAL PACKAGES ═══ */}
      <section id="packages" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Limited Packages</PinkLabel>
          <SectionHeadline>Bridal Collections</SectionHeadline>

          <div className="grid md:grid-cols-3 gap-6 mt-8">
            {bridalPackages.map((pkg) => (
              <div key={pkg.title} className={cn("hmbh-card p-6 flex flex-col", pkg.popular && "ring-1 ring-[#FF0099]/50")}>
                {pkg.popular && <Badge className="self-start mb-3">Most Popular</Badge>}
                <h3 className="text-white font-bold text-lg">{pkg.title}</h3>
                <p className="text-3xl font-bold text-white mt-2">{pkg.price}</p>
                <Badge className="self-start mt-2">{pkg.save}</Badge>
                <p className="hmbh-body text-sm mt-4 flex-1">{pkg.desc}</p>
                <BtnPrimary href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="w-full text-center block mt-6">Book This Package</BtnPrimary>
              </div>
            ))}
          </div>

          <p className="text-center text-white/45 text-sm italic mt-6">
            Already have a package? Book your services as usual. Package credits apply automatically at checkout.
          </p>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ BOOKING & POLICIES ═══ */}
      <section id="hair-booking" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Policies & Booking</PinkLabel>
          <SectionHeadline>Before You Book</SectionHeadline>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            {/* Hair — Hannah */}
            <div className="hmbh-card p-6">
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

              <BtnSecondary href="tel:5678251546" className="w-full text-center block">Contact Hannah to Book</BtnSecondary>
            </div>

            {/* Nails — Desiree */}
            <div id="nail-booking" className="hmbh-card p-6">
              <div className="hmbh-category-header">Nails by Desiree</div>
              <p className="hmbh-body text-sm mb-4">All nail services book online via GlossGenius. Deposits are collected at booking.</p>
              <BtnPrimary href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="w-full text-center block mb-6">Book Desiree Now</BtnPrimary>
              <p className="text-sm text-white/75 mb-6">
                <span className="text-white/45">Hours:</span> Tues – Sat, 9 AM to 9 PM<br />Appointment only.
              </p>

              <div className="hmbh-policy-header">Deposit Policy</div>
              <p className="hmbh-body text-sm mb-4">
                Every service requires a deposit at booking. Deposits are listed with each service in the menu above.
                Deposits are applied toward your service total. All deposits are non-refundable.
                To reschedule: 5 days advance notice required. Your deposit transfers to the new appointment. Transfers are valid for up to 3 months.
              </p>

              <div className="hmbh-policy-header">Cancellation Policy</div>
              <p className="hmbh-body text-sm mb-4">
                48-hour notice required for any cancellation or rebook. Without proper notice, you will be charged 75% of the missed service.
                Your next appointment must be paid in full to rebook.
              </p>

              <div className="hmbh-policy-header">No-Show Policy</div>
              <p className="hmbh-body text-sm">
                No-shows forfeit their deposit in full and will not be rebooked.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ PORTFOLIO ═══ */}
      <section id="portfolio" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>The Work</PinkLabel>
          <SectionHeadline>Portfolio</SectionHeadline>
          <p className="hmbh-body italic text-sm text-center mb-8">
            Before and afters posted regularly. Follow @highmaintenancebeautyhavenllc for the latest looks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nail portfolio — placeholder tiles */}
            {nailPortfolio.map((item) => (
              <div key={item.file} className="hmbh-gallery-tile group">
                <div className="hmbh-gallery-placeholder">
                  <Camera className="w-6 h-6 text-[#FF0099]/30" />
                  <span className="text-xs text-white/30 text-center px-2">{item.caption}</span>
                </div>
                <div className="hmbh-gallery-overlay">
                  <span className="text-white text-sm font-medium text-center px-4">{item.caption}</span>
                </div>
              </div>
            ))}

            {/* Hair placeholder tiles */}
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

      {/* ═══ REVIEWS ═══ */}
      <section id="reviews" className="hmbh-section">
        <div className="hmbh-container hmbh-container--narrow text-center">
          <PinkLabel>What Clients Say</PinkLabel>
          <SectionHeadline>Reviews</SectionHeadline>
          <p className="hmbh-body mt-4">
            Client reviews are on their way. While we gather them, check out our portfolio above or follow us on Facebook for client feedback.
          </p>
          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-white/75 underline underline-offset-4 hover:text-white transition-colors text-sm"
          >
            View Our Facebook Page
          </a>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ LOCATION ═══ */}
      <section id="find-us" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Where to Find Us</PinkLabel>
          <SectionHeadline>Located Inside A-Z Enterprises</SectionHeadline>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <div className="hmbh-card p-6">
              <h3 className="text-white font-bold text-lg mb-4">High Maintenance Beauty Haven LLC</h3>
              <p className="hmbh-body text-sm mb-4">Located on the second floor executive suites.</p>
              <div className="space-y-1 text-sm text-white/75 mb-4">
                <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#FF0099] flex-shrink-0" /> A-Z Enterprises, 10 W Auglaize Street, Wapakoneta, OH 45895</p>
              </div>
              <div className="hmbh-divider-line my-4" />
              <p className="text-white font-bold text-sm mb-2">Contact</p>
              <div className="space-y-1 text-sm text-white/75 mb-4">
                <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#FF0099]" /> 567-825-1546</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#FF0099]" /> highmaintenancebh@gmail.com</p>
                <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#FF0099]" /> hannah@a-zenterpriseshq.com</p>
                <p className="flex items-center gap-2"><ExternalLink className="w-3.5 h-3.5 text-[#FF0099]" /> @highmaintenancebeautyhavenllc</p>
              </div>
              <div className="hmbh-divider-line my-4" />
              <p className="text-white font-bold text-sm mb-2">Hours</p>
              <div className="text-sm text-white/75">
                <p className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#FF0099]" /> Tuesday – Saturday, 9:00 AM – 9:00 PM</p>
                <p className="text-white/45 text-xs mt-1">Appointment Only</p>
              </div>
            </div>

            <div className="hmbh-card overflow-hidden">
              <iframe
                title="High Maintenance Beauty Haven Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3058.5!2d-84.1934!3d40.5678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2s10+W+Auglaize+St%2C+Wapakoneta%2C+OH+45895!5e0!3m2!1sen!2sus!4v1700000000000"
                className="w-full h-64 lg:h-full min-h-[300px] border-0 hmbh-map-filter"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="p-4">
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hmbh-btn-secondary w-full text-center block"
                >
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE FAB ═══ */}
      <div id="hmbh-fab" className="hmbh-fab-container lg:hidden">
        {fabOpen && (
          <div className="hmbh-fab-options">
            <a
              href="#hair-booking"
              className="hmbh-fab-option hmbh-fab-option--secondary"
              aria-label="Book Hair with Hannah"
              onClick={() => setFabOpen(false)}
            >
              <Scissors className="w-4 h-4" />
              Book Hair
            </a>
            <a
              href={GLOSSGENIUS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hmbh-fab-option hmbh-fab-option--primary"
              aria-label="Book Nails with Desiree"
              onClick={() => setFabOpen(false)}
            >
              <Star className="w-4 h-4" />
              Book Nails
            </a>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); setFabOpen(!fabOpen); }}
          className="hmbh-fab-main"
          aria-expanded={fabOpen}
          aria-label="Book Now"
        >
          {fabOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          {!fabOpen && <span className="ml-1 text-sm font-bold">Book Now</span>}
        </button>
      </div>
    </div>
  );
}
