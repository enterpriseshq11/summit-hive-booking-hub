import React from 'react';
import { Check, MapPin, FileX, Clock, Dumbbell, Sparkles, Shield, Users, Wifi, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TrustItem = {
  icon: React.ReactNode;
  label: string;
};

// Preset trust items that can be mixed and matched
export const TRUST_ITEMS = {
  localTeam: { icon: <MapPin className="w-3.5 h-3.5" />, label: 'Local team' },
  noContracts: { icon: <FileX className="w-3.5 h-3.5" />, label: 'No contracts' },
  response24h: { icon: <Clock className="w-3.5 h-3.5" />, label: 'Response within 24 hours' },
  premiumEquipment: { icon: <Dumbbell className="w-3.5 h-3.5" />, label: 'Premium equipment' },
  premiumAmenities: { icon: <Sparkles className="w-3.5 h-3.5" />, label: 'Premium amenities' },
  secureCheckout: { icon: <Shield className="w-3.5 h-3.5" />, label: 'Secure checkout' },
  expertStaff: { icon: <Users className="w-3.5 h-3.5" />, label: 'Expert staff' },
  highSpeedWifi: { icon: <Wifi className="w-3.5 h-3.5" />, label: 'High-speed WiFi' },
  complimentaryCoffee: { icon: <Coffee className="w-3.5 h-3.5" />, label: 'Complimentary coffee' },
  noObligation: { icon: <Check className="w-3.5 h-3.5" />, label: 'No obligation' },
  cancelAnytime: { icon: <Check className="w-3.5 h-3.5" />, label: 'Cancel anytime' },
  access247: { icon: <Clock className="w-3.5 h-3.5" />, label: '24/7 Access' },
};

interface MicroTrustRowProps {
  items: TrustItem[];
  className?: string;
}

const MicroTrustRow: React.FC<MicroTrustRowProps> = ({ items, className }) => {
  return (
    <div className={cn(
      "flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground",
      className
    )}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1.5">
          <span className="text-accent">{item.icon}</span>
          <span className="flex items-center gap-1">
            <Check className="w-3 h-3 text-accent" />
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MicroTrustRow;
