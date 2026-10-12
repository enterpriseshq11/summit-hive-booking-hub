import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Building2, Dumbbell, Leaf, Users } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { SITE_CONFIG } from "@/config/siteConfig";
import { AzVideo, AI_LINE } from "@/components/az/AzVideo";
import { Reveal } from "@/components/az/Reveal";
import { MEDIA, FAMILY_HUB_URL, AZ_ESTATES_URL, SITE_URL, OG_IMAGE } from "@/components/az/media";

const btnPrimary =
  "inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md bg-az-gold px-7 text-[17px] font-semibold text-az-ink transition-colors hover:bg-az-goldlight";
const btnGhost =
  "inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md border-[1.5px] border-[rgba(243,237,226,0.5)] px-7 text-[17px] font-semibold text-az-paper transition-colors hover:border-az-goldlight hover:text-az-goldlight";

const FLOORS = [
  { n: "03", name: "Third floor.", text: "Open floor. Bring a plan and we will talk." },
  { n: "02", name: "Second floor.", text: "The Hive Coworking, Voice Vault Recording Studio, and the upstairs rooms of The Family Hub Landing Zone." },
  { n: "01", name: "First floor.", text: "The Family Hub Landing Zone. The whole floor." },
  { n: "G", name: "Ground floor.", text: "Zero Gravity Fitness, Elevated by Elyse, and more of The Family Hub Landing Zone." },
];

const LANES = [
  { icon: Dumbbell, title: "Personal trainers", text: "Train your clients inside Zero Gravity Fitness on the ground floor. You run your book. We run the building." },
  { icon: Building2, title: "Offices and suites", text: "Private offices at The Hive Coworking, from one desk to a full suite.", link: { to: "/the-hive", label: "See what is open" } },
  { icon: Leaf, title: "Wellness and services", text: "Tanning is in the works. Licensed in wellness or a service families use? Let us talk." },
  { icon: Users, title: "Classes and partners", text: "Run a class or a program for kids. Sponsor a room. Partner with us on something good for downtown." },
];

type Biz = { tag: string; name: string; text: string; cta: string; href?: string; to?: string; variant?: "anchor" | "dashed" };
const BUSINESSES: Biz[] = [
  { tag: "The anchor · Floors G, 1, 2", name: "The Family Hub Landing Zone", text: "Family venue for every age. Get on the list to hear first.", cta: "Visit thelandingzonewapak.com", href: FAMILY_HUB_URL, variant: "anchor" },
  { tag: "Ground floor", name: "Zero Gravity Fitness", text: "The gym in the building. Work out while your kids play, or come on your own.", cta: "See how it works", to: "/gym" },
  { tag: "Second floor", name: "The Hive Coworking", text: "Private offices and shared workspace downtown.", cta: "See open offices", to: "/the-hive" },
  { tag: "Second floor", name: "Voice Vault Recording Studio", text: "Book studio time for your podcast, voiceover, or music.", cta: "Book studio time", to: "/book-voice-vault" },
  { tag: "Ground floor · The Vault", name: "Elevated by Elyse", text: "The gift shop inside The Vault. Opens with The Family Hub Landing Zone.", cta: "Learn more", to: "/shop/elevated-by-elyse" },
  { tag: "In the works", name: "The Spa", text: "Tanning is in the works. The infrared sauna comes with every gym pass. Leave your info and we will tell you when tanning is ready.", cta: "Get notified", to: "/spa", variant: "dashed" },
  { tag: "Ohio and Kentucky", name: "A-Z Mobile Home Enterprises", text: "Mobile homes bought, renovated, and sold across Ohio and Kentucky.", cta: "Visit A-Z Estates", href: AZ_ESTATES_URL },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "A-Z Enterprises",
  url: SITE_URL,
  image: OG_IMAGE,
  telephone: SITE_CONFIG.contact.phone,
  email: SITE_CONFIG.contact.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 W. Auglaize St.",
    addressLocality: "Wapakoneta",
    addressRegion: "OH",
    postalCode: "45895",
    addressCountry: "US",
  },
};

function BizCard({ b }: { b: Biz }) {
  const external = !!b.href;
  const base = "group relative flex h-full flex-col overflow-hidden rounded-[10px] bg-az-ink3 p-7 text-az-paper transition-transform duration-300 hover:-translate-y-1";
  const border =
    b.variant === "anchor"
      ? "border border-[rgba(243,237,226,0.16)]"
      : b.variant === "dashed"
        ? "border border-dashed border-[rgba(227,168,58,0.45)]"
        : "border border-[rgba(227,168,58,0.25)] hover:border-[rgba(227,168,58,0.6)]";
  const inner = (
    <>
      {b.variant === "anchor" && <span className="az-spectrum-bg absolute inset-x-0 top-0 h-1" aria-hidden="true" />}
      <span className="text-[12px] uppercase tracking-[0.2em] text-az-muted">{b.tag}</span>
      <span className="az-display mt-3.5 text-[34px] leading-none">{b.name}</span>
      <span className="mt-3 flex-1 text-[16px] leading-relaxed text-az-soft">{b.text}</span>
      <span className="mt-5 inline-flex items-center gap-1.5 font-semibold text-az-goldlight">
        {b.cta} {external ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />}
      </span>
    </>
  );
  return external ? (
    <a href={b.href} target="_blank" rel="noopener noreferrer" className={`${base} ${border}`}>
      {inner}
    </a>
  ) : (
    <Link to={b.to!} className={`${base} ${border}`}>
      {inner}
    </Link>
  );
}

export default function HomePage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="A-Z Enterprises | 10 W. Auglaize St., Downtown Wapakoneta"
        description="A-Z Enterprises owns and runs 10 W. Auglaize St., home of The Family Hub Landing Zone and room for businesses that want to grow downtown."
        canonicalPath="/"
        image={OG_IMAGE}
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="relative flex min-h-[640px] items-center overflow-hidden md:min-h-[760px]">
        <AzVideo
          src={MEDIA.heroLoop.src}
          webm={MEDIA.heroLoop.webm}
          poster={MEDIA.heroLoop.poster}
          label="Animated drawing of the building at 10 W. Auglaize St. with its windows lighting up"
          className="absolute inset-0 h-full w-full object-cover opacity-[0.35] md:translate-x-[7%] md:opacity-100"
          objectPosition="72% 50%"
          posterOnNarrow
          decorative
          eager
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,11,9,0.95)_0%,rgba(12,11,9,0.8)_40%,rgba(12,11,9,0.15)_72%,rgba(12,11,9,0)_100%)]" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-az-ink to-transparent" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1280px] px-5 py-24 md:px-6">
          <div className="max-w-[740px]">
            <p className="az-eyebrow mb-6 animate-fade-in">10 W. Auglaize St. · Downtown Wapakoneta</p>
            <h1 className="az-display text-[56px] text-az-paper sm:text-[76px] lg:text-[84px] xl:text-[90px]">
              <span className="lg:whitespace-nowrap">Built by a family.</span>
              <br />
              <span className="text-az-gold">
                Built for <span className="lg:whitespace-nowrap">downtown Wapak.</span>
              </span>
            </h1>
            <p className="mt-7 max-w-[560px] text-[19px] leading-relaxed text-az-body md:text-[20px]">
              A-Z Enterprises owns and runs the building at 10 W. Auglaize. The Family Hub Landing Zone is the anchor. The rest of the building is for businesses that want to grow downtown, and there is room for yours.
            </p>
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
              <Link to="/build" className={btnPrimary}>
                Build your business here <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <a href="#building" className={btnGhost}>See the building</a>
            </div>
          </div>
        </div>
        <p className="absolute inset-x-0 bottom-3 px-5 text-center text-[12px] text-[rgba(243,237,226,0.66)]">{AI_LINE}</p>
      </section>

      {/* PROOF STRIP */}
      <section className="border-y border-[rgba(227,168,58,0.18)] bg-az-ink2">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-5 py-10 sm:grid-cols-2 md:px-6 lg:grid-cols-4">
          {[
            ["24,000", "square feet in the heart of \ndowntown Wapak"],
            ["4 FLOORS", "and an elevator to every one of them"],
            ["1 ANCHOR", "a family venue running through three floors"],
            ["FAMILY-RUN", "you deal with the people who own the building"],
          ].map(([big, small], i) => (
            <Reveal key={big} delay={i * 80}>
              <div className="az-display text-[48px] leading-none text-az-gold md:text-[52px]">{big}</div>
              <div className="mt-2 text-[15px] text-az-soft">{small}</div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* THE BUILDING */}
      <section id="building" className="scroll-mt-20 py-24 md:py-32">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-5 md:px-6 lg:flex-row lg:items-center">
          <Reveal className="min-w-0 lg:flex-[1]">
            <p className="az-eyebrow mb-5">The building</p>
            <h2 className="az-display text-[52px] md:text-[80px]">
              One building.
              <br />
              Four floors.
              <br />
              <span className="mt-2 block font-azi text-[0.56em] font-normal normal-case italic leading-[1.15] text-az-goldlight">One family running it.</span>
            </h2>
            <p className="mt-6 text-[19px] leading-[1.65] text-az-body">
              About 24,000 square feet over four levels, with an elevator to every floor. The Family Hub Landing Zone runs through three of them. The rest is fitness, offices, a recording studio, a shop, and open space waiting on the right plan.
            </p>
            <ul className="mt-8 border-t border-[rgba(227,168,58,0.22)]">
              {FLOORS.map((f) => (
                <li key={f.n} className="flex gap-5 border-b border-[rgba(227,168,58,0.22)] py-4">
                  <span className="az-display w-11 shrink-0 text-[30px] font-extrabold text-az-gold">{f.n}</span>
                  <span className="text-[17px] leading-normal text-az-paper">
                    <b className="font-semibold">{f.name}</b> {f.text}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="min-w-0 lg:flex-[1.35]" delay={120}>
            <figure>
              <div className="overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink">
                <AzVideo
                  src={MEDIA.building.src}
                  webm={MEDIA.building.webm}
                  poster={MEDIA.building.poster}
                  label="Animated cross-section of the four floors at 10 W. Auglaize St., showing The Family Hub Landing Zone across three floors and room for new businesses"
                  className="block aspect-video w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[13px] leading-normal text-az-muted">Illustration. Not to scale. {AI_LINE}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* THE ANCHOR */}
      <section className="relative bg-az-ink2 py-24 md:py-28">
        <div className="az-spectrum-bg absolute inset-x-0 top-0 h-[3px]" aria-hidden="true" />
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 md:px-6 lg:flex-row lg:items-end lg:justify-between">
          <Reveal className="min-w-0 lg:flex-1">
            <p className="az-eyebrow mb-5">The anchor</p>
            <h2 className="az-display az-spectrum-text text-[56px] md:text-[96px]">
              The Family Hub
              <br />
              Landing Zone
            </h2>
            <p className="mt-6 max-w-[620px] text-[19px] leading-[1.65] text-az-body">
              A family venue built for every age under one roof, from toddlers to teenagers to the grandparents who bring them. It is the reason families will be walking these halls, and the heart of everything else in the building.
            </p>
            <p className="mt-5 font-azi text-[22px] italic text-az-goldlight">Small Steps. Giant Memories. Built For Every Family.</p>
          </Reveal>
          <Reveal className="w-full rounded-[10px] border border-[rgba(243,237,226,0.22)] bg-az-ink p-8 lg:max-w-[420px]" delay={120}>
            <p className="text-[18px] leading-relaxed text-az-paper">We open the doors when every approval is in hand. Not a day before. Get on the list and you hear it first.</p>
            <a href={FAMILY_HUB_URL} target="_blank" rel="noopener noreferrer" className={`${btnGhost} mt-6 w-full whitespace-nowrap px-5 text-[15px]`}>
              Visit The Family Hub Landing Zone <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </Reveal>
        </div>
      </section>

      {/* THE GYM */}
      <section id="gym" className="scroll-mt-20 py-24 md:py-32">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-5 md:px-6 lg:flex-row lg:items-center">
          <Reveal className="min-w-0 lg:flex-[0.9]">
            <p className="az-eyebrow mb-5">Zero Gravity Fitness</p>
            <h2 className="az-display text-[56px] md:text-[96px]">
              They play.
              <br />
              <span className="text-az-gold">You train.</span>
            </h2>
            <p className="mt-6 text-[19px] leading-[1.65] text-az-body">
              A real gym in this building, built for parents. Racks, free weights, machines, and cardio. During child watch, add the gym to your kid's day pass for $4 and watch them on the gym TV while you work out. Here on your own? $9 gets you the gym, the infrared sauna, and the second floor.
            </p>
            <ul className="mt-7 flex flex-wrap gap-2.5" aria-label="Gym prices">
              {[
                ["$4", "with your kids"],
                ["$9", "day pass"],
                ["$65", "a month"],
                ["$89", "a month, 24/7"],
              ].map(([amt, what]) => (
                <li key={what} className="inline-flex items-baseline gap-2 rounded-full border border-[rgba(227,168,58,0.4)] px-4 py-2">
                  <span className="az-display text-[24px] leading-none text-az-gold">{amt}</span>
                  <span className="text-[14px] text-az-soft">{what}</span>
                </li>
              ))}
            </ul>
            <Link to="/gym" className={`${btnPrimary} mt-8`}>
              See how the gym works <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </Reveal>
          <Reveal className="min-w-0 lg:flex-[1.3]" delay={120}>
            <figure>
              <div className="overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink">
                <AzVideo
                  src={MEDIA.gymReal.src}
                  webm={MEDIA.gymReal.webm}
                  poster={MEDIA.gymReal.poster}
                  label="Real footage walking through Zero Gravity Fitness: power racks, free weights, machines, and cardio under honeycomb LED lights."
                  className="block aspect-video w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[13px] text-az-muted">Real footage from inside Zero Gravity Fitness.</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* BUILD HERE */}
      <section id="build" className="scroll-mt-20 bg-az-paper py-24 text-az-ink md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <div className="flex flex-col gap-14 lg:flex-row lg:items-center">
            <Reveal className="min-w-0 lg:flex-1">
              <p className="az-eyebrow mb-5 !text-az-golddark">Build your business here</p>
              <h2 className="az-display text-[56px] text-az-ink md:text-[88px]">
                We have room.
                <br />
                Bring the business.
              </h2>
              <p className="mt-6 text-[19px] leading-[1.65] text-az-onpaper">
                We want this building full of people doing good work for this town. If you train, teach, heal, sell, or run a business that serves families, there may be a spot for you here.
              </p>
              <Link to="/build" className="mt-8 inline-flex min-h-[54px] items-center gap-2 rounded-md bg-az-ink px-7 text-[17px] font-semibold text-az-goldlight transition-opacity hover:opacity-90">
                Tell us what you want to build <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Reveal>
            <Reveal className="min-w-0 lg:flex-[1.2]" delay={120}>
              <figure>
                <div className="overflow-hidden rounded-[10px] bg-az-ink">
                  <AzVideo
                    src={MEDIA.buildHere.src}
                    webm={MEDIA.buildHere.webm}
                    poster={MEDIA.buildHere.poster}
                    label="Animated film: personal trainers, office space, wellness pros, classes for kids, and your idea, all welcome at 10 W. Auglaize St."
                    className="block aspect-video w-full object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-[13px] text-az-onpapermuted">{AI_LINE}</figcaption>
              </figure>
            </Reveal>
          </div>
          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANES.map((l, i) => (
              <Reveal key={l.title} delay={i * 80} className="rounded-[10px] border border-az-paperline bg-az-paper2 p-7">
                <l.icon className="h-9 w-9 text-az-golddark" strokeWidth={1.6} aria-hidden="true" />
                <h3 className="az-display mt-5 text-[30px] font-extrabold">{l.title}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-az-onpaper">
                  {l.text}{" "}
                  {l.link && (
                    <Link to={l.link.to} className="font-semibold text-az-golddark underline underline-offset-4">
                      {l.link.label}
                    </Link>
                  )}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESSES */}
      <section id="businesses" className="scroll-mt-20 py-24 md:py-32">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5">Under one roof</p>
            <h2 className="az-display mb-12 text-[48px] md:text-[80px]">The A-Z family of businesses</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BUSINESSES.map((b, i) => (
              <Reveal key={b.name} delay={(i % 4) * 70} className={i === 0 ? "sm:col-span-2" : ""}>
                <BizCard b={b} />
              </Reveal>
            ))}
            <Reveal delay={140} className="sm:col-span-2 lg:col-span-4">
              <Link to="/build" className="group flex h-full flex-col gap-4 rounded-[10px] bg-az-gold p-7 text-az-ink transition-colors hover:bg-az-goldlight md:flex-row md:items-center md:justify-between md:p-9">
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.2em] text-[#3A2A08]">Open space</span>
                  <span className="az-display mt-3 block text-[44px] leading-[0.95] md:text-[56px]">Your business here</span>
                </span>
                <span className="inline-flex items-center gap-2 text-[17px] font-semibold">
                  Tell us what you want to build <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="scroll-mt-20 border-t border-[rgba(227,168,58,0.18)] bg-az-ink2 py-24 md:py-32">
        <div className="mx-auto flex max-w-[1280px] flex-col-reverse gap-14 px-5 md:px-6 lg:flex-row lg:items-center">
          <Reveal className="min-w-0 lg:flex-[1.1]">
            <figure>
              <div className="overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink">
                <AzVideo
                  src={MEDIA.origin.src}
                  webm={MEDIA.origin.webm}
                  poster={MEDIA.origin.poster}
                  label="Animated film: the letters A, Dash, Z come together for three kids, oldest to youngest, and the building they inspired"
                  className="block aspect-video w-full object-cover"
                />
              </div>
              <figcaption className="mt-3 text-[13px] text-az-muted">{AI_LINE}</figcaption>
            </figure>
          </Reveal>
          <Reveal className="min-w-0 lg:flex-1" delay={120}>
            <p className="az-eyebrow mb-5">Why A-Z</p>
            <h2 className="az-display text-[52px] md:text-[80px]">
              The name is
              <br />
              our kids.
            </h2>
            <p className="mt-6 text-[19px] leading-[1.65] text-az-body">
              A, Dash, Z. Our three kids, oldest to youngest. We are raising a toddler and two teenagers under one roof, and we wanted one place in town that worked for all three of them. So we bought a building and started building it.
            </p>
            <p className="mt-5 font-azi text-[22px] italic text-az-goldlight">Dylan and Elyse Legge</p>
            <Link to="/about" className={`${btnGhost} mt-8 text-[16px]`}>
              Read our story <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
