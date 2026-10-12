import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SEOHead } from "@/components/seo";
import { InquiryForm } from "@/components/az/InquiryForm";
import { OG_IMAGE } from "@/components/az/media";

/** /spa while sauna and tanning are in the works. No prices, no services, no booking. */
export default function SpaHolding() {
  return (
    <div className="az-site overflow-x-hidden">
      <SEOHead
        title="The Spa at 10 W. Auglaize | A-Z Enterprises"
        description="Sauna and tanning are in the works at 10 W. Auglaize St. in downtown Wapakoneta. Leave your info and we will tell you when it is ready."
        canonicalPath="/spa"
        image={OG_IMAGE}
      />
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1080px] px-5 md:px-6">
          <p className="az-eyebrow mb-6">In the works</p>
          <h1 className="az-display text-[72px] sm:text-[96px] lg:text-[128px]">The Spa</h1>
          <p className="mt-6 max-w-[640px] text-[20px] leading-relaxed text-az-body">
            Sauna and tanning are in the works at 10 W. Auglaize. No bookings yet. Leave your info and we will tell you when it is ready.
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
