import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, GripVertical, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { KpiTileConfig } from "@/hooks/useKpiData";

interface KpiTileProps {
  config: KpiTileConfig;
  value: string | number | ReactNode;
  subtitle?: string;
  pendingIntegration?: boolean;
  onRefresh?: () => void;
  onRemove?: () => void;
  onResize?: (size: "small" | "medium" | "large") => void;
  isDraggable?: boolean;
  dragHandleProps?: any;
  isOwner?: boolean;
  lastUpdated?: Date | null;
}

// Item 6: Category left-border color coding
const categoryBorderColors: Record<string, string> = {
  revenue: "border-l-amber-500",
  leads: "border-l-blue-500",
  operations: "border-l-green-500",
  team: "border-l-purple-500",
};

const categoryColors: Record<string, string> = {
  revenue: "bg-amber-500/5",
  leads: "bg-zinc-900/50",
  operations: "bg-zinc-900/50",
  team: "bg-zinc-900/50",
};

const categoryValueColors: Record<string, string> = {
  revenue: "text-amber-400",
  leads: "text-white",
  operations: "text-white",
  team: "text-white",
};

const sizeClasses: Record<string, string> = {
  small: "col-span-1",
  medium: "col-span-1 md:col-span-2",
  large: "col-span-1 md:col-span-3",
};

export function KpiTile({
  config,
  value,
  subtitle,
  pendingIntegration,
  onRefresh,
  onRemove,
  onResize,
  isDraggable,
  dragHandleProps,
  isOwner,
  lastUpdated,
}: KpiTileProps) {
  const isAlert = config.title.includes("Overdue") || config.title.includes("Hot Leads");
  const alertStyle = isAlert && typeof value === "number" && value > 0;

  // Item 35: data freshness indicator
  const getTimeSince = (date: Date | null | undefined) => {
    if (!date) return null;
    const mins = Math.floor((Date.now() - date.getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };
  const freshness = getTimeSince(lastUpdated);
  const isStale = lastUpdated ? (Date.now() - lastUpdated.getTime()) > 300000 : false;

  // Item 33: larger mobile tap target
  const content = (
    <Card
      className={cn(
        "transition-all hover:shadow-lg border border-zinc-700 border-l-[3px]",
        alertStyle ? "border-l-red-500 bg-red-500/5" : categoryBorderColors[config.category],
        alertStyle ? "" : categoryColors[config.category],
        sizeClasses[config.size],
        "min-h-[100px] md:min-h-0 active:scale-[0.98] transition-transform"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {isDraggable && isOwner && (
              <span {...dragHandleProps} className="cursor-grab text-zinc-500 hover:text-zinc-300">
                <GripVertical className="h-4 w-4" />
              </span>
            )}
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
              {config.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {pendingIntegration && (
              <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-400 px-1.5 py-0">
                Pending Integration
              </Badge>
            )}
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRefresh(); }}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {isOwner && onResize && (
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-white"
                onClick={(e) => {
                  e.preventDefault(); e.stopPropagation();
                  const sizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];
                  const idx = sizes.indexOf(config.size);
                  onResize(sizes[(idx + 1) % sizes.length]);
                }}
              >
                {config.size === "large" ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            )}
            {isOwner && onRemove && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-red-400" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className={cn(
          "text-2xl font-bold",
          alertStyle ? "text-red-400" : categoryValueColors[config.category]
        )}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
        {/* Item 35: freshness indicator */}
        {freshness && (
          <p className={cn("text-[10px] mt-1.5", isStale ? "text-amber-400" : "text-zinc-600")}>
            Updated {freshness}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (config.href) {
    return <Link to={config.href} className={sizeClasses[config.size]}>{content}</Link>;
  }

  return <div className={sizeClasses[config.size]}>{content}</div>;
}
