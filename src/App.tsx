import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";

// Pages
import Index from "./pages/Index";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
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
import ElevatedByElyse from "./pages/shop/ElevatedByElyse";
import BeamLights from "./pages/BeamLights";
import VoiceVault from "./pages/VoiceVault";
import PhotoBooth from "./pages/PhotoBooth";
import PhotoBoothLanding from "./pages/PhotoBoothLanding";
import BookWithWorker from "./pages/BookWithWorker";
import BookVoiceVault from "./pages/BookVoiceVault";
import BookSummit from "./pages/BookSummit";
import BookSpa from "./pages/BookSpa";
import JoinFitness from "./pages/JoinFitness";
import TheHive from "./pages/TheHive";
import NotFound from "./pages/NotFound";
import RequestService from "./pages/RequestService";
import Careers from "./pages/Careers";
import CareersSpa from "./pages/careers/CareersSpa";
import CareersFitness from "./pages/careers/CareersFitness";
import CareersContracting from "./pages/careers/CareersContracting";
import WorkerSignup from "./pages/WorkerSignup";
import AuthCallback from "./pages/AuthCallback";
import BeautyHaven from "./pages/BeautyHaven";

// Debug
import AuthDebug from "./pages/__debug/AuthDebug";
import DebugPing from "./pages/__debug/Ping";

// Admin Pages
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
import AdminIntegrations from "./pages/admin/Integrations";
import AdminPromotions from "./pages/admin/Promotions";
import AdminDopamineDrop from "./pages/admin/DopamineDrop";
import AdminVoiceVault from "./pages/admin/VoiceVault";
import AdminOfficeListings from "./pages/admin/OfficeListings";
import AdminOfficePhotos from "./pages/admin/OfficePhotos";
import AdminOfficePromotions from "./pages/admin/OfficePromotions";
import AdminOfficeInquiries from "./pages/admin/OfficeInquiries";
import AdminProviderSchedule from "./pages/admin/ProviderSchedule";
import AdminPaymentSettings from "./pages/admin/PaymentSettings";
import AdminCareerApplications from "./pages/admin/CareerApplications";
import AdminSpaWorkers from "./pages/admin/SpaWorkers";
import AdminWorkerCalendars from "./pages/admin/WorkerCalendars";
import AdminGHLWebhookTest from "./pages/admin/GHLWebhookTest";
import AdminSpecials from "./pages/admin/Specials";
import AdminAdTracking from "./pages/admin/AdTracking";
import AdminMobileHomesInventory from "./pages/admin/MobileHomesInventory";
import AdminBusinessLeads from "./pages/admin/BusinessLeads";
import AdminBusinessSubPage from "./pages/admin/BusinessSubPage";
import AdminLeadDetail from "./pages/admin/LeadDetail";
import AdminAlertsPage from "./pages/admin/AlertsPage";
import AdminOrphanedFiles from "./pages/admin/OrphanedFiles";
import AdminPhase1Checklist from "./pages/admin/Phase1Checklist";
import AdminStripeMappingPage from "./pages/admin/StripeMappingPage";
import AdminCommissionRulesPage from "./pages/admin/CommissionRulesPage";
import AdminStripeConnectionPage from "./pages/admin/StripeConnectionPage";
import AdminStripeTransactions from "./pages/admin/StripeTransactions";
import AdminFitnessMemberships from "./pages/admin/FitnessMemberships";
import AdminReports from "./pages/admin/Reports";
import AdminErrorLog from "./pages/admin/ErrorLog";
import AdminOnboarding from "./pages/admin/Onboarding";
import AdminMHConnect from "./pages/admin/MHConnect";
import AdminCadences from "./pages/admin/Cadences";
import AdminDeploymentChecklist from "./pages/admin/DeploymentChecklist";
import AdminPlatformGuide from "./pages/admin/PlatformGuide";
import AdminSettingsOverview from "./pages/admin/SettingsOverview";
import IntakePage from "./pages/intake/IntakePage";

// Command Center / CRM Pages
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

// Public Coworking
import OfficeListingsHub from "./pages/coworking/OfficeListingsHub";
import OfficeDetailPage from "./pages/coworking/OfficeDetailPage";

// E3
import E3Dashboard from "./pages/e3/Dashboard";
import E3SubmitEvent from "./pages/e3/SubmitEvent";
import E3MyEvents from "./pages/e3/MyEvents";
import E3BookingDetails from "./pages/e3/BookingDetails";
import E3Calendar from "./pages/e3/Calendar";
import E3AdminDeposits from "./pages/e3/AdminDeposits";
import E3AdminBlackouts from "./pages/e3/AdminBlackouts";
import E3AdminPayouts from "./pages/e3/AdminPayouts";
import E3AdminReports from "./pages/e3/AdminReports";
import E3AdminAudit from "./pages/e3/AdminAudit";
import E3AdminHealth from "./pages/e3/AdminHealth";
import E3AdminCoordinators from "./pages/e3/AdminCoordinators";
import E3Commissions from "./pages/e3/Commissions";

const queryClient = new QueryClient();

function AppInner() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Debug */}
        <Route path="/__debug/auth" element={<AuthDebug />} />
        <Route path="/__debug/ping" element={<DebugPing />} />

        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Index />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/request-service" element={<RequestService />} />
          <Route path="/booking" element={<BookingHub />} />
          <Route path="/summit" element={<Summit />} />
          <Route path="/coworking" element={<Coworking />} />
          <Route path="/coworking/offices" element={<OfficeListingsHub />} />
          <Route path="/coworking/offices/:slug" element={<OfficeDetailPage />} />
          <Route path="/spa" element={<Spa />} />
          <Route path="/book-with/:slug" element={<BookWithWorker />} />
          <Route path="/fitness" element={<Fitness />} />
          <Route path="/gift-cards" element={<GiftCards />} />
          <Route path="/promotions" element={<Promotions />} />
          <Route path="/dopamine-drop" element={<DopamineDrop />} />
          <Route path="/vip" element={<Vip />} />
          <Route path="/terms/dopamine-drop" element={<DopamineDropTerms />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/elevated-by-elyse" element={<ElevatedByElyse />} />
          <Route path="/shop/beam-lights" element={<BeamLights />} />
          <Route path="/voice-vault" element={<VoiceVault />} />
          <Route path="/360-photo-booth" element={<PhotoBooth />} />
          <Route path="/360-photo-booth/book" element={<PhotoBoothLanding />} />
          <Route path="/book-voice-vault" element={<BookVoiceVault />} />
          <Route path="/book-summit" element={<BookSummit />} />
          <Route path="/book-spa" element={<BookSpa />} />
          <Route path="/join-fitness" element={<JoinFitness />} />
          <Route path="/the-hive" element={<TheHive />} />
          <Route path="/beauty-haven" element={<BeautyHaven />} />

          {/* Public Intake Forms */}
          <Route path="/intake/:unit" element={<IntakePage />} />

          {/* Careers */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/spa" element={<CareersSpa />} />
          <Route path="/careers/spa/:role" element={<CareersSpa />} />
          <Route path="/careers/fitness" element={<CareersFitness />} />
          <Route path="/careers/fitness/:role" element={<CareersFitness />} />
          <Route path="/careers/contracting" element={<CareersContracting />} />
          <Route path="/careers/contracting/:role" element={<CareersContracting />} />

          {/* Protected customer */}
          <Route element={<ProtectedRoute />}>
            <Route path="/account" element={<Account />} />
          </Route>
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/worker-signup" element={<WorkerSignup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* E3 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/e3" element={<E3Dashboard />} />
          <Route path="/e3/submit" element={<E3SubmitEvent />} />
          <Route path="/e3/events" element={<E3MyEvents />} />
          <Route path="/e3/bookings/:id" element={<E3BookingDetails />} />
          <Route path="/e3/calendar" element={<E3Calendar />} />
          <Route path="/e3/admin/deposits" element={<E3AdminDeposits />} />
          <Route path="/e3/admin/blackouts" element={<E3AdminBlackouts />} />
          <Route path="/e3/admin/payouts" element={<E3AdminPayouts />} />
          <Route path="/e3/admin/reports" element={<E3AdminReports />} />
          <Route path="/e3/admin/audit" element={<E3AdminAudit />} />
          <Route path="/e3/admin/health" element={<E3AdminHealth />} />
          <Route path="/e3/admin/coordinators" element={<E3AdminCoordinators />} />
          <Route path="/e3/commissions" element={<E3Commissions />} />
        </Route>

        {/* ══════════ ADMIN ROUTES ══════════ */}
        <Route element={<ProtectedRoute requireStaff />}>
          {/* COMMAND CENTER */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/alerts" element={<AdminAlertsPage />} />
          <Route path="/admin/activity" element={<CommandCenterActivity />} />
          <Route path="/admin/activity-log" element={<CommandCenterActivity />} />

          {/* SALES */}
          <Route path="/admin/leads" element={<CommandCenterLeads />} />
          <Route path="/admin/leads/:id" element={<AdminLeadDetail />} />
          <Route path="/admin/pipeline" element={<CommandCenterPipeline />} />
          <Route path="/admin/approvals" element={<AdminApprovals />} />

          {/* OPERATIONS */}
          <Route path="/admin/schedule" element={<AdminSchedule />} />
          <Route path="/admin/resources" element={<AdminResources />} />
          <Route path="/admin/packages" element={<AdminPackages />} />
          <Route path="/admin/blackouts" element={<AdminBlackouts />} />
          <Route path="/admin/documents" element={<AdminDocuments />} />

          {/* TEAM */}
          <Route path="/admin/employees" element={<CommandCenterEmployees />} />
          <Route path="/admin/employees/:id" element={<CommandCenterEmployeeDetail />} />
          <Route path="/admin/payroll" element={<CommandCenterPayroll />} />
          <Route path="/admin/commissions" element={<CommandCenterCommissions />} />
          <Route path="/admin/careers" element={<AdminCareerApplications />} />
          <Route path="/admin/reports" element={<AdminReports />} />

          {/* REVENUE */}
          <Route path="/admin/revenue" element={<CommandCenterRevenue />} />
          <Route path="/admin/revenue/stripe-transactions" element={<AdminStripeTransactions />} />
          <Route path="/admin/pricing-rules" element={<AdminPricingRules />} />
          <Route path="/admin/stripe" element={<AdminPaymentSettings />} />

          {/* ── BUSINESSES: Summit ── */}
          <Route path="/admin/business/summit/leads" element={<AdminBusinessLeads />} />
          <Route path="/admin/business/summit/bookings" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/summit/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/summit/settings" element={<AdminBusinessSubPage />} />

          {/* ── BUSINESSES: Spa ── */}
          <Route path="/admin/business/spa/leads" element={<AdminBusinessLeads />} />
          <Route path="/admin/business/spa/bookings" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/spa/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/spa/workers" element={<AdminSpaWorkers />} />
          <Route path="/admin/business/spa/worker-calendars" element={<AdminWorkerCalendars />} />
          <Route path="/admin/business/spa/settings" element={<AdminBusinessSubPage />} />

          {/* ── BUSINESSES: Fitness ── */}
          <Route path="/admin/business/fitness/memberships" element={<AdminFitnessMemberships />} />
          <Route path="/admin/business/fitness/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/fitness/settings" element={<AdminBusinessSubPage />} />

          {/* ── BUSINESSES: Hive ── */}
          <Route path="/admin/business/hive/office-listings" element={<AdminOfficeListings />} />
          <Route path="/admin/business/hive/inquiries" element={<AdminOfficeInquiries />} />
          <Route path="/admin/business/hive/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/hive/settings" element={<AdminBusinessSubPage />} />

          {/* ── BUSINESSES: Voice Vault ── */}
          <Route path="/admin/business/voice-vault/bookings" element={<AdminVoiceVault />} />
          <Route path="/admin/business/voice-vault/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/voice-vault/settings" element={<AdminBusinessSubPage />} />

          {/* ── BUSINESSES: Mobile Homes ── */}
          <Route path="/admin/business/mobile-homes/inventory" element={<AdminMobileHomesInventory />} />
          <Route path="/admin/business/mobile-homes/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/mobile-homes/settings" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/mobile-homes/mh-connect" element={<AdminMHConnect />} />

          {/* ── BUSINESSES: Elevated by Elyse ── */}
          <Route path="/admin/business/elevated-by-elyse/leads" element={<AdminBusinessLeads />} />
          <Route path="/admin/business/elevated-by-elyse/bookings" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/elevated-by-elyse/revenue" element={<AdminBusinessSubPage />} />
          <Route path="/admin/business/elevated-by-elyse/settings" element={<AdminBusinessSubPage />} />

          {/* MARKETING */}
          <Route path="/admin/marketing/promotions" element={<AdminPromotions />} />
          <Route path="/admin/marketing/dopamine-drop" element={<AdminDopamineDrop />} />
          <Route path="/admin/marketing/ad-tracking" element={<AdminAdTracking />} />

          {/* Legacy marketing paths */}
          <Route path="/admin/promotions" element={<AdminPromotions />} />
          <Route path="/admin/dopamine-drop" element={<AdminDopamineDrop />} />
          <Route path="/admin/ad-tracking" element={<AdminAdTracking />} />

          {/* SETTINGS (owner-only — requireOwner guard blocks all non-owners before component mounts) */}
        </Route>
        <Route element={<ProtectedRoute requireOwner />}>
          <Route path="/admin/settings" element={<AdminSettingsOverview />} />
          <Route path="/admin/settings/users" element={<AdminUsersRoles />} />
          <Route path="/admin/settings/payment" element={<AdminPaymentSettings />} />
          <Route path="/admin/settings/integrations" element={<AdminIntegrations />} />
          <Route path="/admin/settings/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/settings/assumptions" element={<AdminAssumptions />} />
          <Route path="/admin/settings/orphaned-files" element={<AdminOrphanedFiles />} />
          <Route path="/admin/settings/phase1-checklist" element={<AdminPhase1Checklist />} />
          <Route path="/admin/settings/stripe-mapping" element={<AdminStripeMappingPage />} />
          <Route path="/admin/commissions/rules" element={<AdminCommissionRulesPage />} />
          <Route path="/admin/settings/stripe-connection" element={<AdminStripeConnectionPage />} />
          <Route path="/admin/settings/error-log" element={<AdminErrorLog />} />
          <Route path="/admin/settings/cadences" element={<AdminCadences />} />
          <Route path="/admin/settings/deployment-checklist" element={<AdminDeploymentChecklist />} />
          <Route path="/admin/settings/platform-guide" element={<AdminPlatformGuide />} />
          <Route path="/admin/onboarding" element={<AdminOnboarding />} />

          {/* Legacy admin routes */}
          <Route path="/admin/users-roles" element={<AdminUsersRoles />} />
          <Route path="/admin/audit-log" element={<AdminAuditLog />} />
          <Route path="/admin/assumptions" element={<AdminAssumptions />} />
          <Route path="/admin/integrations" element={<AdminIntegrations />} />
          <Route path="/admin/payment-settings" element={<AdminPaymentSettings />} />
          <Route path="/admin/spa-workers" element={<AdminSpaWorkers />} />
          <Route path="/admin/worker-calendars" element={<AdminWorkerCalendars />} />
          <Route path="/admin/office-listings" element={<AdminOfficeListings />} />
          <Route path="/admin/office-listings/:id/photos" element={<AdminOfficePhotos />} />
          <Route path="/admin/office-promotions" element={<AdminOfficePromotions />} />
          <Route path="/admin/office-inquiries" element={<AdminOfficeInquiries />} />
          <Route path="/admin/voice-vault" element={<AdminVoiceVault />} />
          <Route path="/admin/my-schedule" element={<AdminProviderSchedule />} />
          <Route path="/admin/ghl-webhook-test" element={<AdminGHLWebhookTest />} />
          <Route path="/admin/specials" element={<AdminSpecials />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/leads-waitlists" element={<AdminLeadsWaitlists />} />

          {/* Catch-all for /admin/business/:unit/:page stubs */}
          <Route path="/admin/business/:unit/:page" element={<AdminBusinessSubPage />} />
        </Route>

        {/* Legacy redirects */}
        <Route path="/command-center" element={<AdminDashboard />} />
        <Route path="/command-center/*" element={<NotFound />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
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
