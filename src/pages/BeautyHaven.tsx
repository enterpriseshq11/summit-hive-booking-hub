/**
 * HIGH MAINTENANCE BEAUTY HAVEN — Hub Page /beauty-haven
 *
 * OPEN ITEMS (pending from team):
 * 1. Hannah Collins bio photo — upload to Beauty Haven Google Drive folder
 * 2. Desiree Brogaard bio photo — same
 * 3. Hannah hair before/after photos — 3 gallery slots on /beauty-haven/hair
 * 4. Nail portfolio images — 9 slots on /beauty-haven/nails
 * 5. Hannah's Square booking URL — once generated, add to /beauty-haven/hair
 * 6. Facebook reviews — populate on individual pages
 * 7. Hannah's deposit exact tiers — update policy on /beauty-haven/hair
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SEOHead } from "@/components/seo";
import { Camera, X, Plus, Scissors, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Phone, Mail, ExternalLink } from "lucide-react";

const GLOSSGENIUS_URL = "https://highmaintenancebh.glossgenius.com/book";

const hannahSpecialties = ["Vivid Color", "Balayage", "Full Highlights", "Creative Color", "All-Over Color"];
const desireeSpecialties = ["Natural Nail Health", "Gel-X", "Acrylic Sets", "Nail Art", "Custom Designs", "Pedicures"];

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

export default function BeautyHaven() {
  const [fabOpen, setFabOpen] = useState(false);

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
      <section id="beauty-haven" className="hmbh-hero">
        <div className="hmbh-hero-inner animate-hmbh-fade-in">
          <PinkLabel>Located inside A-Z Enterprises, Wapakoneta, Ohio</PinkLabel>
          <h1 className="hmbh-hero-title">
            HIGH MAINTENANCE<br />BEAUTY HAVEN
          </h1>
          <p className="hmbh-hero-sub">Hair. Nails. No compromises.</p>
          <div className="hmbh-hero-ctas">
            <Link to="/beauty-haven/hair" className="hmbh-btn-secondary">Book Hair — Hannah</Link>
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="hmbh-btn-primary">Book Nails — Desiree</a>
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
                <Link to="/beauty-haven/hair" className="hmbh-btn-secondary w-full text-center block">View Hair Services</Link>
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
                <Link to="/beauty-haven/nails" className="hmbh-btn-primary w-full text-center block">View Nail Services</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MOBILE FAB ═══ */}
      <div id="hmbh-fab" className="hmbh-fab-container lg:hidden">
        {fabOpen && (
          <div className="hmbh-fab-options">
            <Link
              to="/beauty-haven/hair"
              className="hmbh-fab-option hmbh-fab-option--secondary"
              aria-label="Book Hair with Hannah"
              onClick={() => setFabOpen(false)}
            >
              <Scissors className="w-4 h-4" />
              Book Hair
            </Link>
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
