import { BUILD_TIMESTAMP_UTC } from "@/lib/build";

export function RouterDebugFooter() {
  const { pathname, search, hash } = window.location;

  return (
    <div className="fixed bottom-2 right-2 z-[70] max-w-[min(720px,calc(100vw-16px))] rounded-md border border-border bg-card/95 backdrop-blur px-3 py-2 text-[11px] leading-4 text-foreground shadow">
      <div className="grid grid-cols-[120px_1fr] gap-x-3 gap-y-0.5">
        <div className="text-muted-foreground">routerMode</div>
        <div className="font-medium">HashRouter</div>

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
  );
}
