import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Locations from "./pages/Locations";
import ContactPage from "./pages/Contact";
import ApartmentManagerDashboard from "./pages/ApartmentManagerDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import EmailConfirmation from "./pages/EmailConfirmation";
import SetupPassword from "./pages/SetupPassword";
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
                <Route path="/" element={<Index />} />
                <Route path="/locations" element={<Locations />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route 
                  path="/apartment-manager-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="apartment_manager">
                      <ApartmentManagerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tenant-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="tenant">
                      <TenantDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/super-admin-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="super_admin">
                      <SuperAdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                <Route path="/setup-password" element={<SetupPassword />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
