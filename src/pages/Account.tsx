import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { 
  CalendarDays, 
  CreditCard, 
  FileText, 
  Wallet, 
  Users, 
  Gift,
  Clock,
  Settings
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
            <TabsTrigger value="bookings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="membership" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Membership</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">My Bookings</h2>
              <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/book">New Booking</Link>
              </Button>
            </div>

            {/* Upcoming Bookings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming bookings</p>
                  <Button asChild variant="link" className="mt-2 text-primary">
                    <Link to="/book">Book your first experience</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg text-foreground">Past Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No past bookings</p>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No outstanding balances</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Payment History</CardTitle>
                  <CardDescription>Your recent transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No payment history</p>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending documents</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Signed Documents</CardTitle>
                  <CardDescription>Your completed agreements</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No signed documents</p>
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
                  <div className="text-3xl font-bold text-primary">$0.00</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for any A-Z service
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg text-foreground">Redeem Gift Card</CardTitle>
                  <CardDescription>Add a gift card to your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                    <Link to="/gift-cards">
                      <Gift className="h-4 w-4 mr-2" />
                      Redeem Gift Card
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
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
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">You don't have an active membership</p>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link to="/fitness">View Membership Options</Link>
                  </Button>
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
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.first_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.last_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <p className="text-muted-foreground">
                        {authUser?.email || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground">Phone</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.phone || "Not set"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
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
                      <span className="text-sm text-primary font-medium">Enabled</span>
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
                          Promotions and special offers
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
