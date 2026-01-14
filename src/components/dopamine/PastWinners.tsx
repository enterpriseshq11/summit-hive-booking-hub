import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PAST_WINNERS = [
  { initials: "J.M.", month: "December 2025", prize: "Free Massage" },
  { initials: "S.K.", month: "December 2025", prize: "PT Session" },
  { initials: "A.R.", month: "November 2025", prize: "Grand Prize" },
  { initials: "T.L.", month: "November 2025", prize: "Free Massage" },
  { initials: "M.B.", month: "October 2025", prize: "PT Session" },
  { initials: "K.W.", month: "October 2025", prize: "Grand Prize" },
];

export function PastWinners() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-2xl font-bold mb-6 text-center text-white flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-primary" />
          Past Winners
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PAST_WINNERS.map((winner, i) => (
            <Card key={i} className="p-4 bg-zinc-800/50 border-zinc-700 text-center">
              <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="font-bold text-primary">{winner.initials}</span>
              </div>
              <Badge variant="outline" className="mb-1 border-primary/30 text-primary text-xs">
                {winner.prize}
              </Badge>
              <p className="text-xs text-muted-foreground">{winner.month}</p>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Could you be next? Spin daily to maximize your entries!
        </p>
      </div>
    </section>
  );
}
