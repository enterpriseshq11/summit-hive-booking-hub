import { Link } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { AzVideo, AI_LINE } from "@/components/az/AzVideo";
import { Reveal } from "@/components/az/Reveal";
import { InquiryForm } from "@/components/az/InquiryForm";
import { MEDIA, FAMILY_HUB_URL, GYM_OG_IMAGE, GYM_TV_IMAGE, SITE_URL } from "@/components/az/media";

/**
 * /gym, Zero Gravity Fitness.
 * Display copy only. Nothing on this page sells, charges, or books. The only write is the
 * gym list form, which inserts one row into leads and sends nothing to anyone.
 */

const STEPS = [
  { n: "1", title: "Get your kid a day pass.", text: "Every kid gets their own pass. Day passes live on The Family Hub Landing Zone site." },
  { n: "2", title: "Add The Window.", text: "Staffed child watch, 5 to 9 PM. Ages 3 and up, potty trained.", spectrum: true },
  { n: "3", title: "Add the gym for $4.", text: "Adults 18 and up, with a signed waiver." },
  { n: "4", title: "Watch them from the gym.", text: "The play floor is live on the gym TV. You are in the same building the whole time." },
];

const BENEFITS = [
  { title: "No sitter to book.", text: "The Window is staffed child watch. Your workout does not depend on lining up a sitter." },
  { title: "Your workout is back on.", text: "Same night, same building. No driving across town and no cutting it short." },
  { title: "Eyes on them the whole time.", text: "Look up between sets and there they are, live on the gym TV." },
  { title: "They burn energy. So do you.", text: "Everybody goes home tired. Bedtime gets a lot easier." },
];

const RULES = [
  "You stay in the building the whole time. The Window is never drop-off.",
  "The Window is for kids 3 and up who are potty trained. Staff do not change diapers.",
  "The gym is for adults 18 and up, with a signed waiver.",
  "The Window runs Wednesday to Sunday, 5 to 9 PM, and Saturday mornings, 10 AM to 1 PM.",
];

const INCLUDED = [
  { title: "Zero Gravity Fitness", text: "The gym floor on the ground level." },
  { title: "Infrared sauna", text: "Finish your workout with heat." },
  { title: "The Gaming Room", text: "Second floor." },
  { title: "The Hive Coworking", text: "Second floor. Bring the laptop." },
  { title: "Voice Vault podcast room", text: "Second floor." },
];

const PLANS = [
  { name: "Gym day pass", amount: "$9", per: "per visit", access: "One visit, everything below included.", hot: false },
  { name: "Membership", amount: "$65", per: "a month", access: "7 AM to 9 PM access.", hot: false },
  { name: "Membership, any hour", amount: "$89", per: "a month", access: "24/7 access.", hot: true },
];

const FAQ = [
  { q: "Do I need a kid's pass to use the gym?", a: "No. With your kids during child watch, the gym is $4 on top of their day pass. On your own, it is the $9 gym day pass or a membership." },
  { q: "Can I leave the building while my kids are in The Window?", a: "No. You stay in the building the whole time. That is the rule, every time." },
  { q: "What comes with the $9 day pass?", a: "The gym, the infrared sauna, and the second floor: the Gaming Room, The Hive coworking space, and the Voice Vault podcast room." },
  { q: "What is the difference between the two memberships?", a: "Same access to everything. $65 a month gets you in from 7 AM to 9 PM. $89 a month gets you in any hour, 24/7." },
  { q: "When can I start?", a: "We open the doors when every approval is in hand. Not a day before. Get on the list and you hear it first." },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: "Zero Gravity Fitness",
  url: `${SITE_URL}/gym`,
  image: GYM_OG_IMAGE,
  parentOrganization: { "@type": "Organization", name: "A-Z Enterprises", url: SITE_URL },
  address: {
    "@type": "PostalAddress",
    streetAddress: "10 W. Auglaize St.",
    addressLocality: "Wapakoneta",
    addressRegion: "OH",
    postalCode: "45895",
    addressCountry: "US",
  },
};

const btnPrimary =
  "inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md bg-az-gold px-7 text-[17px] font-semibold text-az-ink transition-colors hover:bg-az-goldlight";
const btnGhost =
  "inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md border-[1.5px] border-[rgba(243,237,226,0.5)] px-7 text-[17px] font-semibold text-az-paper transition-colors hover:border-az-goldlight hover:text-az-goldlight";

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function GymPage() {
  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="Zero Gravity Fitness | Work Out While Your Kids Play | Wapakoneta"
        description="The gym at 10 W. Auglaize St. Add the gym to your kid's day pass for $4 during child watch, or come on your own: $9 day pass with the infrared sauna, or memberships at $65 and $89 a month."
        canonicalPath="/gym"
        image={GYM_OG_IMAGE}
        jsonLd={jsonLd}
      />

      {/* HERO */}
      <section className="py-16 md:py-24">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 md:px-6 lg:flex-row lg:items-center">
          <div className="min-w-0 lg:flex-[0.9]">
            <p className="az-eyebrow mb-6">Zero Gravity Fitness · Ground floor</p>
            <h1 className="az-display text-[64px] sm:text-[88px] lg:text-[80px] xl:text-[112px]">
              They play.
              <br />
              <span className="text-az-gold">You train.</span>
            </h1>
            <p className="mt-7 max-w-[560px] text-[19px] leading-relaxed text-az-body md:text-[20px]">
              Zero Gravity Fitness is the gym on the ground floor of 10 W. Auglaize, under the same roof as The Family Hub Landing Zone. Bring the kids, add The Window, and get your workout in while staff watch them play. Here on your own? The gym is yours too.
            </p>
            <div className="mt-9 flex flex-col gap-3.5 sm:flex-row lg:flex-col xl:flex-row">
              <button type="button" onClick={() => scrollTo("join")} className={`${btnPrimary} whitespace-nowrap`}>
                Get on the gym list <ArrowDown className="h-5 w-5" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => scrollTo("prices")} className={`${btnGhost} whitespace-nowrap`}>
                See the prices
              </button>
            </div>
          </div>
          <figure className="min-w-0 lg:flex-[1.25]">
            <div className="mx-auto max-w-[400px] overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink md:hidden">
              <AzVideo
                src={MEDIA.gymVertical.src}
                webm={MEDIA.gymVertical.webm}
                poster={MEDIA.gymVertical.poster}
                label="Animated film: how the gym works from 5 to 9 PM. Kid day pass, add The Window, add the gym for $4, watch the kids on the gym TV. On your own: $9 gym day pass, or memberships at $65 and $89 a month."
                className="block aspect-[9/16] w-full object-cover"
              />
            </div>
            <div className="hidden overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink md:block">
              <AzVideo
                src={MEDIA.gym.src}
                webm={MEDIA.gym.webm}
                poster={MEDIA.gym.poster}
                label="Animated film: how the gym works from 5 to 9 PM. Kid day pass, add The Window, add the gym for $4, watch the kids on the gym TV. On your own: $9 gym day pass, or memberships at $65 and $89 a month."
                className="block aspect-video w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-center text-[13px] text-az-muted md:text-left">{AI_LINE}</figcaption>
          </figure>
        </div>
      </section>

      {/* TWO WAYS */}
      <section className="border-y border-[rgba(227,168,58,0.18)] bg-az-ink2 py-20 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5">Two ways in</p>
            <h2 className="az-display mb-11 text-[48px] md:text-[72px]">Bring the kids, or come alone.</h2>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2">
            <Reveal className="relative overflow-hidden rounded-[10px] border border-[rgba(243,237,226,0.16)] bg-az-ink3 p-7 md:p-9">
              <span className="az-spectrum-bg absolute inset-x-0 top-0 h-1" aria-hidden="true" />
              <p className="text-[12px] uppercase tracking-[0.2em] text-az-muted">With your kids · Wednesday to Sunday, 5 to 9 PM</p>
              <p className="mt-4 flex items-baseline gap-3">
                <span className="az-display text-[96px] leading-[0.85] text-az-gold md:text-[120px]">$4</span>
                <span className="text-[18px] text-az-soft">gym add-on</span>
              </p>
              <p className="mt-4 text-[17px] leading-relaxed text-az-body">Added to your kid's day pass and The Window. They play upstairs with staff watching. You train downstairs and watch them on the gym TV.</p>
              <button type="button" onClick={() => scrollTo("night")} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-az-goldlight">
                How the night works <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </Reveal>
            <Reveal delay={90} className="rounded-[10px] border border-[rgba(227,168,58,0.35)] bg-az-ink3 p-7 md:p-9">
              <p className="text-[12px] uppercase tracking-[0.2em] text-az-muted">On your own · Adults 18 and up</p>
              <p className="mt-4 flex items-baseline gap-3">
                <span className="az-display text-[96px] leading-[0.85] text-az-gold md:text-[120px]">$9</span>
                <span className="text-[18px] text-az-soft">gym day pass</span>
              </p>
              <p className="mt-4 text-[17px] leading-relaxed text-az-body">The gym, the infrared sauna, and the second floor. Or make it a habit with a membership at $65 or $89 a month.</p>
              <button type="button" onClick={() => scrollTo("prices")} className="mt-6 inline-flex items-center gap-1.5 font-semibold text-az-goldlight">
                See what is included <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </Reveal>
          </div>
        </div>
      </section>

      {/* HOW THE NIGHT WORKS */}
      <section id="night" className="scroll-mt-20 py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5">With your kids · 5 to 9 PM</p>
            <h2 className="az-display mb-12 text-[48px] md:text-[80px]">How the night works</h2>
          </Reveal>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 80} className="relative overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.25)] bg-az-ink3 p-7">
                {s.spectrum && <span className="az-spectrum-bg absolute inset-x-0 top-0 h-1" aria-hidden="true" />}
                <div className="az-display text-[64px] leading-none text-az-gold">{s.n}</div>
                <h3 className="mt-4 text-[22px] font-semibold leading-snug text-az-paper">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-az-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
          <p className="mt-8 text-[16px] text-az-soft">
            Kid day passes and The Window live on{" "}
            <a href={FAMILY_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-az-goldlight underline underline-offset-4">
              The Family Hub Landing Zone site <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </p>
        </div>
      </section>

      {/* THE GYM TV */}
      <section className="border-y border-[rgba(227,168,58,0.18)] bg-az-ink2 py-20 md:py-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 md:px-6 lg:flex-row lg:items-center">
          <Reveal className="min-w-0 lg:flex-1">
            <p className="az-eyebrow mb-5">Eyes on them the whole time</p>
            <h2 className="az-display text-[52px] md:text-[84px]">
              Watch them
              <br />
              <span className="text-az-gold">from the gym.</span>
            </h2>
            <p className="mt-6 max-w-[560px] text-[19px] leading-[1.65] text-az-body">
              The play floor is live on the TV in the gym during child watch. Look up between sets and there they are. No guessing, no checking your phone, no cutting the workout short.
            </p>
          </Reveal>
          <Reveal className="min-w-0 lg:flex-[1.15]" delay={120}>
            <figure>
              <img
                src={GYM_TV_IMAGE}
                alt="Illustration of the gym TV showing the play floor live, with kids on the slide, the soft play blocks, and the ball pit"
                className="block w-full rounded-[10px] border border-[rgba(227,168,58,0.3)]"
                loading="lazy"
                decoding="async"
                width={1200}
                height={840}
              />
              <figcaption className="mt-3 text-[13px] text-az-muted">Illustration. {AI_LINE}</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5">Why it works for parents</p>
            <h2 className="az-display mb-12 text-[48px] md:text-[80px]">Your hour. Their fun.</h2>
          </Reveal>
          <div className="grid gap-x-10 gap-y-9 md:grid-cols-2">
            {BENEFITS.map((b, i) => (
              <Reveal key={b.title} delay={(i % 2) * 90} className="flex gap-5">
                <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-az-gold">
                  <Check className="h-5 w-5 text-az-gold" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-[24px] font-semibold text-az-paper">{b.title}</span>
                  <span className="mt-1.5 block text-[17px] leading-relaxed text-az-soft">{b.text}</span>
                </span>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-16 rounded-[10px] border border-[rgba(227,168,58,0.4)] bg-az-ink3 p-7 md:p-10">
            <p className="az-eyebrow mb-4">The rules that keep it safe</p>
            <ul className="grid gap-3.5 md:grid-cols-2 md:gap-x-10">
              {RULES.map((r) => (
                <li key={r} className="flex gap-3 text-[17px] leading-relaxed text-az-paper">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-az-gold" aria-hidden="true" />
                  {r}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* PRICES */}
      <section id="prices" className="scroll-mt-20 bg-az-paper py-20 text-az-ink md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5 !text-az-golddark">Here on your own</p>
            <h2 className="az-display text-[52px] text-az-ink md:text-[88px]">The gym is yours too.</h2>
            <p className="mt-5 max-w-[680px] text-[19px] leading-[1.6] text-az-onpaper">
              No kids with you? Every option below gets you the gym, the infrared sauna, and the second floor.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {PLANS.map((p, i) => (
              <Reveal
                key={p.name}
                delay={i * 80}
                className={`relative rounded-[12px] p-7 md:p-8 ${p.hot ? "bg-az-ink text-az-paper" : "border border-az-paperline bg-az-paper2"}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={`text-[13px] font-semibold uppercase tracking-[0.2em] ${p.hot ? "text-az-goldlight" : "text-az-golddark"}`}>{p.name}</p>
                  {p.hot && (
                    <span className="rounded-md bg-az-gold px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.16em] text-az-ink">Any hour</span>
                  )}
                </div>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className={`az-display text-[96px] leading-[0.85] ${p.hot ? "text-az-gold" : "text-az-ink"}`}>{p.amount}</span>
                  <span className={`text-[17px] ${p.hot ? "text-az-soft" : "text-az-onpapermuted"}`}>{p.per}</span>
                </p>
                <p className={`mt-4 text-[18px] font-semibold ${p.hot ? "text-az-paper" : "text-az-ink"}`}>{p.access}</p>
              </Reveal>
            ))}
          </div>

          <Reveal className="mt-10 rounded-[12px] border border-az-paperline bg-az-paper2 p-7 md:p-9">
            <p className="text-[13px] font-semibold uppercase tracking-[0.2em] text-az-golddark">Every option includes</p>
            <ul className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-5">
              {INCLUDED.map((x) => (
                <li key={x.title} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-az-golddark" aria-hidden="true" />
                  <span>
                    <span className="block text-[17px] font-semibold text-az-ink">{x.title}</span>
                    <span className="block text-[15px] text-az-onpapermuted">{x.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <p className="mt-8 text-[17px] text-az-onpaper">
            With your kids during child watch, the gym is a <b className="font-semibold text-az-ink">$4 add-on</b> to their day pass.
          </p>
        </div>
      </section>

      {/* JOIN */}
      <section id="join" className="scroll-mt-20 bg-az-paper pb-20 text-az-ink md:pb-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 border-t border-az-paperline px-5 pt-16 md:px-6 md:pt-20 lg:flex-row">
          <div className="min-w-0 lg:flex-1">
            <p className="az-eyebrow mb-5 !text-az-golddark">Get on the list</p>
            <h2 className="az-display text-[48px] text-az-ink md:text-[80px]">Hear first when the gym opens.</h2>
            <p className="mt-6 text-[18px] leading-relaxed text-az-onpaper">
              We open the doors when every approval is in hand. Not a day before. Tell us how you want to use the gym and a real person from A-Z reaches out. Nothing automated.
            </p>
          </div>
          <div className="min-w-0 lg:flex-[1.3]">
            <InquiryForm kind="gym" />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[880px] px-5 md:px-6">
          <p className="az-eyebrow mb-5">Straight answers</p>
          <dl className="border-t border-[rgba(227,168,58,0.22)]">
            {FAQ.map((f) => (
              <div key={f.q} className="border-b border-[rgba(227,168,58,0.22)] py-6">
                <dt className="text-[20px] font-semibold">{f.q}</dt>
                <dd className="mt-2 text-[16px] leading-relaxed text-az-soft">{f.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 text-[17px] text-az-soft">
            Personal trainer?{" "}
            <Link to="/build" className="inline-flex items-center gap-1 font-semibold text-az-goldlight underline underline-offset-4">
              Run your training business here <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
