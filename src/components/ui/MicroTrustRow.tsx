import { Check, MapPin, FileX, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrustItem {
  icon: React.ReactNode;
  text: string;
}

interface MicroTrustRowProps {
  items?: TrustItem[];
  className?: string;
}

const defaultItems: TrustItem[] = [
  { icon: <MapPin className="w-3.5 h-3.5" />, text: "Local team" },
  { icon: <FileX className="w-3.5 h-3.5" />, text: "No contracts" },
  { icon: <Clock className="w-3.5 h-3.5" />, text: "Response within 24 hours" },
  { icon: <Award className="w-3.5 h-3.5" />, text: "Premium equipment" },
];

export function MicroTrustRow({ items = defaultItems, className }: MicroTrustRowProps) {
  return (
    <div className={cn(
      "flex flex-wrap justify-center gap-x-6 gap-y-2 mt-6",
      className
    )}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className="text-accent flex-shrink-0">
            {item.icon}
          </span>
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
