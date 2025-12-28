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
    <div className="min-h-screen py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back, {authUser?.profile?.first_name || "there"}!
          </p>
        </div>

        <Tabs defaultValue="bookings" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="bookings" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Documents</span>
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">Wallet</span>
            </TabsTrigger>
            <TabsTrigger value="membership" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Membership</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">My Bookings</h2>
              <Button asChild>
                <Link to="/booking">New Booking</Link>
              </Button>
            </div>

            {/* Upcoming Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming bookings</p>
                  <Button asChild variant="link" className="mt-2">
                    <Link to="/booking">Book your first experience</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Past Bookings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Past Bookings</CardTitle>
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
            <h2 className="text-xl font-semibold">Payments & Invoices</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Outstanding Balances</CardTitle>
                  <CardDescription>Payments due for your bookings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No outstanding balances</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Payment History</CardTitle>
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
            <h2 className="text-xl font-semibold">Documents</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pending Signatures</CardTitle>
                  <CardDescription>Documents requiring your signature</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending documents</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Signed Documents</CardTitle>
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
            <h2 className="text-xl font-semibold">Wallet & Gift Cards</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Wallet Balance</CardTitle>
                  <CardDescription>Credits and gift card balances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$0.00</div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Available for any A-Z service
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Redeem Gift Card</CardTitle>
                  <CardDescription>Add a gift card to your wallet</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
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
            <h2 className="text-xl font-semibold">Membership</h2>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Membership</CardTitle>
                <CardDescription>Manage your membership and benefits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-4">You don't have an active membership</p>
                  <Button asChild>
                    <Link to="/fitness">View Membership Options</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <h2 className="text-xl font-semibold">Account Settings</h2>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Profile Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.first_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.last_name || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <p className="text-muted-foreground">
                        {authUser?.email || "Not set"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <p className="text-muted-foreground">
                        {authUser?.profile?.phone || "Not set"}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline">Edit Profile</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notification Preferences</CardTitle>
                  <CardDescription>Control how we contact you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Email notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Booking confirmations and reminders
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS notifications</p>
                        <p className="text-sm text-muted-foreground">
                          Appointment reminders via text
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {authUser?.profile?.sms_opt_in ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing emails</p>
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
