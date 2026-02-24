import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useE3CoordinatorProfile, useE3Bookings } from "@/hooks/useE3";
import { CalendarDays, Plus, List, BarChart3, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function E3Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: coordinator } = useE3CoordinatorProfile();
  const { data: bookings = [] } = useE3Bookings();

  const activeHolds = (bookings as any[]).filter((b: any) => b.booking_state === "red_hold").length;
  const yellowContracts = (bookings as any[]).filter((b: any) => b.booking_state === "yellow_contract").length;
  const greenBooked = (bookings as any[]).filter((b: any) => b.booking_state === "green_booked").length;
  const totalCommission = (bookings as any[])
    .filter((b: any) => b.booking_state === "completed")
    .reduce((sum: number, b: any) => sum + Number(b.commission_amount || 0), 0);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">E³ Event System</h1>
          <p className="text-muted-foreground">
            {coordinator ? `Welcome, ${coordinator.first_name} ${coordinator.last_name}` : "Coordinator Dashboard"}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-red-600">{activeHolds}</div>
              <div className="text-xs text-muted-foreground">Active Holds</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{yellowContracts}</div>
              <div className="text-xs text-muted-foreground">Contracts</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-green-600">{greenBooked}</div>
              <div className="text-xs text-muted-foreground">Booked</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-accent">${totalCommission.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">MTD Commission</div>
            </CardContent>
          </Card>
        </div>

        {/* Tier */}
        {coordinator && (
          <Card className="mb-8">
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground">Current Commission Tier</div>
                <div className="text-lg font-bold">{((coordinator.current_tier_percent || 0.25) * 100).toFixed(0)}%</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Current Tier</div>
                <div className="text-lg font-bold">{((coordinator.current_tier_percent || 0.25) * 100).toFixed(0)}%</div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => navigate("/e3/submit")}>
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10"><Plus className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Submit Event</h3>
                <p className="text-sm text-muted-foreground">Create a new booking hold</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => navigate("/e3/events")}>
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10"><List className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">My Events</h3>
                <p className="text-sm text-muted-foreground">View and manage your bookings</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => navigate("/e3/calendar")}>
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10"><CalendarDays className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Calendar</h3>
                <p className="text-sm text-muted-foreground">Monthly availability view</p>
              </div>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:border-accent/50 transition-colors" onClick={() => navigate("/e3/admin/deposits")}>
            <CardContent className="py-6 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-accent/10"><Shield className="h-5 w-5 text-accent" /></div>
              <div>
                <h3 className="font-semibold">Admin: Deposits</h3>
                <p className="text-sm text-muted-foreground">Approve pending deposits</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
