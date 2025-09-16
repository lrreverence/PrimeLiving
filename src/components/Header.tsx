import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="w-full px-6 py-4 bg-background border-b border-border/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-foreground" />
          <span className="text-xl font-semibold text-foreground">PrimeLiving</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#apartments" className="text-foreground hover:text-primary transition-colors">
            Apartments
          </a>
          <Link
            to="/locations" 
            className={`transition-colors ${
              location.pathname === '/locations' 
                ? 'text-primary' 
                : 'text-foreground hover:text-primary'
            }`}
          >
            Locations
          </Link>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">
            Contact
          </a>
        </nav>

        {/* Login/Register Button */}
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6">
          Login / Register
        </Button>
      </div>
    </header>
  );
};

export default Header;