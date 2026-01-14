import { LogIn, RotateCw, Ticket, Trophy } from "lucide-react";

export function HowItWorks() {
  const steps = [
    { icon: LogIn, title: "Log In", desc: "Create a free account or sign in" },
    { icon: RotateCw, title: "Spin Daily", desc: "1 free spin per day (VIP gets 2)" },
    { icon: Ticket, title: "Earn Entries", desc: "Every spin adds to your entry pool" },
    { icon: Trophy, title: "Win Monthly", desc: "Winners drawn at end of each month" },
  ];

  return (
    <section className="py-10 bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <h2 className="text-xl font-bold text-center mb-6 text-white">How It Works</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/20 flex items-center justify-center">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="text-xs text-primary font-bold mb-1">STEP {i + 1}</div>
              <h3 className="font-semibold text-white text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
