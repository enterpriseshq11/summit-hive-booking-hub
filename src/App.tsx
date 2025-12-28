import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MainLayout, ProtectedRoute } from "@/components/layout";

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
import AdminDashboard from "./pages/admin/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
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
              
              {/* Protected customer routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/account" element={<Account />} />
              </Route>
            </Route>

            {/* Auth routes (no layout) */}
            <Route path="/login" element={<Login />} />

            {/* Admin routes */}
            <Route element={<ProtectedRoute requireStaff />}>
              <Route path="/admin/*" element={<AdminDashboard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
