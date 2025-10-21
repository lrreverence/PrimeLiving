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
import CaretakerDashboard from "./pages/CaretakerDashboard";
import TenantDashboard from "./pages/TenantDashboard";
import EmailConfirmation from "./pages/EmailConfirmation";
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
                  path="/caretaker-dashboard" 
                  element={
                    <ProtectedRoute requiredRole="caretaker">
                      <CaretakerDashboard />
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
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
