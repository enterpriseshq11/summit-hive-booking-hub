import { CalendarCheck, Headphones, ShieldCheck, Award, Camera, Mic } from "lucide-react";
import { useIncludedItemsConfig } from "@/hooks/useIncludedItemsConfig";

const baseFeatures = [
  { icon: CalendarCheck, label: "Easy Booking", description: "Book in minutes online" },
  { icon: Headphones, label: "Local Support", description: "Real people, fast responses" },
  { icon: ShieldCheck, label: "Secure Deposits", description: "Safe & transparent payments" },
  { icon: Award, label: "Premium Experience", description: "Quality you can count on" },
];

const photoBoothFeature = { 
  icon: Camera, 
  label: "360 Photo Booth", 
  description: "Included with Summit events",
  key: "photoBooth" as const
};

const voiceVaultFeature = { 
  icon: Mic, 
  label: "Voice Vault", 
  description: "Podcast studio access",
  key: "voiceVault" as const
};

export function WhatsIncludedStrip() {
  const { data: config, isLoading } = useIncludedItemsConfig();

  // Build features array based on config
  const features = [...baseFeatures];
  
  if (!isLoading && config) {
    if (config.photoBoothEnabled) {
      features.push(photoBoothFeature);
    }
    if (config.voiceVaultEnabled) {
      features.push(voiceVaultFeature);
    }
  }

  // Adjust grid columns based on feature count
  const gridCols = features.length <= 4 
    ? "grid-cols-2 md:grid-cols-4" 
    : features.length === 5 
      ? "grid-cols-2 md:grid-cols-5" 
      : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6";

  return (
    <section className="py-16 bg-muted/30 border-y">
      <div className="container">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            What's Included at <span className="text-accent">A-Z</span>
          </h3>
          <p className="text-muted-foreground mt-2">Every booking comes with these guarantees</p>
        </div>
        
        <div className={`grid ${gridCols} gap-6 max-w-6xl mx-auto`}>
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
