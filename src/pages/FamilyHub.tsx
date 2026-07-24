import { useEffect } from "react";

// The Family Hub Landing Zone lives on its own site. Any internal
// /family-hub link routes visitors there instead of rendering here.
const EXTERNAL_URL = "https://thelandingzonewapak.com";

export default function FamilyHub() {
  useEffect(() => {
    window.location.replace(EXTERNAL_URL);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary text-white">
      <div className="text-center px-6">
        <p className="text-sm uppercase tracking-[0.3em] text-accent mb-3">
          Redirecting
        </p>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">
          Taking you to The Family Hub Landing Zone…
        </h1>
        <a
          href={EXTERNAL_URL}
          className="text-accent underline underline-offset-4 hover:opacity-80"
        >
          Continue to thelandingzonewapak.com →
        </a>
      </div>
    </div>
  );
}
