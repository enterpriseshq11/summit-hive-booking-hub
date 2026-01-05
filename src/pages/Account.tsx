import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  CalendarDays, 
  CreditCard, 
  FileText, 
  Wallet, 
  Users, 
  Gift,
  Clock,
  Settings,
  ArrowRight,
  Sparkles,
  Building2,
  Heart,
  Dumbbell,
  Plus
} from "lucide-react";

export default function Account() {
  const { authUser } = useAuth();

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">My Account</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {authUser?.profile?.first_name || "there"}!
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid bg-card border border-border">
            <TabsTrigger value="bookings" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="membership" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Membership</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-accent data-[state=active]:text-primary">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">My Bookings</h2>
              <Button asChild className="bg-accent text-primary hover:bg-accent/90">
                <Link to="/book">New Booking</Link>
              </Button>
            </div>

            {/* Upcoming Bookings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <CalendarDays className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground mb-4">No upcoming bookings</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Ready to book your next experience? Explore our venues, spa, or fitness classes.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button asChild variant="outline" size="sm" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                      <Link to="/summit" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Events
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                      <Link to="/spa" className="gap-2">
                        <Heart className="h-4 w-4" />
                        Spa
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                      <Link to="/fitness" className="gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Fitness
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Past Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No past bookings</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Your booking history will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Payments & Invoices</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Outstanding Balances</CardTitle>
                  <CardDescription>Payments due for your bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-muted-foreground">No outstanding balances</p>
                    <p className="text-sm text-muted-foreground mt-2">You're all caught up!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No payment history</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Transactions will appear after your first booking
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Documents</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Pending Signatures</CardTitle>
                  <CardDescription>Documents requiring your signature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-muted-foreground">No pending documents</p>
                    <p className="text-sm text-muted-foreground mt-2">You're all set!</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Signed Documents</CardTitle>
                  <CardDescription>Your completed agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No signed documents</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Contracts and waivers will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Wallet & Gift Cards</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Wallet Balance</CardTitle>
                  <CardDescription>Credits and gift card balances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-accent mb-2">$0.00</div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Available for any A-Z service
                  </p>
                  <Button asChild className="bg-accent hover:bg-accent/90 text-primary">
                    <Link to="/gift-cards" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Add Credits
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Redeem Gift Card</CardTitle>
                  <CardDescription>Enter a gift card code to add funds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter gift card code" 
                      className="flex-1"
                    />
                    <Button variant="outline" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                      Redeem
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gift card codes are 16 characters and included in your email.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Credit History */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Credit History</CardTitle>
                <CardDescription>Past gift card redemptions and credit usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Gift className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No credit history yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Credits and gift card usage will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Membership Tab */}
          <TabsContent value="membership" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Membership</h2>
            
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Your Membership</CardTitle>
                <CardDescription>Manage your membership and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="h-16 w-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <p className="text-muted-foreground mb-2">You don't have an active membership</p>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Join Total Fitness for 24/7 gym access, classes, and personal training.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button asChild className="bg-accent text-primary hover:bg-accent/90">
                      <Link to="/fitness" className="gap-2">
                        <Dumbbell className="h-4 w-4" />
                        Gym Membership
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                      <Link to="/coworking" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Coworking Plans
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Account Settings</h2>
            
            <div className="grid gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">First Name</label>
                      <p className="text-foreground">
                        {authUser?.profile?.first_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                      <p className="text-foreground">
                        {authUser?.profile?.last_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="text-foreground">
                        {authUser?.email || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="text-foreground">
                        {authUser?.profile?.phone || "Not set"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-accent/30 hover:border-accent hover:bg-accent/10">
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Notification Preferences</CardTitle>
                  <CardDescription>Control how we contact you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div>
                        <p className="font-medium text-foreground">Email notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Booking confirmations and reminders
                        </p>
                      </div>
                      <span className="text-sm text-accent font-medium">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-border">
                      <div>
                        <p className="font-medium text-foreground">SMS notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Appointment reminders via text
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {authUser?.profile?.sms_opt_in ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-foreground">Marketing emails</p>
                        <p className="text-sm text-muted-foreground">
                          News and updates from A-Z Enterprises
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {authUser?.profile?.marketing_opt_in ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
