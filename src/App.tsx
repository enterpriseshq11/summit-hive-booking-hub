import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, ProtectedRoute } from "@/components/layout";
import ErrorBoundary from "@/components/ErrorBoundary";

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
import NotFound from "./pages/NotFound";

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
import AdminPromotions from "./pages/admin/Promotions";
import AdminDopamineDrop from "./pages/admin/DopamineDrop";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes with main layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/booking" element={<BookingHub />} />
                <Route path="/summit" element={<Summit />} />
                <Route path="/coworking" element={<Coworking />} />
                <Route path="/spa" element={<Spa />} />
                <Route path="/fitness" element={<Fitness />} />
                <Route path="/gift-cards" element={<GiftCards />} />
                <Route path="/promotions" element={<Promotions />} />
                <Route path="/dopamine-drop" element={<DopamineDrop />} />
                <Route path="/vip" element={<Vip />} />
                <Route path="/terms/dopamine-drop" element={<DopamineDropTerms />} />
                
                {/* Protected customer routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/account" element={<Account />} />
                </Route>
              </Route>

              {/* Auth routes (no layout) */}
              <Route path="/login" element={<Login />} />

              {/* Admin routes - each with ProtectedRoute check */}
              <Route element={<ProtectedRoute requireStaff />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/schedule" element={<AdminSchedule />} />
                <Route path="/admin/approvals" element={<AdminApprovals />} />
                <Route path="/admin/resources" element={<AdminResources />} />
                <Route path="/admin/packages" element={<AdminPackages />} />
                <Route path="/admin/pricing-rules" element={<AdminPricingRules />} />
                <Route path="/admin/blackouts" element={<AdminBlackouts />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/admin/reviews" element={<AdminReviews />} />
                <Route path="/admin/leads-waitlists" element={<AdminLeadsWaitlists />} />
                <Route path="/admin/users-roles" element={<AdminUsersRoles />} />
                <Route path="/admin/audit-log" element={<AdminAuditLog />} />
                <Route path="/admin/assumptions" element={<AdminAssumptions />} />
                <Route path="/admin/promotions" element={<AdminPromotions />} />
                <Route path="/admin/dopamine-drop" element={<AdminDopamineDrop />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
