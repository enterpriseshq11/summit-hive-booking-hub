import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { InquiryForm } from "@/components/az/InquiryForm";
import { OG_IMAGE } from "@/components/az/media";

/** /spa while tanning is in the works. The infrared sauna now comes with the gym (/gym). No prices, no services, no booking. */
export default function SpaHolding() {
  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="The Spa at 10 W. Auglaize | A-Z Enterprises"
        description="Tanning is in the works at 10 W. Auglaize St. in downtown Wapakoneta. The infrared sauna comes with every Zero Gravity Fitness pass and membership."
        canonicalPath="/spa"
        image={OG_IMAGE}
      />
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
          <p className="az-eyebrow mb-6">In the works</p>
          <h1 className="az-display text-[72px] sm:text-[96px] lg:text-[128px]">The Spa</h1>
          <p className="mt-6 max-w-[640px] text-[20px] leading-relaxed text-az-body">
            Tanning is in the works at 10 W. Auglaize. No bookings yet. Leave your info and we will tell you when it is ready.
          </p>
          <p className="mt-5 max-w-[640px] text-[18px] leading-relaxed text-az-soft">
            Looking for the infrared sauna? It comes with every Zero Gravity Fitness pass and membership.{" "}
            <Link to="/gym" className="inline-flex items-center gap-1 font-semibold text-az-goldlight underline underline-offset-4">
              See the gym <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
      <section className="bg-az-paper py-16 text-az-ink md:py-20">
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
          <InquiryForm kind="spa" />
          <p className="mt-8 text-[17px] text-az-onpaper">
            Licensed in wellness and want to run this space?{" "}
            <Link to="/build" className="inline-flex items-center gap-1 font-semibold text-az-golddark underline underline-offset-4">
              Build it here <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
