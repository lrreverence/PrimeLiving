import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

/**
 * Determines the user's role by checking:
 * 1. User metadata (role and uiRole)
 * 2. Database tables (apartment_managers, tenants)
 * 
 * Returns: 'super_admin' | 'apartment_manager' | 'tenant' | null
 */
export async function getUserRole(user: User | null): Promise<'super_admin' | 'apartment_manager' | 'tenant' | null> {
  if (!user) return null;

  // First check metadata
  const userRole = user.user_metadata?.role;
  const uiRole = user.user_metadata?.uiRole;

  // Super admin check (highest priority)
  if (uiRole === 'super_admin' || userRole === 'super_admin') {
    return 'super_admin';
  }

  // If metadata says apartment_manager, trust it
  if (uiRole === 'apartment_manager' || userRole === 'apartment_manager') {
    return 'apartment_manager';
  }

  // If metadata says tenant, trust it
  if (uiRole === 'tenant' || userRole === 'tenant') {
    return 'tenant';
  }

  // If metadata is missing or incorrect, check database
  try {
    // Check if user is an apartment manager
    const { data: apartmentManager, error: managerError } = await supabase
      .from('apartment_managers')
      .select('apartment_manager_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (apartmentManager && !managerError) {
      return 'apartment_manager';
    }

    // Check if user is a tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('tenant_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tenant && !tenantError) {
      return 'tenant';
    }
  } catch (error) {
    console.error('Error checking user role in database:', error);
  }

  // Default to tenant if no role found (for backward compatibility)
  return null;
}

