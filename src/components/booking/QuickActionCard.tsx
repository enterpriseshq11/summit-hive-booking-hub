import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface QuickActionCardProps {
  to?: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  dataEvent?: string;
}

export function QuickActionCard({ to, href, icon: Icon, title, description, dataEvent }: QuickActionCardProps) {
  const className = "group flex items-center gap-4 p-5 rounded-xl border border-border/50 bg-card hover:border-accent/50 hover:shadow-premium-hover transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";
  
  const content = (
    <>
      <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
        <Icon className="h-6 w-6 text-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground group-hover:text-accent transition-colors">
          {title}
        </p>
        <p className="text-sm text-muted-foreground truncate">
          {description}
        </p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        data-event={dataEvent}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      to={to || "/"}
      data-event={dataEvent}
      className={className}
    >
      {content}
    </Link>
  );
}