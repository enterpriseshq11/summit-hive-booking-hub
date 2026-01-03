import { useEffect } from "react";

export default function DebugPing() {
  useEffect(() => {
    document.title = "Debug Ping | A-Z Booking Hub";
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="container py-10">
        <h1 className="text-2xl font-semibold">Debug Ping</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          If you can hard-refresh this route without a 404, deep-link rewrites are working.
        </p>
        <pre className="mt-6 rounded-md border border-border bg-card p-4 font-mono text-sm">OK</pre>
      </section>
    </main>
  );
}
