// Update this page (the content is just a fallback if you fail to update the page)

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import UnitTypesSection from "@/components/UnitTypesSection";
import PrimeLocationsSection from "@/components/PrimeLocationsSection";
import Contact from "@/components/Contact";
import { useAuth } from "@/contexts/AuthContext";
import { getUserRole } from "@/lib/userRole";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect logged-in users to their appropriate dashboard
    const redirectUser = async () => {
      if (!isLoading && user) {
        // Clear any old localStorage role
        localStorage.removeItem('user_role');
        
        // Get user's actual role from database and metadata
        const actualRole = await getUserRole(user);
        
        // Redirect based on actual role
        if (actualRole === 'super_admin') {
          navigate('/super-admin-dashboard');
        } else if (actualRole === 'apartment_manager') {
          navigate('/apartment-manager-dashboard');
        } else if (actualRole === 'tenant') {
          navigate('/tenant-dashboard');
        }
        // If no role found, stay on home page
      }
    };

    redirectUser();
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
