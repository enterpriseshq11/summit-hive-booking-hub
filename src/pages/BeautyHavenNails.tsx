/**
 * NAILS BY DESIREE — /beauty-haven/nails
 * Zero hair services, zero Hannah contact info. Everything routes to GlossGenius.
 */
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Camera, Star, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const GLOSSGENIUS_URL = "https://highmaintenancebh.glossgenius.com/book";
const FACEBOOK_URL = "https://www.facebook.com/highmaintenancebeautyhavenllc";

const desireeSpecialties = ["Natural Nail Health", "Gel-X", "Acrylic Sets", "Nail Art", "Custom Designs", "Pedicures"];

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

export default function BeautyHavenNails() {
  return (
    <div className="hmbh-page">
      <SEOHead
        title="Nails by Desiree | Beauty Haven | A-Z Enterprises"
        description="Nail art and services by Desiree Brogaard at High Maintenance Beauty Haven. Gel-X, acrylics, pedicures, bridal packages. Book online."
        canonicalPath="/beauty-haven/nails"
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
            <div className="hmbh-photo-placeholder border border-dashed border-[#FF0099]/35 rounded-xl">
              <Camera className="w-8 h-8 text-[#FF0099]/40" />
              <span className="text-sm text-white/40">[INSERT PHOTO — Desiree Brogaard]</span>
            </div>
            <div>
              <PinkLabel>Nail Services</PinkLabel>
              <h1 className="hmbh-hero-title !text-[clamp(2rem,4vw,3.5rem)]">Desiree Brogaard</h1>
              <p className="hmbh-card-title mb-4">Nail Artist | Natural Nail Specialist</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {desireeSpecialties.map((s) => <Badge key={s}>{s}</Badge>)}
              </div>
              <p className="hmbh-body text-sm max-w-2xl">
                Desiree is a maximalist nail artist with five years of experience, rooted in Coldwater, Ohio, and passionate about natural nail health.
                She specializes in intricate, highly detailed nail art — from structured gel to full Gel-X and acrylic sets — and brings that same energy to every set
                whether it's clean and classic or elaborately over-the-top. For Desiree, success is measured in sets she's proud of.
              </p>
              <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="hmbh-btn-primary mt-6 inline-block">Book Desiree Now</a>
            </div>
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ NAIL SERVICES MENU ═══ */}
      <section id="nail-services" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>Desiree Brogaard</PinkLabel>
          <h2 className="hmbh-headline" style={{ color: 'var(--hmbh-pink)' }}>Nail Services by Desiree</h2>
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

              {/* Mobile table */}
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
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="hmbh-btn-primary">Book Nails Online</a>
          </div>
        </div>
      </section>

      <CheckerDivider />

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
                <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="hmbh-btn-primary w-full text-center block mt-6">Book This Package</a>
              </div>
            ))}
          </div>

          <p className="text-center text-white/45 text-sm italic mt-6">
            Already have a package? Book your services as usual. Package credits apply automatically at checkout.
          </p>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ NAIL PORTFOLIO ═══ */}
      <section id="nail-portfolio" className="hmbh-section">
        <div className="hmbh-container">
          <PinkLabel>The Work</PinkLabel>
          <SectionHeadline>Nail Portfolio</SectionHeadline>
          <p className="hmbh-body italic text-sm text-center mb-8">
            Before and afters posted regularly. Follow @highmaintenancebeautyhavenllc for the latest looks.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        </div>
      </section>

      <CheckerDivider />

      {/* ═══ POLICIES ═══ */}
      <section id="nail-policies" className="hmbh-section">
        <div className="hmbh-container hmbh-container--narrow">
          <PinkLabel>Policies & Booking</PinkLabel>
          <SectionHeadline>Before You Book</SectionHeadline>

          <div className="hmbh-card p-6 mt-8">
            <div className="hmbh-category-header">Nails by Desiree</div>
            <p className="hmbh-body text-sm mb-4">All nail services book online via GlossGenius. Deposits are collected at booking.</p>
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="hmbh-btn-primary w-full text-center block mb-6">Book Desiree Now</a>
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
      </section>

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

      {/* ═══ MOBILE FAB — simplified for Desiree ═══ */}
      <div className="hmbh-fab-container lg:hidden">
        <a
          href={GLOSSGENIUS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hmbh-fab-main"
          aria-label="Book Nails with Desiree"
        >
          <Star className="w-5 h-5" />
          <span className="ml-1 text-sm font-bold">Book Now</span>
        </a>
      </div>
    </div>
  );
}
