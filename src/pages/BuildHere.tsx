import { ArrowDown } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { AzVideo, AI_LINE } from "@/components/az/AzVideo";
import { Reveal } from "@/components/az/Reveal";
import { InquiryForm } from "@/components/az/InquiryForm";
import { MEDIA, OG_IMAGE } from "@/components/az/media";

const WAYS = [
  { n: "01", title: "Personal trainers", text: "Train your clients on the Zero Gravity Fitness floor. Your clients, your book, our building." },
  { n: "02", title: "Offices and suites", text: "A private office at The Hive Coworking, or a suite for a growing team." },
  { n: "03", title: "Wellness and services", text: "Licensed pros and services that families use. Tanning space is in the works." },
  { n: "04", title: "Classes and programs", text: "Teach a class, run a camp, or bring a program for kids into the building." },
  { n: "05", title: "Your idea", text: "Partner, sponsor, shop, or something we have not thought of. Pitch us.", dashed: true },
];

const STEPS = [
  { n: "1", title: "Tell us what you want to build", text: "Two minutes. The form is right below." },
  { n: "2", title: "Walk the building with us", text: "You see the space. We hear the plan. We both find out if it fits." },
  { n: "3", title: "Put it in writing", text: "Real numbers and a written agreement before anyone moves in." },
];

const FAQ = [
  { q: "What does space cost?", a: "It depends on the space and how you use it. You get real numbers after the walkthrough, not a guess on a website." },
  { q: "How long do I have to commit?", a: "Terms depend on the space. We lay them out in writing before you commit to anything." },
  { q: "Who am I talking to?", a: "The owners. A-Z Enterprises owns and runs this building, and we read every inquiry ourselves." },
];

export default function BuildHere() {
  const toForm = () => document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="Space for Your Business in Downtown Wapakoneta | A-Z Enterprises"
        description="Personal trainers, offices, wellness pros, and classes for kids. Tell us what you want to build at 10 W. Auglaize St."
        canonicalPath="/build"
        image={OG_IMAGE}
      />

      {/* HERO */}
      <section className="py-20 md:py-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-14 px-5 md:px-6 lg:flex-row lg:items-center">
          <div className="min-w-0 lg:flex-1">
            <p className="az-eyebrow mb-6">Build your business here</p>
            <h1 className="az-display text-[56px] sm:text-[76px] lg:text-[104px]">
              Bring your business
              <br />
              <span className="text-az-gold">under our roof.</span>
            </h1>
            <p className="mt-7 max-w-[560px] text-[19px] leading-relaxed text-az-body md:text-[20px]">
              10 W. Auglaize St. is about 24,000 square feet in downtown Wapakoneta with a family venue at its center. We are looking for people who want to build something here.
            </p>
            <button type="button" onClick={toForm} className="mt-9 inline-flex min-h-[54px] items-center gap-2 rounded-md bg-az-gold px-7 text-[17px] font-semibold text-az-ink transition-colors hover:bg-az-goldlight">
              Tell us what you want to build <ArrowDown className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <figure className="min-w-0 lg:flex-[1.2]">
            <div className="overflow-hidden rounded-[10px] border border-[rgba(227,168,58,0.3)] bg-az-ink">
              <AzVideo
                src={MEDIA.buildHere.src}
                webm={MEDIA.buildHere.webm}
                poster={MEDIA.buildHere.poster}
                label="Animated film: personal trainers, office space, wellness pros, classes for kids, and your idea, all welcome at 10 W. Auglaize St."
                className="block aspect-video w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 text-[13px] text-az-muted">{AI_LINE}</figcaption>
          </figure>
        </div>
      </section>

      {/* FIVE WAYS IN */}
      <section className="border-y border-[rgba(227,168,58,0.18)] bg-az-ink2 py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <Reveal>
            <p className="az-eyebrow mb-5">Who we want in the building</p>
            <h2 className="az-display mb-11 text-[48px] md:text-[72px]">Five ways in</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {WAYS.map((w, i) => (
              <Reveal
                key={w.n}
                delay={i * 70}
                className={`rounded-[10px] bg-az-ink3 p-6 ${w.dashed ? "border border-dashed border-[rgba(227,168,58,0.5)]" : "border border-[rgba(227,168,58,0.25)]"}`}
              >
                <div className="az-display text-[22px] font-extrabold text-az-gold">{w.n}</div>
                <h3 className="az-display mt-3 text-[28px] font-extrabold leading-none">{w.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-az-soft">{w.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1280px] px-5 md:px-6">
          <p className="az-eyebrow mb-8">How it works</p>
          <ol className="grid gap-10 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 90}>
                <div className="az-display text-[72px] leading-none text-az-gold">{s.n}</div>
                <h3 className="mt-3 text-[22px] font-semibold">{s.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-az-soft">{s.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* FORM */}
      <section id="form" className="scroll-mt-20 bg-az-paper py-20 text-az-ink md:py-28">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-5 md:px-6 lg:flex-row">
          <div className="min-w-0 lg:flex-1">
            <p className="az-eyebrow mb-5 !text-az-golddark">Start here</p>
            <h2 className="az-display text-[48px] text-az-ink md:text-[80px]">Tell us what you want to build.</h2>
            <p className="mt-6 text-[18px] leading-relaxed text-az-onpaper">A real person from A-Z reads every one of these and calls you back. Nothing automated.</p>
          </div>
          <div className="min-w-0 lg:flex-[1.4]">
            <InquiryForm kind="build" />
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
        </div>
      </section>
    </div>
  );
}
