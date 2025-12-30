import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  { name: "High-Speed Wi-Fi", privateOffice: true, dedicatedDesk: true, dayPass: true },
  { name: "Coffee Bar Access", privateOffice: true, dedicatedDesk: true, dayPass: true },
  { name: "Meeting Room Booking", privateOffice: true, dedicatedDesk: true, dayPass: true },
  { name: "Lockable Space", privateOffice: true, dedicatedDesk: false, dayPass: false },
  { name: "Business Address", privateOffice: true, dedicatedDesk: "Optional", dayPass: false },
  { name: "24/7 Access", privateOffice: true, dedicatedDesk: true, dayPass: false },
  { name: "Personal Storage", privateOffice: true, dedicatedDesk: true, dayPass: false },
  { name: "Priority Support", privateOffice: true, dedicatedDesk: false, dayPass: false },
];

export function PlanComparisonTable() {
  const renderCell = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-accent mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-muted-foreground/40 mx-auto" />;
    }
    return <span className="text-xs text-muted-foreground">{value}</span>;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg">Compare Options</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-medium text-muted-foreground">Feature</th>
                <th className="text-center p-4 font-semibold">Private Office</th>
                <th className="text-center p-4 font-semibold">Dedicated Desk</th>
                <th className="text-center p-4 font-semibold">Day Pass</th>
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr 
                  key={feature.name}
                  className={index % 2 === 0 ? "bg-muted/20" : ""}
                >
                  <td className="p-4 text-sm">{feature.name}</td>
                  <td className="p-4 text-center">{renderCell(feature.privateOffice)}</td>
                  <td className="p-4 text-center">{renderCell(feature.dedicatedDesk)}</td>
                  <td className="p-4 text-center">{renderCell(feature.dayPass)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
