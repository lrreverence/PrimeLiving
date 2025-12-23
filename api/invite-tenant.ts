// Vercel Serverless Function for inviting tenants
// Uses Supabase Auth's inviteUserByEmail method (following EMAIL_PASSWORD_SETUP_GUIDE.md)

import { createClient } from '@supabase/supabase-js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Helper function to create contract and assign unit
async function createContractAndAssignUnit(
  supabaseAdmin: any,
  tenantId: number,
  unitId: number
): Promise<any> {
  try {
    // First, verify the unit exists and is available
    const { data: unitData, error: unitCheckError } = await supabaseAdmin
      .from('units')
      .select('unit_id, status')
      .eq('unit_id', unitId)
      .single();

    if (unitCheckError || !unitData) {
      return { error: `Unit ${unitId} not found` };
    }

    // Create contract
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1); // 1 year contract

    const { error: contractError } = await supabaseAdmin
      .from('contracts')
      .insert({
        tenant_id: tenantId,
        unit_id: unitId,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (contractError) {
      return contractError;
    }

    // Update unit status to occupied
    const { error: unitUpdateError } = await supabaseAdmin
      .from('units')
      .update({
        status: 'occupied',
        updated_at: new Date().toISOString()
      })
      .eq('unit_id', unitId);

    if (unitUpdateError) {
      console.error('Error updating unit status:', unitUpdateError);
      // Don't fail the entire operation if unit status update fails
      // The contract was created successfully
    }

    return null; // Success
  } catch (error) {
    console.error('Error in createContractAndAssignUnit:', error);
    return error;
  }
}

export default async function handler(req: any, res: any) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({}).setHeader('Access-Control-Allow-Origin', '*');
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables:', {
        hasUrl: !!SUPABASE_URL,
        hasServiceKey: !!SUPABASE_SERVICE_ROLE_KEY
      });
      return res.status(500).json({
        error: 'Server configuration error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
        hint: 'Please set these environment variables in Vercel project settings'
      });
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Extract data from request body
    const { first_name, last_name, email, contact_number, branch, unit_id } = req.body;

    // Validate required fields
    const missingFields: string[] = [];
    if (!first_name) missingFields.push('first_name');
    if (!last_name) missingFields.push('last_name');
    if (!email) missingFields.push('email');
    if (!branch) missingFields.push('branch');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        received: { 
          first_name: !!first_name, 
          last_name: !!last_name, 
          email: !!email, 
          branch: !!branch
        }
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists using database-level case-insensitive function
    const { data: emailCheck, error: emailCheckError } = await supabaseAdmin
      .rpc('check_email_exists_case_insensitive', { check_email: normalizedEmail })
      .single();

    if (emailCheckError) {
      console.error('Error checking existing email:', emailCheckError);
      // Fall back to direct queries if RPC fails
      const { data: existingManager } = await supabaseAdmin
        .from('apartment_managers')
        .select('email')
        .ilike('email', normalizedEmail)
        .maybeSingle();
      
      const { data: existingTenant } = await supabaseAdmin
        .from('tenants')
        .select('email')
        .ilike('email', normalizedEmail)
        .maybeSingle();

      if (existingManager) {
        return res.status(400).json({
          error: `Email ${email} is already registered as an apartment manager`,
          hint: `Found existing email: ${existingManager.email}. Please use a different email address.`,
          existing_email: existingManager.email
        });
      }

      if (existingTenant) {
        return res.status(400).json({
          error: `Tenant with email ${email} already exists`,
          hint: `Found existing email: ${existingTenant.email}. Please use a different email address.`,
          existing_email: existingTenant.email
        });
      }
    } else if (emailCheck) {
      // Check results from database function
      if (emailCheck.exists_in_managers || emailCheck.manager_email) {
        return res.status(400).json({
          error: `Email ${email} is already registered as an apartment manager`,
          hint: `Found existing email: ${emailCheck.manager_email || email}. Please use a different email address.`,
          existing_email: emailCheck.manager_email || email
        });
      }

      if (emailCheck.exists_in_tenants || emailCheck.tenant_email) {
        return res.status(400).json({
          error: `Tenant with email ${email} already exists`,
          hint: `Found existing email: ${emailCheck.tenant_email || email}. Please use a different email address.`,
          existing_email: emailCheck.tenant_email || email
        });
      }
    }

    // Get SITE_URL for redirect
    const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://prime-living-eosin.vercel.app').replace(/\/$/, '');
    
    // Redirect URL where user will land after clicking email link
    const redirectTo = `${SITE_URL}/auth/callback`;

    // Check if auth user already exists before inviting
    let existingAuthUser = null;
    try {
      const result = await supabaseAdmin.auth.admin.listUsers();
      if (result.data?.users) {
        existingAuthUser = result.data.users.find(u => 
          u.email && u.email.toLowerCase().trim() === normalizedEmail
        );
      }
    } catch (error) {
      console.log('Could not check for existing auth user, will handle in inviteUserByEmail:', error);
    }
    
    if (existingAuthUser) {
      // Check if this user already has a tenant record
      const { data: existingTenantForUser } = await supabaseAdmin
        .from('tenants')
        .select('email, tenant_id')
        .eq('user_id', existingAuthUser.id)
        .maybeSingle();
      
      if (existingTenantForUser) {
        return res.status(400).json({
          error: `Email ${email} is already registered as a tenant`,
          hint: 'This email is already associated with a tenant account.',
          existing_email: existingTenantForUser.email
        });
      }
      
      // User exists in auth but not in tenants - this is an orphaned user
      console.log('Found orphaned auth user, cleaning up:', existingAuthUser.id);
      await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);
    }

    // Use Supabase's inviteUserByEmail (automatically sends invitation email)
    console.log('Inviting tenant with Supabase inviteUserByEmail:', normalizedEmail);
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      normalizedEmail,
      {
        data: {
          name: `${first_name} ${last_name}`,
          role: 'tenant',
          uiRole: 'tenant',
          branch: branch
        },
        redirectTo: redirectTo,
      }
    );

    if (userError) {
      console.error('Error creating user:', userError);
      
      let errorMessage = `Failed to create user: ${userError.message}`;
      if (userError.message?.includes('already registered') || userError.message?.includes('User already registered')) {
        errorMessage = `User with email ${email} already exists in the system. Please use a different email.`;
      } else if (userError.message?.includes('Invalid email')) {
        errorMessage = `Invalid email address: ${email}`;
      }

      return res.status(400).json({
        error: errorMessage,
        details: userError.message,
        code: userError.status || userError.code
      });
    }

    if (!userData.user) {
      return res.status(500).json({ 
        error: 'Failed to create user: No user data returned' 
      });
    }

    // Create tenant record in tenants table
    const { data: tenantData, error: tenantError } = await supabaseAdmin
      .from('tenants')
      .insert({
        user_id: userData.user.id,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: normalizedEmail,
        contact_number: contact_number ? contact_number.trim() : null,
        branch: branch.trim(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('tenant_id')
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      
      // Check if this is a duplicate key error
      const isDuplicateError = tenantError.message?.includes('duplicate key') || 
          tenantError.message?.includes('unique constraint') || 
          tenantError.message?.includes('tenants_email_key') ||
          tenantError.message?.includes('tenants_email_lower_unique') ||
          tenantError.code === '23505';
      
      if (isDuplicateError) {
        // Check if the record actually exists now (might have been created by concurrent request)
        const { data: existingRecord } = await supabaseAdmin
          .from('tenants')
          .select('email, tenant_id, user_id')
          .ilike('email', normalizedEmail)
          .maybeSingle();
        
        if (existingRecord) {
          // Record exists - check if it was created by our user_id (success case) or another request
          if (existingRecord.user_id === userData.user.id) {
            // Our record was created! This is actually success, just a timing issue
            // Now create contract and assign unit
            const tenantId = existingRecord.tenant_id;
            await createContractAndAssignUnit(supabaseAdmin, tenantId, unit_id);
            
            return res.status(200).json({
              success: true,
              message: 'Tenant created and invitation email sent via Supabase',
              user_id: userData.user.id,
              email_service: 'supabase',
              note: 'Record was created successfully (duplicate error was a false positive)'
            });
          } else {
            // Record exists with different user_id - legitimate duplicate
            await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
            return res.status(400).json({
              error: `Email ${email} is already registered${existingRecord.email !== normalizedEmail ? ` (found as: ${existingRecord.email})` : ''}. Please use a different email address.`,
              hint: 'This email address is already in use. Please use a different email address.',
              existing_email: existingRecord.email
            });
          }
        } else {
          // Duplicate error but record doesn't exist - this is a race condition
          await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
          return res.status(400).json({
            error: `Email ${email} registration encountered a conflict. Please try again.`,
            hint: 'This may have been a temporary conflict. Please wait a moment and try again.',
            details: tenantError.message
          });
        }
      } else {
        // Not a duplicate error - some other issue
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        return res.status(400).json({
          error: `Failed to create tenant record: ${tenantError.message}`,
          details: tenantError.message,
          code: tenantError.code,
          hint: 'Please try again or contact support if the issue persists.'
        });
      }
    }

    if (!tenantData || !tenantData.tenant_id) {
      // Clean up auth user if tenant creation failed
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      return res.status(500).json({
        error: 'Failed to create tenant: No tenant data returned'
      });
    }

    // Create contract and assign unit
    const contractError = await createContractAndAssignUnit(
      supabaseAdmin, 
      tenantData.tenant_id, 
      unit_id
    );

    if (contractError) {
      // If contract creation fails, we still have the tenant and auth user
      // Log the error but don't fail the entire operation
      console.error('Error creating contract/assigning unit:', contractError);
      // We'll still return success since the tenant was created and invitation sent
      // The unit can be assigned later manually
    }

    return res.status(200).json({
      success: true,
      message: 'Tenant created and invitation email sent via Supabase',
      user_id: userData.user.id,
      email_service: 'supabase'
    });
  } catch (error) {
    console.error('Error in invite-tenant API:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return res.status(500).json({
      error: errorMessage || 'Internal server error',
      details: errorStack,
      type: error instanceof Error ? error.constructor.name : typeof error
    });
  }
}

