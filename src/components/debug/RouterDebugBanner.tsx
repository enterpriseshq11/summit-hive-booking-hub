import { BUILD_TIMESTAMP_UTC } from "@/lib/build";

export function RouterDebugBanner() {
  const { href, pathname, search, hash } = window.location;

  return (
    <div className="sticky top-0 z-[80] w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto max-w-7xl px-3 py-2">
        <div className="grid grid-cols-1 gap-1 text-[12px] leading-4 md:grid-cols-[140px_1fr]">
          <div className="text-muted-foreground">routerMode</div>
          <div className="font-medium">HashRouter</div>

          <div className="text-muted-foreground">href</div>
          <div className="font-mono break-all">{href}</div>

          <div className="text-muted-foreground">pathname</div>
          <div className="font-mono break-all">{pathname}</div>

          <div className="text-muted-foreground">hash</div>
          <div className="font-mono break-all">{hash || "(empty)"}</div>

          <div className="text-muted-foreground">search</div>
          <div className="font-mono break-all">{search || "(empty)"}</div>

          <div className="text-muted-foreground">build</div>
          <div className="font-mono">{BUILD_TIMESTAMP_UTC}</div>
        </div>
      </div>
    </div>
  );
}
