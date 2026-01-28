import { CalendarCheck, Headphones, ShieldCheck, Award } from "lucide-react";

const features = [
  { icon: CalendarCheck, label: "Easy Booking", description: "Book in minutes online" },
  { icon: Headphones, label: "Local Support", description: "Real people, fast responses" },
  { icon: ShieldCheck, label: "Secure Deposits", description: "Safe & transparent payments" },
  { icon: Award, label: "Premium Experience", description: "Quality you can count on" },
];

export function WhatsIncludedStrip() {
  return (
    <section className="py-16 bg-muted/30 border-y">
      <div className="container">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            What's Included at <span className="text-accent">A-Z</span>
          </h3>
          <p className="text-muted-foreground mt-2">Every booking comes with these guarantees</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="h-14 w-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all">
                <feature.icon className="h-7 w-7 text-accent" />
              </div>
              <h4 className="font-bold text-foreground mb-1">{feature.label}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
