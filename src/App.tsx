import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEffect } from "react";

// Pages
import Index from "./pages/Index";
import BookingHub from "./pages/BookingHub";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Summit from "./pages/Summit";
import Coworking from "./pages/Coworking";
import Spa from "./pages/Spa";
import Fitness from "./pages/Fitness";
import GiftCards from "./pages/GiftCards";
import Promotions from "./pages/Promotions";
import DopamineDrop from "./pages/DopamineDrop";
import Vip from "./pages/Vip";
import DopamineDropTerms from "./pages/DopamineDropTerms";
import Shop from "./pages/Shop";
import BeamLights from "./pages/BeamLights";
import VoiceVault from "./pages/VoiceVault";
import PhotoBooth from "./pages/PhotoBooth";
import PhotoBoothLanding from "./pages/PhotoBoothLanding";
import BookWithLindsey from "./pages/BookWithLindsey";
import NotFound from "./pages/NotFound";
import Careers from "./pages/Careers";
import CareersSpa from "./pages/careers/CareersSpa";
import CareersFitness from "./pages/careers/CareersFitness";
import CareersContracting from "./pages/careers/CareersContracting";

// Debug (public, never redirects)
import AuthDebug from "./pages/__debug/AuthDebug";
import DebugPing from "./pages/__debug/Ping";

// Admin Pages (unified under /admin/*)
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSchedule from "./pages/admin/Schedule";
import AdminApprovals from "./pages/admin/Approvals";
import AdminResources from "./pages/admin/Resources";
import AdminPackages from "./pages/admin/Packages";
import AdminPricingRules from "./pages/admin/PricingRules";
import AdminBlackouts from "./pages/admin/Blackouts";
import AdminDocuments from "./pages/admin/Documents";
import AdminReviews from "./pages/admin/Reviews";
import AdminLeadsWaitlists from "./pages/admin/LeadsWaitlists";
import AdminUsersRoles from "./pages/admin/UsersRoles";
import AdminAuditLog from "./pages/admin/AuditLog";
import AdminAssumptions from "./pages/admin/Assumptions";
import AdminPromotions from "./pages/admin/Promotions";
import AdminDopamineDrop from "./pages/admin/DopamineDrop";
import AdminVoiceVault from "./pages/admin/VoiceVault";
import AdminOfficeListings from "./pages/admin/OfficeListings";
import AdminOfficePhotos from "./pages/admin/OfficePhotos";
import AdminOfficePromotions from "./pages/admin/OfficePromotions";
import AdminOfficeInquiries from "./pages/admin/OfficeInquiries";
import AdminProviderSchedule from "./pages/admin/ProviderSchedule";
import AdminCareerApplications from "./pages/admin/CareerApplications";
// Command Center Pages (now unified under /admin/*)
import CommandCenterLeads from "./pages/command-center/Leads";
import CommandCenterLeadDetail from "./pages/command-center/LeadDetail";
import CommandCenterPipeline from "./pages/command-center/Pipeline";
import CommandCenterEmployees from "./pages/command-center/Employees";
import CommandCenterEmployeeDetail from "./pages/command-center/EmployeeDetail";
import CommandCenterActivity from "./pages/command-center/Activity";
import CommandCenterAlerts from "./pages/command-center/Alerts";
import CommandCenterRevenue from "./pages/command-center/Revenue";
import CommandCenterCommissions from "./pages/command-center/Commissions";
import CommandCenterSettings from "./pages/command-center/Settings";
import CommandCenterPayroll from "./pages/command-center/Payroll";

// Public Coworking Pages
import OfficeListingsHub from "./pages/coworking/OfficeListingsHub";
import OfficeDetailPage from "./pages/coworking/OfficeDetailPage";

const queryClient = new QueryClient();

function AppInner() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("ROUTER_HASH", window.location.hash);
  }, []);

  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        {/* Public debug routes (never protected) */}
        <Route path="/__debug/auth" element={<AuthDebug />} />
        <Route path="/__debug/ping" element={<DebugPing />} />

        {/* Public routes with main layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/booking" element={<BookingHub />} />
          <Route path="/summit" element={<Summit />} />
          <Route path="/coworking" element={<Coworking />} />
          <Route path="/coworking/offices" element={<OfficeListingsHub />} />
          <Route path="/coworking/offices/:slug" element={<OfficeDetailPage />} />
          <Route path="/spa" element={<Spa />} />
          <Route path="/book-with-lindsey" element={<BookWithLindsey />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/dopamine-drop" element={<DopamineDrop />} />
          <Route path="/vip" element={<Vip />} />
          <Route path="/terms/dopamine-drop" element={<DopamineDropTerms />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/beam-lights" element={<BeamLights />} />
          <Route path="/voice-vault" element={<VoiceVault />} />
          <Route path="/360-photo-booth" element={<PhotoBooth />} />
          <Route path="/360-photo-booth/book" element={<PhotoBoothLanding />} />

          {/* Careers Routes */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/spa" element={<CareersSpa />} />
          <Route path="/careers/spa/:role" element={<CareersSpa />} />
          <Route path="/careers/fitness" element={<CareersFitness />} />
          <Route path="/careers/fitness/:role" element={<CareersFitness />} />
          <Route path="/careers/contracting" element={<CareersContracting />} />
          <Route path="/careers/contracting/:role" element={<CareersContracting />} />

          {/* Protected customer routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>

        {/* Auth routes (no layout) */}
        <Route path="/login" element={<Login />} />

        {/* Unified Admin routes - all under /admin/* with staff protection */}
        <Route element={<ProtectedRoute requireStaff />}>
          {/* Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* Command Center (CRM) */}
          <Route path="/admin/leads" element={<CommandCenterLeads />} />
          <Route path="/admin/leads/:id" element={<CommandCenterLeadDetail />} />
          <Route path="/admin/pipeline" element={<CommandCenterPipeline />} />
          <Route path="/admin/employees" element={<CommandCenterEmployees />} />
          <Route path="/admin/employees/:id" element={<CommandCenterEmployeeDetail />} />
          <Route path="/admin/activity" element={<CommandCenterActivity />} />
          <Route path="/admin/alerts" element={<CommandCenterAlerts />} />
          <Route path="/admin/revenue" element={<CommandCenterRevenue />} />
          <Route path="/admin/commissions" element={<CommandCenterCommissions />} />
          <Route path="/admin/payroll" element={<CommandCenterPayroll />} />
          <Route path="/admin/settings" element={<CommandCenterSettings />} />
          
          {/* Booking Operations */}
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/pricing-rules" element={<AdminPricingRules />} />
          <Route path="/admin/blackouts" element={<AdminBlackouts />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/leads-waitlists" element={<AdminLeadsWaitlists />} />
          
          {/* Voice Vault */}
          <Route path="/admin/voice-vault" element={<AdminVoiceVault />} />
          
          {/* Spa / Provider Schedule */}
          <Route path="/admin/my-schedule" element={<AdminProviderSchedule />} />
          
          {/* Coworking (The Hive) */}
          <Route path="/admin/office-listings" element={<AdminOfficeListings />} />
          <Route path="/admin/office-listings/:id/photos" element={<AdminOfficePhotos />} />
          <Route path="/admin/office-promotions" element={<AdminOfficePromotions />} />
          <Route path="/admin/office-inquiries" element={<AdminOfficeInquiries />} />
          
          {/* Hiring */}
          <Route path="/admin/careers" element={<AdminCareerApplications />} />
          
          {/* Marketing */}
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/dopamine-drop" element={<AdminDopamineDrop />} />
          
          {/* System */}
          <Route path="/admin/users-roles" element={<AdminUsersRoles />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/assumptions" element={<AdminAssumptions />} />
        </Route>

        {/* Legacy command-center redirects (for backwards compatibility) */}
        <Route path="/command-center" element={<AdminDashboard />} />
        <Route path="/command-center/*" element={<NotFound />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppInner />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;
