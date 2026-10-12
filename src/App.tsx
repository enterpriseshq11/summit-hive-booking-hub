import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ScrollToTop } from "@/components/ScrollToTop";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";

// Pages
import HomePage from "./pages/HomePage";
import BuildHere from "./pages/BuildHere";
import About from "./pages/About";
import SpaHolding from "./pages/SpaHolding";
const FamilyHub = lazy(() => import("./pages/FamilyHub"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BookingHub = lazy(() => import("./pages/BookingHub"));
const Login = lazy(() => import("./pages/Login"));
const Account = lazy(() => import("./pages/Account"));
const Coworking = lazy(() => import("./pages/Coworking"));
const GymPage = lazy(() => import("./pages/GymPage"));
const GiftCards = lazy(() => import("./pages/GiftCards"));
const Promotions = lazy(() => import("./pages/Promotions"));
const DopamineDrop = lazy(() => import("./pages/DopamineDrop"));
const Vip = lazy(() => import("./pages/Vip"));
const DopamineDropTerms = lazy(() => import("./pages/DopamineDropTerms"));
const Shop = lazy(() => import("./pages/Shop"));
const ElevatedByElyse = lazy(() => import("./pages/shop/ElevatedByElyse"));
const BeamLights = lazy(() => import("./pages/BeamLights"));
const VoiceVault = lazy(() => import("./pages/VoiceVault"));
const PhotoBooth = lazy(() => import("./pages/PhotoBooth"));
const PhotoBoothLanding = lazy(() => import("./pages/PhotoBoothLanding"));
const BookWithWorker = lazy(() => import("./pages/BookWithWorker"));
const BookVoiceVault = lazy(() => import("./pages/BookVoiceVault"));
const JoinFitness = lazy(() => import("./pages/JoinFitness"));
const TheHive = lazy(() => import("./pages/TheHive"));
import NotFound from "./pages/NotFound";
const RequestService = lazy(() => import("./pages/RequestService"));
const Careers = lazy(() => import("./pages/Careers"));
const CareersFitness = lazy(() => import("./pages/careers/CareersFitness"));
const CareersContracting = lazy(() => import("./pages/careers/CareersContracting"));
const WorkerSignup = lazy(() => import("./pages/WorkerSignup"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Debug
const AuthDebug = lazy(() => import("./pages/__debug/AuthDebug"));
const DebugPing = lazy(() => import("./pages/__debug/Ping"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminSchedule = lazy(() => import("./pages/admin/Schedule"));
const AdminApprovals = lazy(() => import("./pages/admin/Approvals"));
const AdminResources = lazy(() => import("./pages/admin/Resources"));
const AdminPackages = lazy(() => import("./pages/admin/Packages"));
const AdminPricingRules = lazy(() => import("./pages/admin/PricingRules"));
const AdminBlackouts = lazy(() => import("./pages/admin/Blackouts"));
const AdminDocuments = lazy(() => import("./pages/admin/Documents"));
const AdminReviews = lazy(() => import("./pages/admin/Reviews"));
const AdminLeadsWaitlists = lazy(() => import("./pages/admin/LeadsWaitlists"));
const AdminUsersRoles = lazy(() => import("./pages/admin/UsersRoles"));
const AdminAuditLog = lazy(() => import("./pages/admin/AuditLog"));
const AdminAssumptions = lazy(() => import("./pages/admin/Assumptions"));
const AdminIntegrations = lazy(() => import("./pages/admin/Integrations"));
const AdminPromotions = lazy(() => import("./pages/admin/Promotions"));
const AdminDopamineDrop = lazy(() => import("./pages/admin/DopamineDrop"));
const AdminVoiceVault = lazy(() => import("./pages/admin/VoiceVault"));
const AdminOfficeListings = lazy(() => import("./pages/admin/OfficeListings"));
const AdminOfficePhotos = lazy(() => import("./pages/admin/OfficePhotos"));
const AdminOfficePromotions = lazy(() => import("./pages/admin/OfficePromotions"));
const AdminOfficeInquiries = lazy(() => import("./pages/admin/OfficeInquiries"));
const AdminProviderSchedule = lazy(() => import("./pages/admin/ProviderSchedule"));
const AdminPaymentSettings = lazy(() => import("./pages/admin/PaymentSettings"));
const AdminCareerApplications = lazy(() => import("./pages/admin/CareerApplications"));
const AdminSpaWorkers = lazy(() => import("./pages/admin/SpaWorkers"));
const AdminWorkerCalendars = lazy(() => import("./pages/admin/WorkerCalendars"));
const AdminGHLWebhookTest = lazy(() => import("./pages/admin/GHLWebhookTest"));
const AdminSpecials = lazy(() => import("./pages/admin/Specials"));
const AdminAdTracking = lazy(() => import("./pages/admin/AdTracking"));
const AdminMobileHomesInventory = lazy(() => import("./pages/admin/MobileHomesInventory"));
const AdminBusinessLeads = lazy(() => import("./pages/admin/BusinessLeads"));
const AdminBusinessSubPage = lazy(() => import("./pages/admin/BusinessSubPage"));
const AdminLeadDetail = lazy(() => import("./pages/admin/LeadDetail"));
const AdminAlertsPage = lazy(() => import("./pages/admin/AlertsPage"));
const AdminOrphanedFiles = lazy(() => import("./pages/admin/OrphanedFiles"));
const AdminPhase1Checklist = lazy(() => import("./pages/admin/Phase1Checklist"));
const AdminStripeMappingPage = lazy(() => import("./pages/admin/StripeMappingPage"));
const AdminCommissionRulesPage = lazy(() => import("./pages/admin/CommissionRulesPage"));
const AdminStripeConnectionPage = lazy(() => import("./pages/admin/StripeConnectionPage"));
const AdminStripeTransactions = lazy(() => import("./pages/admin/StripeTransactions"));
const AdminFitnessMemberships = lazy(() => import("./pages/admin/FitnessMemberships"));
const AdminReports = lazy(() => import("./pages/admin/Reports"));
const AdminErrorLog = lazy(() => import("./pages/admin/ErrorLog"));
const AdminOnboarding = lazy(() => import("./pages/admin/Onboarding"));
const AdminMHConnect = lazy(() => import("./pages/admin/MHConnect"));
const AdminCadences = lazy(() => import("./pages/admin/Cadences"));
const AdminDeploymentChecklist = lazy(() => import("./pages/admin/DeploymentChecklist"));
const AdminPlatformGuide = lazy(() => import("./pages/admin/PlatformGuide"));
const AdminSettingsOverview = lazy(() => import("./pages/admin/SettingsOverview"));
const IntakePage = lazy(() => import("./pages/intake/IntakePage"));

// Command Center / CRM Pages
const CommandCenterLeads = lazy(() => import("./pages/command-center/Leads"));
const CommandCenterLeadDetail = lazy(() => import("./pages/command-center/LeadDetail"));
const CommandCenterPipeline = lazy(() => import("./pages/command-center/Pipeline"));
const CommandCenterEmployees = lazy(() => import("./pages/command-center/Employees"));
const CommandCenterEmployeeDetail = lazy(() => import("./pages/command-center/EmployeeDetail"));
const CommandCenterActivity = lazy(() => import("./pages/command-center/Activity"));
const CommandCenterAlerts = lazy(() => import("./pages/command-center/Alerts"));
const CommandCenterRevenue = lazy(() => import("./pages/command-center/Revenue"));
const CommandCenterCommissions = lazy(() => import("./pages/command-center/Commissions"));
const CommandCenterSettings = lazy(() => import("./pages/command-center/Settings"));
const CommandCenterPayroll = lazy(() => import("./pages/command-center/Payroll"));

// Public Coworking
const OfficeListingsHub = lazy(() => import("./pages/coworking/OfficeListingsHub"));
const OfficeDetailPage = lazy(() => import("./pages/coworking/OfficeDetailPage"));

// E3
const E3Dashboard = lazy(() => import("./pages/e3/Dashboard"));
const E3SubmitEvent = lazy(() => import("./pages/e3/SubmitEvent"));
const E3MyEvents = lazy(() => import("./pages/e3/MyEvents"));
const E3BookingDetails = lazy(() => import("./pages/e3/BookingDetails"));
const E3Calendar = lazy(() => import("./pages/e3/Calendar"));
const E3AdminDeposits = lazy(() => import("./pages/e3/AdminDeposits"));
const E3AdminBlackouts = lazy(() => import("./pages/e3/AdminBlackouts"));
const E3AdminPayouts = lazy(() => import("./pages/e3/AdminPayouts"));
const E3AdminReports = lazy(() => import("./pages/e3/AdminReports"));
const E3AdminAudit = lazy(() => import("./pages/e3/AdminAudit"));
const E3AdminHealth = lazy(() => import("./pages/e3/AdminHealth"));
const E3AdminCoordinators = lazy(() => import("./pages/e3/AdminCoordinators"));
const E3Commissions = lazy(() => import("./pages/e3/Commissions"));

const queryClient = new QueryClient();

function AppInner() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Debug */}
        <Route path="/__debug/auth" element={<AuthDebug />} />
        <Route path="/__debug/ping" element={<DebugPing />} />

        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<BuildHere />} />
          <Route path="/about" element={<About />} />
          <Route path="/gym" element={<GymPage />} />
          <Route path="/zero-gravity" element={<Navigate to="/gym" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/request-service" element={<RequestService />} />
          <Route path="/booking" element={<BookingHub />} />
          {/* Retired routes. Old page files stay in the repo, unreferenced. */}
          <Route path="/summit" element={<Navigate to="/" replace />} />
          <Route path="/coworking" element={<Coworking />} />
          <Route path="/family-hub" element={<FamilyHub />} />
          <Route path="/coworking/offices" element={<OfficeListingsHub />} />
          <Route path="/coworking/offices/:slug" element={<OfficeDetailPage />} />
          <Route path="/spa" element={<SpaHolding />} />
          <Route path="/book-with/:slug" element={<BookWithWorker />} />
          <Route path="/fitness" element={<Navigate to="/gym" replace />} />
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
          <Route path="/book-summit" element={<Navigate to="/" replace />} />
          <Route path="/book-spa" element={<Navigate to="/spa" replace />} />
          <Route path="/join-fitness" element={<JoinFitness />} />
          <Route path="/the-hive" element={<TheHive />} />
          <Route path="/beauty-haven" element={<Navigate to="/spa" replace />} />
          <Route path="/beauty-haven/nails" element={<Navigate to="/spa" replace />} />

          {/* Public Intake Forms */}
          <Route path="/intake/:unit" element={<IntakePage />} />

          {/* Careers */}
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/spa" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/spa/:role" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/fitness" element={<CareersFitness />} />
          <Route path="/careers/fitness/:role" element={<CareersFitness />} />
          <Route path="/careers/contracting" element={<CareersContracting />} />
          <Route path="/careers/contracting/:role" element={<CareersContracting />} />
          <Route path="/careers/high-maintenance" element={<Navigate to="/careers" replace />} />
          <Route path="/careers/high-maintenance/:role" element={<Navigate to="/careers" replace />} />

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

          {/* SETTINGS (owner-only. requireOwner guard blocks all non-owners before component mounts) */}
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
      </Suspense>
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
