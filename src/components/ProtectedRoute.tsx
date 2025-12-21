import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'tenant' | 'apartment_manager' | 'landlord';
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
        (requiredRole === 'apartment_manager' && userRole === 'landlord') ||
        (requiredRole === 'landlord' && uiRole === 'apartment_manager');

      // Only redirect if user has wrong role, don't redirect if no user (let them see login)
      if (!hasCorrectRole) {
        // Redirect to appropriate dashboard based on user's actual role
        if (uiRole === 'apartment_manager' || userRole === 'landlord' || userRole === 'apartment_manager') {
          navigate('/apartment-manager-dashboard');
        } else if (uiRole === 'tenant' || userRole === 'tenant') {
          navigate('/tenant-dashboard');
        } else {
          // If no role is set and trying to access apartment manager dashboard, redirect to tenant
          if (requiredRole === 'apartment_manager') {
            navigate('/tenant-dashboard');
          }
          // If trying to access tenant dashboard without role, allow it (handled in render)
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
    (requiredRole === 'apartment_manager' && userRole === 'landlord') ||
    (requiredRole === 'landlord' && uiRole === 'apartment_manager');

  // If user has correct role, allow access
  if (hasCorrectRole) {
    return <>{children}</>;
  }

  // If no role is set and trying to access tenant dashboard, allow access
  if (requiredRole === 'tenant' && !userRole && !uiRole) {
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