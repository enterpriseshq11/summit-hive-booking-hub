import { type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface UnderHeroBookingCardProps {
  title: string;
  icon?: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function UnderHeroBookingCard({
  title,
  icon,
  description,
  className,
  children,
}: UnderHeroBookingCardProps) {
  return (
    <section className={cn("py-10 container", className)} aria-label={title}>
      <Card className="max-w-4xl mx-auto shadow-premium border-border relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-accent" />
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </CardTitle>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </CardHeader>
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </section>
  );
}
