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
}

const categoryColors: Record<string, string> = {
  revenue: "border-amber-500/30 bg-amber-500/5",
  leads: "border-zinc-700 bg-zinc-900/50",
  operations: "border-zinc-700 bg-zinc-900/50",
  team: "border-zinc-700 bg-zinc-900/50",
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
}: KpiTileProps) {
  const isAlert = config.title.includes("Overdue") || config.title.includes("Hot Leads");
  const alertStyle = isAlert && typeof value === "number" && value > 0;

  const content = (
    <Card
      className={cn(
        "transition-all hover:shadow-lg border",
        alertStyle ? "border-red-500/40 bg-red-500/5" : categoryColors[config.category],
        sizeClasses[config.size]
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
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-white" onClick={onRefresh}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {isOwner && onResize && (
              <Button
                variant="ghost" size="icon"
                className="h-6 w-6 text-zinc-500 hover:text-white"
                onClick={() => {
                  const sizes: Array<"small" | "medium" | "large"> = ["small", "medium", "large"];
                  const idx = sizes.indexOf(config.size);
                  onResize(sizes[(idx + 1) % sizes.length]);
                }}
              >
                {config.size === "large" ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
              </Button>
            )}
            {isOwner && onRemove && (
              <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-500 hover:text-red-400" onClick={onRemove}>
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
      </CardContent>
    </Card>
  );

  if (config.href) {
    return <Link to={config.href} className={sizeClasses[config.size]}>{content}</Link>;
  }

  return <div className={sizeClasses[config.size]}>{content}</div>;
}
