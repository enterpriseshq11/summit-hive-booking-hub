import { Link } from "react-router-dom";
import { SITE_CONFIG } from "@/config/siteConfig";
import { useAuth } from "@/contexts/AuthContext";
import { AzWordmark } from "./AzHeader";
import { AI_LINE } from "./AzVideo";

export function AzFooter() {
  const { user } = useAuth();
  const head = "mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-az-gold";
  const link = "block py-0.5 text-az-paper hover:text-az-goldlight transition-colors";

  return (
    <footer className="az-site border-t border-[rgba(227,168,58,0.18)] pb-10 pt-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-6">
        <p className="max-w-[980px] font-azi text-[24px] italic leading-[1.45] text-az-paper md:text-[32px]">
          We are here to serve the community. We want to see downtown Wapak thrive.{" "}
          <span className="text-az-goldlight">We believe that we can all thrive inside the Hive.</span>
        </p>

        <div className="mt-14 grid gap-8 text-[15px] leading-[1.9] sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" aria-label="A-Z Enterprises home">
              <AzWordmark />
            </Link>
            <address className="mt-2 not-italic text-az-soft">
              10 W. Auglaize St.
              <br />
              Wapakoneta, OH 45895
            </address>
          </div>
          <div>
            <div className={head}>Reach us</div>
            <a href={SITE_CONFIG.contact.phoneLink} className={link}>{SITE_CONFIG.contact.phone}</a>
            <a href={SITE_CONFIG.contact.emailLink} className={link}>{SITE_CONFIG.contact.email}</a>
          </div>
          <div>
            <div className={head}>Company</div>
            <Link to="/gym" className={link}>Zero Gravity Fitness</Link>
            <Link to="/build" className={link}>Build Here</Link>
            <Link to="/about" className={link}>About</Link>
            <Link to="/careers" className={link}>Careers</Link>
            <Link to={user ? "/account" : "/login"} className={link}>{user ? "Account" : "Member login"}</Link>
          </div>
          <div>
            <div className={head}>Legal</div>
            <Link to="/privacy" className={link}>Privacy</Link>
            <Link to="/terms" className={link}>Terms</Link>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[rgba(243,237,226,0.12)] pt-6 text-[13px] text-az-muted md:flex-row md:justify-between">
          <span>© {new Date().getFullYear()} A-Z Enterprises</span>
          <span>{AI_LINE}</span>
        </div>
      </div>
    </footer>
  );
}
