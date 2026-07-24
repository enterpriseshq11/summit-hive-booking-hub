import { useEffect } from "react";

const EXTERNAL_URL = "https://thelandingzonewapak.com/zero-gravity";

/**
 * Zero Gravity Fitness (formerly A-Z Total Fitness).
 * The gym now lives on the Landing Zone site. This route redirects there.
 */
export default function Fitness() {
  useEffect(() => {
    window.location.replace(EXTERNAL_URL);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center px-6">
        <h1 className="text-2xl font-bold mb-2">Redirecting to Zero Gravity Fitness…</h1>
        <p className="text-muted-foreground">
          If you are not redirected,{" "}
          <a href={EXTERNAL_URL} className="text-accent underline">
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
