import { Button } from "@/components/ui/button";
import { Building2, User, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import AuthModal from "./AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
  };
  
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
          <Link
            to="/contact" 
            className={`transition-colors ${
              location.pathname === '/contact' 
                ? 'text-primary' 
                : 'text-foreground hover:text-primary'
            }`}
          >
            Contact
          </Link>
        </nav>

        {/* Authentication Section */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {(user.user_metadata?.name || user.email?.split('@')[0] || 'User').split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user.user_metadata?.name || user.email?.split('@')[0] || 'User'}</p>
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button 
            onClick={() => setAuthModalOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6"
          >
            Login / Register
          </Button>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
      />
    </header>
  );
};

export default Header;