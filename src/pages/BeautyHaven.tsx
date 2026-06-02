import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import "@/styles/beauty-haven-lp.css";

const GLOSSGENIUS_URL = "https://highmaintenancebh.glossgenius.com/book";

export default function BeautyHaven() {
  return (
    <div className="lp-root">
      <SEOHead
        title="High Maintenance Beauty Haven. A-Z Enterprises"
        description="High Maintenance Beauty Haven LLC. full nails and hair spa on the second floor of A-Z Enterprises in Wapakoneta, Ohio. Owned by Desiree."
        canonicalPath="/beauty-haven"
      />

      {/* ═══ HERO ═══ */}
      <section className="lp-hero">
        <div className="lp-hero-bg-accent" />
        <div className="lp-hero-content">
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-line" />
            <span className="lp-eyebrow-text">A-Z Enterprises · Health &amp; Wellness</span>
          </div>
          <h1>
            High<br />Maintenance<br /><em>Beauty Haven</em>
          </h1>
          <p className="lp-hero-tagline text-amber-100">Full Nails &amp; Hair Spa. Second Floor, Wapakoneta OH</p>
          <div className="lp-hero-meta">
            <span>{SITE_CONFIG.location.street}, 2nd Floor · {SITE_CONFIG.location.city}, {SITE_CONFIG.location.stateAbbr} {SITE_CONFIG.location.zip}</span>
            <span className="lp-hero-meta-div" />
            <span>Open 7 Days · 6:00 AM – 10:00 PM</span>
          </div>
          <div className="lp-hero-badges">
            <span className="lp-badge-pink">Nails by Desiree</span>
            <span className="lp-badge-outline">Appointment Only</span>
            <span className="lp-badge-outline">Open 7 Days</span>
          </div>
          <div className="lp-cta-row">
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="lp-btn-pink">Book Nails. Desiree</a>
          </div>
        </div>
        <div className="lp-hero-stats">
          <div className="lp-stat">
            <div className="lp-stat-num">1</div>
            <div className="lp-stat-label">Resident Artist</div>
          </div>
          <div className="lp-stat-div" />
          <div className="lp-stat">
            <div className="lp-stat-num">5★</div>
            <div className="lp-stat-label">Client Reviews</div>
          </div>
          <div className="lp-stat-div" />
          <div className="lp-stat">
            <div className="lp-stat-num">Appt</div>
            <div className="lp-stat-label">By Appointment Only</div>
          </div>
        </div>
      </section>

      {/* ═══ HIRING BANNER ═══ */}
      <section className="lp-hiring-banner">
        <div className="lp-hiring-banner-inner">
          <div className="lp-hiring-banner-left">
            <span className="lp-hiring-banner-pulse" />
            <span className="lp-hiring-banner-title">We Are Hiring</span>
            <span className="lp-hiring-banner-div" />
            <span className="lp-hiring-banner-desc">Nail Tech &amp; Hair Stylist · Booth Rental Available</span>
          </div>
          <a href="#hiring" className="lp-hiring-banner-link">View Openings →</a>
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section className="lp-about">
        <div className="lp-about-text">
          <div className="section-label text-amber-200">Who We Are</div>
          <h2>Not your average beauty studio.</h2>
          <p className="text-amber-100">
            High Maintenance Beauty Haven is a full nails and hair spa owned and operated by Desiree on the second floor of A-Z Enterprises in Wapakoneta, Ohio. We specialize in custom nail art, hair services, and the kind of results that make people stop and stare.
          </p>
          <p className="text-amber-100" style={{ marginTop: "12px" }}>Appointment-based. Portfolio-driven. Unapologetically detail-obsessed.</p>
        </div>
      </section>

      {/* ═══ ARTIST ═══ */}
      <section className="lp-artists">
        {/* Desiree */}
        <div className="lp-artist">
          <div className="lp-artist-avatar">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            <div className="lp-artist-spec pink">Nails</div>
          </div>
          <div>
            <div className="lp-artist-name">Desiree Brogaard</div>
            <div className="lp-artist-role-pink">Owner · Nail Artist · Natural Nail Specialist</div>
            <div className="lp-artist-tags">
              <span className="lp-tag-p">Gel-X</span>
              <span className="lp-tag-p">Acrylic Sets</span>
              <span className="lp-tag-p">Nail Art</span>
              <span className="lp-tag-p">Pedicures</span>
            </div>
            <p className="lp-artist-desc text-amber-50">Maximalist nail artist, five years deep. From structured gel to full Gel-X. clean classic or elaborately over-the-top.</p>
            <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="lp-artist-link-p">Book with Desiree →</a>
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ═══ */}
      <section className="lp-services">
        <div className="lp-svc-col">
          <div className="lp-svc-col-head pink">Desiree. Nail Services</div>
          <div className="lp-svc-item"><span className="lp-svc-name">Classic Gel-X Set</span><span className="lp-svc-price-p">$97</span></div>
          <div className="lp-svc-item"><span className="lp-svc-name">Standard Gel-X Set</span><span className="lp-svc-price-p">$113</span></div>
          <div className="lp-svc-item"><span className="lp-svc-name">Classic Acrylic Set</span><span className="lp-svc-price-p">$85</span></div>
          <div className="lp-svc-item"><span className="lp-svc-name">Luxury Pedi Combo</span><span className="lp-svc-price-p">$95</span></div>
          <div className="lp-svc-item"><span className="lp-svc-name">Custom Designs</span><span className="lp-svc-price-p">$25+</span></div>
          <div className="lp-svc-item"><span className="lp-svc-name">Classic Pedi</span><span className="lp-svc-price-p">$45</span></div>
          <div className="lp-svc-more"><a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="pink">View all nail services →</a></div>
        </div>
      </section>

      {/* ═══ BRIDAL ═══ */}
      <section className="lp-bridal">
        <div className="lp-bridal-head">
          <h3>Bridal Collections</h3>
          <span className="section-label text-amber-200">By Desiree</span>
        </div>
        <div className="lp-bridal-cards">
          <div className="lp-bridal-card">
            <div className="lp-bridal-tag">Bridal Package</div>
            <div className="lp-bridal-price">$95</div>
            <div className="lp-bridal-name">Soft &amp; Timeless</div>
            <p className="lp-bridal-desc text-amber-100">Soft shades, delicate florals. Timeless bridal nail art for your perfect day.</p>
            <button className="lp-bridal-btn">Book This Package</button>
          </div>
          <div className="lp-bridal-card">
            <div className="lp-bridal-tag">Nail &amp; Rejuve Package</div>
            <div className="lp-bridal-price">$100</div>
            <div className="lp-bridal-name">Earn Your Dream Look</div>
            <p className="lp-bridal-desc text-amber-100">Custom designs for the boldest day of your life. Rejuvenating nail treatment included.</p>
            <button className="lp-bridal-btn">Book This Package</button>
          </div>
          <div className="lp-bridal-card feat">
            <div className="lp-bridal-tag">★ Most Popular</div>
            <div className="lp-bridal-price">$285</div>
            <div className="lp-bridal-name">Premium Bridal Package</div>
            <p className="lp-bridal-desc text-amber-100">Full set with handmade press-ons, dazzling details, French tips, and more. Perfect for bridal parties.</p>
            <button className="lp-bridal-btn">Book This Package</button>
          </div>
        </div>
      </section>

      {/* ═══ BOOKING ═══ */}
      <section className="lp-booking">
        <div className="lp-booking-col">
          <h3>Book with Desiree</h3>
          <div className="role pink">Nail Artist · Natural Nail Specialist</div>
          <div className="lp-booking-contact text-amber-100">
            Book online via booking link<br />
            24-hour advance notice required<br />
            Walk-ins subject to availability<br />
            Appointment only · Deposit required
          </div>
          <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer" className="lp-btn-pink">Book Nails Online</a>
        </div>
      </section>

      {/* ═══ NOW HIRING ═══ */}
      <section id="hiring" className="lp-hiring">
        <div className="lp-hiring-head">
          <h3>Now Hiring</h3>
          <span className="section-label text-amber-200">Wapakoneta, OH</span>
        </div>
        <div className="lp-hiring-cards">
          <div className="lp-hiring-card">
            <h4>Nail Technician</h4>
            <div className="role text-orange-100">Booth Rental Available</div>
            <p className="text-slate-50">Join High Maintenance Beauty Haven. We are looking for a licensed nail tech who takes pride in clean work and client relationships.</p>
            <ul className="text-accent">
              <li>Licensed and insured</li>
              <li>Experienced with gel, acrylics, or nail art</li>
              <li>Client-focused and reliable</li>
              <li>Booth rental or commission structure</li>
            </ul>
            <a href="https://go.azenterpriseshq.com/nail-technician-application" target="_blank" rel="noopener noreferrer" className="lp-hiring-btn">Apply Now</a>
          </div>
          <div className="lp-hiring-card">
            <h4>Hairdresser / Hairstylist</h4>
            <div className="role text-orange-100">Booth Rental Available</div>
            <p className="text-slate-50">We are building out our hair services and need a skilled stylist to bring cuts, color, and styling to our clients.</p>
            <ul className="text-accent">
              <li>Licensed cosmetologist</li>
              <li>Comfortable with cuts, color, and styling</li>
              <li>Professional and punctual</li>
              <li>Booth rental or commission structure</li>
            </ul>
            <a href="https://go.azenterpriseshq.com/hair-dresser-application" target="_blank" rel="noopener noreferrer" className="lp-hiring-btn">Apply Now</a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="lp-footer">
        <div className="lp-footer-left">
          <div className="lp-footer-name">High Maintenance Beauty Haven</div>
          <div className="lp-footer-address">{SITE_CONFIG.location.street}, 2nd Floor · {SITE_CONFIG.location.city}, {SITE_CONFIG.location.stateAbbr} {SITE_CONFIG.location.zip}</div>
        </div>
        <div className="lp-footer-links">
          <a href="/">Full Site</a>
          <a href={GLOSSGENIUS_URL} target="_blank" rel="noopener noreferrer">Book Now</a>
          <a href="/">A-Z Enterprises</a>
        </div>
        <div className="lp-footer-copy">{SITE_CONFIG.business.copyright}</div>
      </footer>
    </div>
  );
}
