import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRole } from '@/lib/userRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'tenant' | 'apartment_manager' | 'super_admin';
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  redirectTo = '/'
}) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [roleCheck, setRoleCheck] = useState<{
    role: 'super_admin' | 'apartment_manager' | 'tenant' | null;
    loading: boolean;
  }>({ role: null, loading: true });

  // Check user role when user or requiredRole changes
  useEffect(() => {
    const checkRole = async () => {
      if (isLoading) {
        return;
      }

      if (!user) {
        setRoleCheck({ role: null, loading: false });
        return;
      }

      if (!requiredRole) {
        setRoleCheck({ role: null, loading: false });
        return;
      }

      const actualRole = await getUserRole(user);
      setRoleCheck({ role: actualRole, loading: false });
      
      // Super admins should always go to their own dashboard
      if (actualRole === 'super_admin' && requiredRole !== 'super_admin') {
        navigate('/super-admin-dashboard');
        return;
      }
      
      // Check if user has the correct role
      const hasCorrectRole = actualRole === requiredRole;

      // Only redirect if user has wrong role
      if (!hasCorrectRole) {
        // Redirect to appropriate dashboard based on user's actual role
        if (actualRole === 'super_admin') {
          navigate('/super-admin-dashboard');
        } else if (actualRole === 'apartment_manager') {
          navigate('/apartment-manager-dashboard');
        } else if (actualRole === 'tenant') {
          navigate('/tenant-dashboard');
        } else {
          // If no role is set and trying to access apartment manager dashboard, redirect to tenant
          if (requiredRole === 'apartment_manager') {
            navigate('/tenant-dashboard');
          }
        }
      }
    };

    checkRole();
  }, [user, isLoading, requiredRole, navigate, redirectTo]);

  // Show loading while checking auth or role
  if (isLoading || roleCheck.loading) {
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

  // Super admins should always go to their own dashboard
  if (roleCheck.role === 'super_admin' && requiredRole !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  
  const hasCorrectRole = roleCheck.role === requiredRole;

  // If user has correct role, allow access
  if (hasCorrectRole) {
    return <>{children}</>;
  }

  // If no role is set and trying to access tenant dashboard, allow access
  if (requiredRole === 'tenant' && !roleCheck.role) {
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