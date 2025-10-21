import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'tenant' | 'caretaker' | 'landlord';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/'
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user && requiredRole) {
      const userRole = user.user_metadata?.role;
      const uiRole = user.user_metadata?.uiRole;
      
      // Check both database role and UI role
      const hasCorrectRole = 
        userRole === requiredRole || 
        uiRole === requiredRole ||
        (requiredRole === 'caretaker' && userRole === 'landlord') ||
        (requiredRole === 'landlord' && uiRole === 'caretaker');

      // Only redirect if user has wrong role, don't redirect if no user (let them see login)
      if (!hasCorrectRole) {
        // Redirect to appropriate dashboard based on user's actual role
        if (uiRole === 'caretaker' || userRole === 'landlord') {
          navigate('/caretaker-dashboard');
        } else if (uiRole === 'tenant' || userRole === 'tenant') {
          navigate('/tenant-dashboard');
        } else {
          navigate(redirectTo);
        }
      }
    }
  }, [user, isLoading, requiredRole, navigate, redirectTo]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // If no user, let the component handle it (show login, etc.)
  if (!user) {
    return <>{children}</>;
  }

  // If user exists and has correct role (or no role required), render children
  if (!requiredRole) {
    return <>{children}</>;
  }

  const userRole = user.user_metadata?.role;
  const uiRole = user.user_metadata?.uiRole;
  
  const hasCorrectRole = 
    userRole === requiredRole || 
    uiRole === requiredRole ||
    (requiredRole === 'caretaker' && userRole === 'landlord') ||
    (requiredRole === 'landlord' && uiRole === 'caretaker');

  if (hasCorrectRole) {
    return <>{children}</>;
  }

  // If wrong role, show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
  );
};

export default ProtectedRoute;