import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { AzVideo, AI_LINE } from "@/components/az/AzVideo";
import { Reveal } from "@/components/az/Reveal";
import { MEDIA, FAMILY_HUB_URL, OG_IMAGE } from "@/components/az/media";

export default function About() {
  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="About A-Z Enterprises | Built by a Family"
        description="A-Z is our kids. A, Dash, Z. We bought 10 W. Auglaize St. in downtown Wapakoneta and started building it."
        canonicalPath="/about"
        image={OG_IMAGE}
      />

      <section className="pb-16 pt-20 md:pb-20 md:pt-28">
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
          <p className="az-eyebrow mb-6">About A-Z</p>
          <h1 className="az-display text-[64px] sm:text-[88px] lg:text-[120px]">
            Built by
            <br />
            <span className="text-az-gold">a family.</span>
          </h1>
        </div>
      </section>

      <section className="pb-20 md:pb-28">
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
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

          <div className="mx-auto mt-16 max-w-[720px] space-y-6 text-[20px] leading-[1.7] text-az-body">
            <Reveal as="p">
              A-Z is our kids. A, Dash, Z, oldest to youngest. We are raising a toddler and two teenagers under one roof, and we wanted one place in town that worked for all three of them, and for the parents and grandparents who bring them.
            </Reveal>
            <Reveal as="p">
              So in 2024 we bought the building at 10 W. Auglaize St. and started building it. The Family Hub Landing Zone is the heart of it. Around it we are putting businesses that make downtown a place people want to be.
            </Reveal>
          </div>

          <Reveal className="mx-auto mt-14 max-w-[820px] border-y border-[rgba(227,168,58,0.22)] py-10 text-center">
            <p className="font-azi text-[26px] italic leading-[1.5] text-az-paper md:text-[32px]">
              We are here to serve the community.
              <br />
              We want to see downtown Wapak thrive.
              <br />
              <span className="text-az-goldlight">We believe that we can all thrive inside the Hive.</span>
            </p>
            <p className="mt-8 text-[15px] font-semibold uppercase tracking-[0.2em] text-az-gold">Dylan and Elyse Legge, owners</p>
          </Reveal>

          <div className="mt-12 flex flex-col justify-center gap-3.5 sm:flex-row">
            <Link to="/build" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md bg-az-gold px-7 text-[17px] font-semibold text-az-ink transition-colors hover:bg-az-goldlight">
              Build your business here <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
            <a href={FAMILY_HUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[54px] items-center justify-center gap-2 rounded-md border-[1.5px] border-[rgba(243,237,226,0.5)] px-7 text-[17px] font-semibold text-az-paper transition-colors hover:border-az-goldlight hover:text-az-goldlight">
              Visit The Family Hub Landing Zone <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
