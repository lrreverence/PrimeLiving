// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UnitTypesSection from "@/components/UnitTypesSection";
import PrimeLocationsSection from "@/components/PrimeLocationsSection";
import Contact from "@/components/Contact";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect logged-in users to their appropriate dashboard
    if (!isLoading && user) {
      const userRole = user.user_metadata?.role;
      const uiRole = user.user_metadata?.uiRole;
      
      // Clear any old localStorage role
      localStorage.removeItem('user_role');
      
      // Redirect super admins to their dashboard
      if (uiRole === 'super_admin' || userRole === 'super_admin') {
        navigate('/super-admin-dashboard');
        return;
      }
      
      // Redirect apartment managers
      if (uiRole === 'apartment_manager' || userRole === 'apartment_manager') {
        navigate('/apartment-manager-dashboard');
        return;
      }
      
      // Redirect tenants
      if (uiRole === 'tenant' || userRole === 'tenant') {
        navigate('/tenant-dashboard');
        return;
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <UnitTypesSection />
      <PrimeLocationsSection />
      <Contact />
    </div>
  );
};

export default Index;
